import { useOutletContext } from "react-router-dom";
import styles from "../stylesheets/Account.module.css";
import { useRef, useState } from "react";
import Header from "./Header";
import DisplayProfilePicture from "./DisplayProfilePicture";

const Account = () => {
  const [
    user,
    setUser,
    foundUser,
    setFoundUser,
    currentChat,
    setCurrentChat,
    currentMessages,
    setCurrentMessages,
    searchUserInput,
    sidebarContainer
  ] = useOutletContext();

  const [userUsername, setUserUsername] = useState(user.username);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [userBio, setUserBio] = useState(user.bio ? user.bio : "");

  const invalidUsername = useRef(null);
  const formRef = useRef(null);

  const submitEditName = async () => {
    if (userUsername === user.username) {
      return;
    }
    if (!userUsername || userUsername.length < 3 || userUsername.length > 10) {
      invalidUsername.current.style.display = "flex";
      return;
    }
    const fetchUser = await fetch(`/api/${user._id}/profile/account/username`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editName: userUsername })
    });
    const data = await fetchUser.json();
    if (data) {
      setUser(data);
    } else {
      invalidUsername.current.style.display = "flex";
    }
  };

  const changeProfilePicture = async (e) => {
    try {
      if (formRef.current.children[1].children[0].value) {
        const formData = new FormData();
        formData.append("file", formRef.current.children[1].children[0].files[0]);
        const fetchUser = await fetch(`/api/${user._id}/profile/account/picture`, {
          method: "POST",
          body: formData
        });
        const data = await fetchUser.json();
        setUser(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setProfilePictureToDefault = async () => {
    try {
      if (user.picture) {
        const fetchUser = await fetch(`/api/${user._id}/profile/account/picture`, {
          method: "PUT"
        });
        const data = await fetchUser.json();
        setUser(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const SetToDefaultPicture = () => {
    if (user.picture) {
      return (
        <div className={styles.default_picture_button}>
          <button onClick={setProfilePictureToDefault}>Set Profile Picture To Default</button>
        </div>
      );
    }
  };

  const ProfilePictureForm = () => {
    if (user) {
      return (
        // Resets when username is edited because the edit causes a state change
        <form action="" ref={formRef} className={styles.profile_picture_form}>
          <label htmlFor="picture">Profile Picture</label>
          <div>
            <input
              type="file"
              name="picture"
              id="picture"
              // onChange={(e) => setUserProfilePic(e.target.value.slice(12))}
            />
          </div>
        </form>
      );
    }
  };

  const UpdateBioForm = () => {
    return (
      <form className={styles.bio_form}>
        <label htmlFor="bio">Bio</label>
        <textarea
          name="bio"
          id="bio"
          value={userBio}
          onChange={(e) => setUserBio(e.target.value)}
        ></textarea>
      </form>
    );
  };

  const editUserBio = async () => {
    try {
      if (userBio.length > 0 && userBio.length <= 100) {
        const fetchUser = await fetch(`api/${user._id}/profile/account/bio`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editBio: userBio })
        });
        const data = fetchUser.json();
        setUser(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveChanges = () => {
    submitEditName();
    changeProfilePicture();
    editUserBio();
  };

  // Change to one submit button for all edits
  return (
    <>
      <Header
        user={user}
        setFoundUser={setFoundUser}
        searchUserInput={searchUserInput}
        account={true}
        sidebarContainer={sidebarContainer}
      />
      <div className={styles.account_container}>
        <h3>{user.username}</h3>
        <DisplayProfilePicture profile={user} user={true} formRef={formRef} />
        <div className={styles.edits}>
          <div className={styles.edit_name_inputs}>
            <label htmlFor="editName">Username</label>
            <input
              type="text"
              id="editName"
              name="editName"
              value={userUsername}
              onChange={(e) => setUserUsername(e.target.value)}
              className={styles.new_name}
            />
            <p className={styles.username_taken_warning} ref={invalidUsername}>
              Invalid username edit
            </p>
          </div>
          <ProfilePictureForm />
          <SetToDefaultPicture />
          <UpdateBioForm />
          <button onClick={saveChanges}>Save Changes</button>
        </div>
      </div>
    </>
  );
};

export default Account;
