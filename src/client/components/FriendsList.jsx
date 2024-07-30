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

  return (
    <div className={props.friendsListHidden ? styles.friends_hidden : styles.friends}>
      <div className={styles.friends_list}>
        {props.user.friends.length
          ? props.user.friends.map((friend) => (
              <div
                key={friend._id}
                className={
                  props.currentChat && props.currentChat._id === friend._id
                    ? styles.friend + " " + styles.current_chat
                    : styles.friend
                }
                onClick={() => displayCurrentChat(friend)}
              >
                <DisplayProfilePicture profile={friend} />
                <p>{friend.username}</p>
              </div>
            ))
          : ""}
      </div>
      <SearchFriend user={props.user} setCurrentChat={props.setCurrentChat} />
    </div>
  );
};

export default FriendsList;
