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

  const editName = useRef(null);
  const submitNameButton = useRef(null);
  const invalidUsername = useRef(null);
  const formRef = useRef(null);

  const submitEditName = async () => {
    if (!editName.current.value || editName.current.value.length < 3) {
      invalidUsername.current.style.display = "flex";
      return;
    }
    const fetchUser = await fetch(`/api/${user._id}/profile/account/username`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editName: editName.current.value })
    });
    const res = await fetchUser.json();
    if (res) {
      setUser(res);
    } else {
      invalidUsername.current.style.display = "flex";
    }
  };

  const changeProfilePicture = async (e) => {
    try {
      e.preventDefault();
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
        <form
          action=""
          onSubmit={changeProfilePicture}
          ref={formRef}
          className={styles.profile_picture_form}
        >
          <label htmlFor="picture">Profile Picture</label>
          <div>
            <input type="file" name="picture" id="picture" />
            <button>Submit</button>
          </div>
        </form>
      );
    }
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
            <div>
              <input
                type="text"
                id="editName"
                name="editName"
                placeholder={user.username}
                className={styles.new_name}
                ref={editName}
              />
              <button
                onClick={submitEditName}
                className={styles.submit_name}
                ref={submitNameButton}
              >
                Submit
              </button>
            </div>
            <p className={styles.username_taken_warning} ref={invalidUsername}>
              Invalid username
            </p>
          </div>
          <ProfilePictureForm />
          <SetToDefaultPicture />
        </div>
      </div>
    </>
  );
};

export default Account;
