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

  // Make profile.picture default to default pic?
  if (props.profile.picture) {
    return (
      <>
        <div
          className={props.user ? "user_picture_container" : styles.profile_picture_container}
          onClick={openPictureForm}
          onMouseOver={() => displayEditPictureRef(editPictureIconRef)}
          onMouseOut={() => displayEditPictureRef(editPictureIconRef)}
        >
          <img
            src={props.profile.picture}
            alt="Profile Picture"
            title={props.user ? "Change Profile Picture" : ""}
            className={props.user ? styles.user_profile_picture : styles.profile_picture}
          />
          <Icon
            path={mdiPencilCircleOutline}
            className={styles.edit_picture_icon}
            ref={editPictureIconRef}
          />
        </div>
      </>
    );
  } else {
    return (
      <>
        <div
          className={props.user ? "user_picture_container" : styles.profile_picture_container}
          onClick={openPictureForm}
          onMouseOver={() => displayEditPictureRef(editPictureIconRef)}
          onMouseOut={() => displayEditPictureRef(editPictureIconRef)}
        >
          <div className={styles.default_profile_picture}>
            <Icon
              path={mdiAccountCircle}
              className={props.user ? styles.user_profile_picture : styles.profile_picture}
              title="Change Profile Picture"
            />
          </div>
          <Icon
            path={mdiPencilCircleOutline}
            className={styles.edit_picture_icon}
            ref={editPictureIconRef}
          />
        </div>
      </>
    );
  }
};

export default DisplayProfilePicture;
