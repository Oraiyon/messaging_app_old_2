import styles from "../stylesheets/FriendRequests.module.css";
import DisplayProfilePicture from "./DisplayProfilePicture";

const FriendRequests = (props) => {
  const removeFriendRequest = async (request) => {
    try {
      // Use body instead of url?
      const fetchUser = await fetch(
        `/api/friendrequest/remove/${props.user._id}/${request.receiver.id === props.user._id ? request.sender.id : request.receiver.id}`,
        { method: "PUT" }
      );
      const data = await fetchUser.json();
      props.setUser(data);
    } catch (error) {
      console.log(error);
    }
  };

  const acceptFriendRequest = async (request) => {
    try {
      const fetchUser = await fetch(
        `/api/friendrequest/accept/${props.user._id}/${request.receiver.id === props.user._id ? request.sender.id : request.receiver.id}`,
        { method: "PUT" }
      );
      const data = await fetchUser.json();
      props.setUser(data);
      props.setCurrentChat(data.friends[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const AcceptButtonHandler = (props) => {
    if (props.request.receiver.username === props.user.username) {
      return <button onClick={() => acceptFriendRequest(request)}>Accept</button>;
    }
  };

  // FIX
  // request.sender/receiver does not contain user info
  const PictureHandler = (props) => {
    console.log(props.request.sender);
    if (props.request.receiver.username === props.user.username) {
      // return <DisplayProfilePicture profile={props.request.sender} />;
    } else {
      // return <DisplayProfilePicture profile={props.request.receiver} />;
    }
  };

  // Separate friend requests for sent or received?
  return (
    <div
      className={
        props.displayFriendRequests ? styles.friend_requests_displayed : styles.friend_requests
      }
    >
      <h3>Friend Requests</h3>
      {props.user.friendRequests.length ? (
        <div className={styles.friend_requests_info}>
          {props.user.friendRequests.map((request) => (
            <div key={request.sender.id + request.receiver.id} className={styles.friend_request}>
              <div>
                <PictureHandler request={request} user={props.user} />
                <p>
                  {request.receiver.username === props.user.username
                    ? request.sender.username
                    : request.receiver.username}
                </p>
              </div>
              <div className={styles.friend_request_inputs}>
                <AcceptButtonHandler user={props.user} request={request} />
                <button onClick={() => removeFriendRequest(request)}>
                  {request.receiver.username === props.user.username ? "Decline" : "Unsend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No friend requests...</p>
      )}
    </div>
  );
};

export default FriendRequests;
