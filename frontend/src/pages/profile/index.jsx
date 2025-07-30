import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAboutUser,
  updateUserProfileData,
  getAcceptedConnections,
  updateProfilePicture,
} from "@/config/redux/action/authAction";
import { getUserPosts } from "@/config/redux/action/postAction";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "../../styles/Profile.module.css";
import { baseURL } from "@/config";

import EditProfileModal from "@/components/Modal/EditProfileModal";
import ExperienceModal from "@/components/Modal/ExperienceModal";
import EducationModal from "@/components/Modal/EducationModal";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [modalState, setModalState] = useState({
    editProfile: false,
    addExperience: false,
    editExperience: false,
    addEducation: false,
    editEducation: false,
  });

  const [currentItem, setCurrentItem] = useState(null);

  const { user, isLoading, connections } = useSelector((state) => state.auth);
  const { posts, isLoading: postsLoading } = useSelector(
    (state) => state.posts
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      dispatch(getAboutUser({ token: storedToken }));
      dispatch(getUserPosts({ token: storedToken }));
      dispatch(getAcceptedConnections({ token: storedToken }));
    } else {
      router.push("/login");
    }
  }, [dispatch, router]);

  const openModal = (modalName, item = null) => {
    setCurrentItem(item);
    setModalState((prevState) => ({ ...prevState, [modalName]: true }));
  };

  const closeModal = () => {
    setModalState({
      editProfile: false,
      addExperience: false,
      editExperience: false,
      addEducation: false,
      editEducation: false,
    });
    setCurrentItem(null);
  };

  const handleProfileUpdate = (formData) => {
    dispatch(updateUserProfileData(formData));
    closeModal();
  };

  const handleExperienceSubmit = (formData) => {
    let updatedWork;
    if (currentItem) {
      updatedWork = user.pastWork.map((exp) =>
        exp._id === currentItem._id ? { ...exp, ...formData } : exp
      );
    } else {
      const { _id, ...newExperience } = formData;
      updatedWork = [...(user.pastWork || []), newExperience];
    }
    dispatch(updateUserProfileData({ pastWork: updatedWork }));
    closeModal();
  };

  const handleEducationSubmit = (formData) => {
    let updatedEducation;
    if (currentItem) {
      updatedEducation = user.education.map((edu) =>
        edu._id === currentItem._id ? { ...edu, ...formData } : edu
      );
    } else {
      const { _id, ...newEducation } = formData;
      updatedEducation = [...(user.education || []), newEducation];
    }
    dispatch(updateUserProfileData({ education: updatedEducation }));
    closeModal();
  };

  const handleDelete = (type, id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      if (type === "experience") {
        const updatedWork = user.pastWork.filter((exp) => exp._id !== id);
        dispatch(updateUserProfileData({ pastWork: updatedWork }));
      }
      if (type === "education") {
        const updatedEducation = user.education.filter((edu) => edu._id !== id);
        dispatch(updateUserProfileData({ education: updatedEducation }));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      // The key 'profile_picture' must match the backend
      formData.append("profile_picture", file);
      dispatch(updateProfilePicture(formData));
    }
  };

  if (isLoading || !user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.profilePageContainer}>
            <p>Loading profile...</p>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  const profilePicUrl = user?.userId?.profilePicture
    ? `${baseURL}/${user.userId.profilePicture}`
    : "/default.jpg";

  return (
    <UserLayout>
      <DashboardLayout>
        <EditProfileModal
          isOpen={modalState.editProfile}
          onClose={closeModal}
          onSubmit={handleProfileUpdate}
          initialData={user}
        />
        <ExperienceModal
          isOpen={modalState.addExperience || modalState.editExperience}
          onClose={closeModal}
          onSubmit={handleExperienceSubmit}
          initialData={currentItem}
        />
        <EducationModal
          isOpen={modalState.addEducation || modalState.editEducation}
          onClose={closeModal}
          onSubmit={handleEducationSubmit}
          initialData={currentItem}
        />
        <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleFileChange}
        />

        <div className={styles.profilePageContainer}>
          <div className={styles.profileCard}>
            <div className={styles.profileCardBanner}>
              <div className={styles.profileCardImage}>
                <img src={profilePicUrl} alt="Profile" />
              </div>
            </div>
            <div className={styles.profileCardContent}>
              <h1>{user.userId?.name || "Name not available"}</h1>
              <p>{user.userId?.email || "Email not available"}</p>
            </div>
          </div>

          <div className={styles.profileAbout}>
            <h3>About</h3>
            <p>{user.bio || "Not specified"}</p>
            <p>
              <strong>Current Role:</strong>{" "}
              {user.currentPost || "Not specified"}
            </p>
          </div>

          <div className={styles.profileActions}>
            <button onClick={() => openModal("editProfile", user)}>
              Edit Profile{" "}
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button onClick={() => fileInputRef.current.click()}>
              Change Picture{" "}
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>

          <div className={styles.profileConnections}>
            <h3>Connections ({connections?.length || 0})</h3>
            {connections && connections.length > 0 ? (
              <div className={styles.recentConnections}>
                {connections.slice(0, 3).map((conn) => {
                  const friend =
                    conn.userId?._id === user.userId?._id
                      ? conn.connectionId
                      : conn.userId;
                  if (!friend) return null;
                  return (
                    <div
                      key={friend._id}
                      className={styles.recentConnectionItem}
                      // onClick={() => router.push(`/profile/${friend._id}`)}
                      title={friend.name}
                    >
                      <div className={styles.profileBanner}>
                        <img
                          src={
                            friend.profilePicture
                              ? `${baseURL}/${friend.profilePicture}`
                              : "/default.jpg"
                          }
                          alt={friend.name}
                          className={styles.recentConnectionImage}
                        />
                      </div>
                      <div className={styles.recentConnectionInfo}>
                        <span>{friend.name}</span>
                        <span>{friend.email}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No connections yet.</p>
            )}
            <a onClick={() => router.push("/myConnections")}>
              Manage Connections
            </a>
          </div>

          <div className={styles.profilePosts}>
            <div className={styles.profilePostsSectionHeader}>
              <h3>Posts</h3>
            </div>
            <div className={styles.profilePostDisplay}>
              {postsLoading ? (
                <p>Loading posts...</p>
              ) : posts && posts.length > 0 ? (
                posts.slice(0, 3).map((post) => {
                  const isImage = post.fileType?.startsWith("image/");
                  const isVideo = post.fileType?.startsWith("video/");
                  const isArticle = post.media && !isImage && !isVideo;

                  return (
                    <div key={post._id} className={styles.postItem}>
                      <p>{post.body}</p>
                      {post.media && (
                        <div className={styles.postMedia}>
                          {isImage && (
                            <img
                              src={`${baseURL}/${post.media}`}
                              alt="Post media"
                              className={styles.postImage}
                            />
                          )}
                          {isVideo && (
                            <video
                              controls
                              src={`${baseURL}/${post.media}`}
                              className={styles.postVideo}
                            />
                          )}
                          {isArticle && (
                            <a
                              href={`${baseURL}/${post.media}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.articleLink}
                            >
                              View Document ({post.media})
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No posts yet.</p>
              )}
            </div>
            <a
              onClick={() => router.push("/dashboard")}
              style={{ cursor: "pointer" }}
            >
              see all posts
            </a>
          </div>

          <div className={styles.profileExperience}>
            <div className={styles.profileSectionHeader}>
              <h3>Experience</h3>
              <button onClick={() => openModal("addExperience")}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            {user.pastWork && user.pastWork.length > 0 ? (
              user.pastWork.map((exp) => (
                <div key={exp._id} className={styles.experienceItem}>
                  <div>
                    <h4>
                      {exp.position} at {exp.company}
                    </h4>
                    <p>Years : {exp.years}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => openModal("editExperience", exp)}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button onClick={() => handleDelete("experience", exp._id)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No experience listed.</p>
            )}
          </div>

          <div className={styles.profileEducation}>
            <div className={styles.profileSectionHeader}>
              <h3>Education</h3>
              <button onClick={() => openModal("addEducation")}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            {user.education && user.education.length > 0 ? (
              user.education.map((edu) => (
                <div key={edu._id} className={styles.educationItem}>
                  <div>
                    <h4>
                      {edu.degree} in {edu.fieldOfStudy}
                    </h4>
                    <p>{edu.school}</p>
                    {/* <p>Years: {edu.years}</p> */}
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => openModal("editEducation", edu)}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button onClick={() => handleDelete("education", edu._id)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No education listed.</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
