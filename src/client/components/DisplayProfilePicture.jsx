import Icon from "@mdi/react";
import { mdiAccountCircle, mdiPencilCircleOutline } from "@mdi/js";
import styles from "../stylesheets/DisplayProfilePicture.module.css";
import { useRef } from "react";

const DisplayProfilePicture = (props) => {
  const editPictureIconRef = useRef(null);

  const displayEditPictureRef = (ref) => {
    if (props.user) {
      if (!ref.current.style.display || ref.current.style.display === "none") {
        ref.current.style.display = "flex";
      } else {
        ref.current.style.display = "none";
      }
    }
  };

  const openPictureForm = () => {
    props.formRef.current.click();
  };

  const ProfilePicturePicker = (props) => {
    if (props.profile.picture) {
      return (
        <img
          src={props.profile.picture}
          alt="Profile Picture"
          title={props.user ? "Change Profile Picture" : ""}
          className={styles.profile_picture}
        />
      );
    } else {
      return (
        <div className={styles.default_profile_picture}>
          <Icon
            path={mdiAccountCircle}
            className={styles.profile_picture}
            title="Change Profile Picture"
          />
        </div>
      );
    }
  };

  // Make profile.picture default to default pic?
  return (
    <div
      className={props.user ? "user_picture_container" : styles.profile_picture_container}
      onClick={openPictureForm}
      onMouseOver={() => displayEditPictureRef(editPictureIconRef)}
      onMouseOut={() => displayEditPictureRef(editPictureIconRef)}
    >
      <ProfilePicturePicker profile={props.profile} />
      <Icon
        path={mdiPencilCircleOutline}
        className={styles.edit_picture_icon}
        ref={editPictureIconRef}
      />
    </div>
  );
};

export default DisplayProfilePicture;
