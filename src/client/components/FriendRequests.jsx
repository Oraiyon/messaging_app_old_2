import styles from "../stylesheets/FriendRequests.module.css";

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
              <p>
                {request.receiver.username === props.user.username
                  ? request.sender.username
                  : request.receiver.username}
              </p>
              <div className={styles.friend_request_inputs}>
                {request.receiver.username === props.user.username ? (
                  <button onClick={() => acceptFriendRequest(request)}>Accept</button>
                ) : (
                  ""
                )}
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
