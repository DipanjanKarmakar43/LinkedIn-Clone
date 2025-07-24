import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styles from "../../styles/Dashboard.module.css";
import { useDispatch } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import { getAboutUser } from "@/config/redux/action/authAction";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        dispatch(getAllPosts());
        dispatch(getAboutUser({ token }));
      }
    }
  }, [dispatch, router]);

  return (
    <UserLayout>
      <div className={styles.dashboardContainer}>
        {authState.profileFetched && (
          <div className={styles.profileContainer}>
            <div className={styles.profileCard}>
              <div className={styles.profileCardBanner}>
                <div className={styles.profileCardImage}>
                  <img
                    src={authState.user?.userId?.profilePicture}
                    alt="Profile"
                  />
                </div>
              </div>
              <div className={styles.profileCardContent}>
                <h2>{authState.user?.userId?.name}</h2>
                <p>{authState.user?.userId?.email}</p>
              </div>
            </div>
            <div className={styles.connectionCard}>
              <h3>Connections</h3>
              <p>{authState.user?.userId?.connections} connections</p>
            </div>
          </div>
        )}
        <div className={styles.feedContainer}>
          <div className={styles.feedAddPost}>
            <div className={styles.feedAddPostTop}>
              <div className={styles.feedAddPostImg}>
                <img
                  src={authState.user?.userId?.profilePicture}
                  alt="Profile"
                />
              </div>
              <a className={styles.feedAddPostLink} href="#">Start a post</a>
            </div>
            <div className={styles.feedAddPostBottom}>
              <div className={styles.feedAddPostType}>
                <span className="material-symbols-outlined">smart_display</span>
                <a href="">Video</a>
              </div>
              <div className={styles.feedAddPostType}>
                <span className="material-symbols-outlined">panorama</span>
                <a href="">Photo</a>
              </div>
              <div className={styles.feedAddPostType}>
                <span className="material-symbols-outlined">newsmode</span>
                <a href="">Write Article</a>
              </div>
            </div>
          </div>
          <hr />
          <div className={styles.feedPosts}>
            <h2>Recent Posts</h2>
            {/* Map through posts and display them here */}
            {/* Example post structure */}
            {/* {authState.posts.map((post) => (
              <div key={post.id} className={styles.postCard}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>
            ))} */}
          </div>
        </div>
        <div className={styles.extraContainer}>
          <h2>Extra Content</h2>
          <p>
            This section can be used for additional information or features.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}
