import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, minLength: 3, maxLength: 10 },
  password: { type: String, required: true },
  // ref = model
  friends: [{ type: Schema.Types.ObjectId, ref: "users" }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: "users" }],
  picture: { type: String },
  // Add bio?
  bio: { type: String }
});

export default mongoose.model("users", UserSchema);
