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

  const [searchedFriend, setSearchedFriend] = useState(null);

  const editName = useRef(null);
  const submitNameButton = useRef(null);
  const invalidUsername = useRef(null);
  const friendsList = useRef(null);
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
      // displayEditName();
    } else {
      invalidUsername.current.style.display = "flex";
    }
  };

  const removeFriend = async (friend) => {
    try {
      // Use body instead of url?
      const fetchUser = await fetch(`/api/friend/${user._id}/${friend._id}`, {
        method: "PUT"
      });
      const data = await fetchUser.json();
      setUser(data);
      if (!data.friends.length) {
        setCurrentChat(null);
      } else {
        setCurrentChat(data.friends[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchFriendAccount = async (e) => {
    try {
      if (e.target.value) {
        friendsList.current.style.display = "none";
        for (const friend of user.friends) {
          if (e.target.value === friend.username) {
            setSearchedFriend(friend);
            return;
          } else {
            setSearchedFriend(null);
          }
        }
      } else {
        friendsList.current.style.display = "block";
        setSearchedFriend(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const FriendInputs = (props) => {
    return (
      <div className={styles.friend_account}>
        <div>
          <DisplayProfilePicture profile={props.friend} />
          <p>{props.friend.username}</p>
        </div>
        <button onClick={() => removeFriend(props.friend)}>Remove</button>
      </div>
    );
  };

  const DisplaySearchedFriend = () => {
    if (searchedFriend) {
      return <FriendInputs friend={searchedFriend} />;
    }
  };

  const changeProfilePicture = async (e) => {
    try {
      e.preventDefault();
      if (formRef.current.children[1].value) {
        const formData = new FormData();
        formData.append("file", formRef.current.children[1].files[0]);
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
          <button onClick={setProfilePictureToDefault}>Set Picture To Default</button>
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
          <label htmlFor="picture">Edit Profile Picture:</label>
          <input type="file" name="picture" id="picture" />
          <button>Submit</button>
        </form>
      );
    }
  };
  // CHANGE REPO
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
        <div className={styles.account_info}>
          <h3>{user.username}</h3>
          <DisplayProfilePicture profile={user} user={true} formRef={formRef} />
          <div className={styles.edits}>
            <div className={styles.edit_name_inputs}>
              <label htmlFor="editName">Edit Username:</label>
              <input
                type="text"
                id="editName"
                name="editName"
                placeholder={user.username}
                className={styles.new_name}
                ref={editName}
              />
              <p className={styles.username_taken_warning} ref={invalidUsername}>
                Invalid username
              </p>
              <button
                onClick={submitEditName}
                className={styles.submit_name}
                ref={submitNameButton}
              >
                Submit
              </button>
            </div>
            <ProfilePictureForm />
            <SetToDefaultPicture />
          </div>
        </div>
        <div className={styles.friendsList_account}>
          <label htmlFor="searchFriend">Search Friend</label>
          <input
            type="text"
            name="friend"
            id="searchFriend"
            placeholder="Search Friend"
            onChange={searchFriendAccount}
          />
          <DisplaySearchedFriend />
          <div ref={friendsList} className={styles.friends_list}>
            {user.friends.map((friend) => (
              <div key={friend._id}>
                <FriendInputs friend={friend} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
