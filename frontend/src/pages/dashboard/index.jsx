import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import { baseURL } from "@/config";
import styles from "../../styles/Dashboard.module.css";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import PostModal from "@/components/PostModal";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [showPostModal, setShowPostModal] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));

      if (!authState.all_profiles_fetched) {
        dispatch(getAllUsers());
      }
    }
  }, [dispatch, authState.isTokenThere, authState.all_profiles_fetched]);

  const profilePic = authState?.user?.userId?.profilePicture;
  const imageSrc = profilePic ? `${baseURL}/${profilePic}` : "/default.jpg";

  const handleFileSelect = (event, type) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(type);
      setShowPostModal(true);
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.feedContainer}>
          <div className={styles.feedAddPost}>
            <div className={styles.feedAddPostTop}>
              <div className={styles.feedAddPostImg}>
                <img src={imageSrc} alt="Profile" />
              </div>
              <a
                className={styles.feedAddPostLink}
                onClick={() => setShowPostModal(true)}
              >
                Start a post
              </a>
            </div>

            <div className={styles.feedAddPostBottom}>
              <label className={styles.feedAddPostType}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#5f9b41" }}
                >
                  smart_display
                </span>
                <span>Video</span>
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => handleFileSelect(e, "video")}
                />
              </label>

              <label className={styles.feedAddPostType}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#378fe9" }}
                >
                  panorama
                </span>
                <span>Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleFileSelect(e, "photo")}
                />
              </label>

              <label className={styles.feedAddPostType}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#e06847" }}
                >
                  newsmode
                </span>
                <span>Write Article</span>
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleFileSelect(e, "article")}
                />
              </label>
            </div>
          </div>

          <hr />
          <div className={styles.feedPosts}>
            <h2>Recent Posts</h2>
          </div>
        </div>

        {showPostModal && (
          <PostModal
            onClose={() => {
              setShowPostModal(false);
              setFile(null);
              setFileType(null);
            }}
            profileImage={imageSrc}
            file={file}
            fileType={fileType}
          />
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
