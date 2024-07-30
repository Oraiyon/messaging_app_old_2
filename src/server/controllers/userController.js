import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { unlink } from "node:fs/promises";

// dest starts from root directory
const upload = multer({ dest: "./src/server/public/uploads" });

dotenv.config();

cloudinary.config({
  // Put in Railway
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const post_signup = [
  body("username", "Username must be at least 3 characters long.")
    .trim()
    .isLength({ min: 3 })
    .toLowerCase()
    .escape(),
  body("password", "Username must be at least 6 characters long")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("confirmPassword", "Confirm password must match your password")
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    }),
  expressAsyncHandler(async (req, res) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      } else {
        const errors = validationResult(req);
        const user = new User({
          username: req.body.username,
          password: hashedPassword
        });
        // Checks if username is already taken
        const usernameTaken = await User.findOne({ username: user.username }).exec();
        if (!errors.isEmpty() || usernameTaken) {
          res.redirect("/signup");
          return;
        }
        await user.save();
        res.redirect("/login");
      }
    });
  })
];

export const post_login = [
  expressAsyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.body.username }).exec();
    if (!user) {
      res.json(user);
      return;
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      res.json(match);
      return;
    }
    next();
  }),
  passport.authenticate("local"),
  (req, res, next) => {
    res.json(req.user);
  }
];

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

export const get_profile = expressAsyncHandler(async (req, res, next) => {
  if (req.user) {
    const user = await User.findById(req.params.id).populate("friends").exec();
    res.json(user);
  }
});

export const get_search_profile = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username }).exec();
  res.json(user);
});

export const post_send_friend_request = expressAsyncHandler(async (req, res, next) => {
  const [sender, receiver] = await Promise.all([
    User.findById(req.params.sender).populate("friends").exec(),
    User.findById(req.params.receiver).exec()
  ]);
  for (const request of sender.friendRequests) {
    if (
      request.receiver.username === sender.username ||
      request.receiver.username === receiver.username
    ) {
      return;
    }
  }
  // Remove username?
  sender.friendRequests = [
    ...sender.friendRequests,
    {
      sender: { username: sender.username, id: sender._id },
      receiver: { username: receiver.username, id: receiver._id }
    }
  ];
  receiver.friendRequests = [
    ...receiver.friendRequests,
    {
      sender: { username: sender.username, id: sender._id },
      receiver: { username: receiver.username, id: receiver._id }
    }
  ];
  await sender.save();
  await receiver.save();
  res.json(sender);
});

export const put_remove_friend_request = expressAsyncHandler(async (req, res, next) => {
  const [sender, receiver] = await Promise.all([
    User.findById(req.params.sender).populate("friends").exec(),
    User.findById(req.params.receiver).exec()
  ]);
  const newFriendRequestsSender = sender.friendRequests.filter((request) =>
    sender.username === request.sender.username
      ? request.receiver.username !== receiver.username
      : request.sender.username !== receiver.username
  );
  const newFriendRequestsReceiver = receiver.friendRequests.filter((request) =>
    receiver.username === request.receiver.username
      ? request.sender.username !== sender.username
      : request.receiver.username !== sender.username
  );
  sender.friendRequests = newFriendRequestsSender;
  receiver.friendRequests = newFriendRequestsReceiver;
  await sender.save();
  await receiver.save();
  res.json(sender);
});

export const put_accept_friend_request = [
  expressAsyncHandler(async (req, res, next) => {
    const [sender, receiver] = await Promise.all([
      User.findById(req.params.sender).exec(),
      User.findById(req.params.receiver).exec()
    ]);
    const newFriendRequestsSender = sender.friendRequests.filter((request) =>
      sender.username === request.sender.username
        ? request.receiver.username !== receiver.username
        : request.sender.username !== receiver.username
    );
    const newFriendRequestsReceiver = receiver.friendRequests.filter((request) =>
      receiver.username === request.receiver.username
        ? request.sender.username !== sender.username
        : request.receiver.username !== sender.username
    );
    sender.friendRequests = newFriendRequestsSender;
    receiver.friendRequests = newFriendRequestsReceiver;
    sender.friends = [receiver._id, ...sender.friends];
    receiver.friends = [sender._id, ...receiver.friends];
    await sender.save();
    await receiver.save();
    next();
  }),
  expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.sender).populate("friends").exec();
    res.json(user);
  })
];

export const put_remove_friend = expressAsyncHandler(async (req, res, next) => {
  const [user, friendUser] = await Promise.all([
    User.findById(req.params.id).populate("friends").exec(),
    User.findById(req.params.friend).populate("friends").exec()
  ]);
  const newUserFriends = user.friends.filter((friend) => friend.username !== friendUser.username);
  const newFriendUserFriends = friendUser.friends.filter(
    (friend) => friend.username !== user.username
  );
  user.friends = newUserFriends;
  friendUser.friends = newFriendUserFriends;
  await user.save();
  await friendUser.save();
  res.json(user);
});

export const put_edit_username = [
  body("editName", "Invalid username").trim().isLength({ min: 3 }).escape(),
  expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate("friends").exec();
    const usernameTaken = await User.findOne({ username: req.body.editName }).exec();
    const errors = validationResult(req);
    if (!errors.isEmpty() || usernameTaken || req.body.editName === user.username) {
      res.json(false);
      return;
    }
    user.username = req.body.editName;
    await user.save();
    res.json(user);
  })
];

export const post_change_picture = [
  upload.single("file"),
  expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate("friends").exec();
    await cloudinary.uploader.destroy(`messaging_app_profile_pictures/${user._id}`);
    const imageURL = await cloudinary.uploader.upload(req.file.path, {
      folder: "messaging_app_profile_pictures",
      public_id: user._id
    });
    user.picture = imageURL.secure_url;
    await unlink(req.file.path);
    await user.save();
    res.json(user);
  })
];

export const put_change_picture = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate("friends").exec();
  user.picture = null;
  await cloudinary.uploader.destroy(`messaging_app_profile_pictures/${user._id}`);
  await user.save();
  res.json(user);
});

export default post_signup;
