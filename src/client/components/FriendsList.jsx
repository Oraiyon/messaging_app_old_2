import styles from "../stylesheets/FriendsList.module.css";
import SearchFriend from "./SearchFriend";
import DisplayProfilePicture from "./DisplayProfilePicture";

const FriendsList = (props) => {
  const displayCurrentChat = (friend) => {
    props.setCurrentChat(friend);
    if (window.innerWidth <= 768) {
      props.setFriendsListHidden(true);
    }
    props.setChatHidden(false);
    props.setDisplaySearch(false);
    props.setDisplayFriendRequests(false);
  };

  const removeFriend = async (friend) => {
    try {
      // Use body instead of url?
      const fetchUser = await fetch(`/api/friend/${props.user._id}/${friend._id}`, {
        method: "PUT"
      });
      const data = await fetchUser.json();
      props.setUser(data);
      if (!data.friends.length) {
        props.setCurrentChat(null);
      } else {
        props.setCurrentChat(data.friends[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={props.friendsListHidden ? styles.friends_hidden : styles.friends}>
      <div className={styles.friends_list}>
        {props.user.friends.length
          ? props.user.friends.map((friend) => (
              <div
                key={friend._id}
                className={
                  props.currentChat && props.currentChat._id === friend._id
                    ? styles.current_chat
                    : ""
                }
              >
                <div className={styles.friend} onClick={() => displayCurrentChat(friend)}>
                  <DisplayProfilePicture profile={friend} />
                  <p>{friend.username}</p>
                </div>
                <button onClick={() => removeFriend(friend)}>X</button>
              </div>
            ))
          : ""}
      </div>
      <SearchFriend user={props.user} setCurrentChat={props.setCurrentChat} />
    </div>
  );
};

export default FriendsList;
