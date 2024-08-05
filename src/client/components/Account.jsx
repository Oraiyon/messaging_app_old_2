import { useOutletContext } from "react-router-dom";
import styles from "../stylesheets/Account.module.css";
import { useRef } from "react";
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

  const editUsernameRef = useRef(null);
  const invalidUsername = useRef(null);
  const formRef = useRef(null);
  const editBioRef = useRef(null);

  const submitEditName = async () => {
    try {
      if (!editUsernameRef.current.value || editUsernameRef.current.value === user.username) {
        return;
      }
      if (editUsernameRef.current.value.length < 3 || editUsernameRef.current.value.length > 10) {
        invalidUsername.current.style.display = "flex";
        return;
      }
      const fetchUser = await fetch(`/api/${user._id}/profile/account/username`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editName: editUsernameRef.current.value })
      });
      const data = await fetchUser.json();
      if (data) {
        setUser(data);
      } else {
        invalidUsername.current.style.display = "flex";
      }
    } catch (error) {
      console.log(error);
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
        <form action="" ref={formRef} className={styles.profile_picture_form}>
          <label htmlFor="picture">Profile Picture</label>
          <div>
            <input type="file" name="picture" id="picture" />
          </div>
        </form>
      );
    }
  };

  const UpdateBioForm = () => {
    return (
      <form className={styles.bio_form}>
        <label htmlFor="bio">Bio</label>
        <textarea name="bio" id="bio" defaultValue={user.bio} ref={editBioRef}></textarea>
      </form>
    );
  };

  const editUserBio = async () => {
    try {
      if (editBioRef.current.value === user.bio) {
        return;
      }
      if (editBioRef.current.value.length <= 100) {
        const fetchUser = await fetch(`/api/${user._id}/profile/account/bio`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editBio: editBioRef.current.value })
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
              ref={editUsernameRef}
              placeholder={user.username}
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
