import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPosts,
  deletePost,
  toggleLikePost,
  getAllComments,
} from "@/config/redux/action/postAction";
import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import { baseURL } from "@/config";
import styles from "../../styles/Dashboard.module.css";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import PostModal from "@/components/PostModal";
import CommentSection from "@/components/CommentSection";

// 👇 Import socket and real-time actions
import socket from "@/config/socket";
import {
  addPostRealTime,
  removePostRealTime,
  updatePostRealTime,
  addCommentOrReplyRealTime,
  removeCommentRealTime,
  updateCommentRealTime,
} from "@/config/redux/reducer/postReducer";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.posts);

  const [showPostModal, setShowPostModal] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [activeCommentSection, setActiveCommentSection] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token }));

      if (!authState.all_profiles_fetched) {
        dispatch(getAllUsers());
      }
    }

    // 👇 Set up socket listeners
    socket.on("new_post", (post) => dispatch(addPostRealTime(post)));
    socket.on("post_deleted", (postId) => dispatch(removePostRealTime(postId)));
    socket.on("post_updated", (post) => dispatch(updatePostRealTime(post)));
    socket.on("new_comment", (comment) =>
      dispatch(addCommentOrReplyRealTime(comment))
    );
    socket.on("new_reply", (reply) =>
      dispatch(addCommentOrReplyRealTime(reply))
    );
    socket.on("comment_deleted", (data) =>
      dispatch(removeCommentRealTime(data))
    );
    socket.on("comment_updated", (comment) =>
      dispatch(updateCommentRealTime(comment))
    );

    // 👇 Clean up listeners on component unmount
    return () => {
      socket.off("new_post");
      socket.off("post_deleted");
      socket.off("post_updated");
      socket.off("new_comment");
      socket.off("new_reply");
      socket.off("comment_deleted");
      socket.off("comment_updated");
    };
  }, [dispatch, authState.isTokenThere, authState.all_profiles_fetched]);

  const profilePic = authState.user?.userId?.profilePicture;
  const imageSrc = profilePic ? `${baseURL}/${profilePic}` : "/default.jpg";

  const handleFileSelect = (event, type) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(type);
      setShowPostModal(true);
    }
  };

  const handleDeletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const token = localStorage.getItem("token");
      // Dispatching the original action which will also trigger the socket emit
      dispatch(deletePost({ postId, token }));
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
            {postState?.posts?.length > 0 ? (
              postState.posts.map((post) => {
                const currentUserId = authState.user?.userId?._id;
                // Likes is a Map on the backend, but becomes an object when JSON serialized
                const isLikedByCurrentUser =
                  post.likes && post.likes[currentUserId];
                const likeCount = post.likes
                  ? Object.keys(post.likes).length
                  : 0;

                const fileType = post.fileType || "";
                const isImage = fileType.startsWith("image");
                const isVideo = fileType.startsWith("video");
                const isArticle =
                  fileType.includes("pdf") || fileType.includes("document");

                return (
                  <div key={post._id} className={styles.post}>
                    <div className={styles.postHeader}>
                      <img
                        src={`${baseURL}/${
                          post.userId?.profilePicture || "default.jpg"
                        }`}
                        alt="Profile"
                      />
                      <div className={styles.postUserInfo}>
                        <h3>{post.userId?.name || "Unknown User"}</h3>
                        <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className={styles.postDelete}>
                        {currentUserId &&
                          currentUserId === post.userId?._id && (
                            <span
                              className="material-symbols-outlined"
                              onClick={() => handleDeletePost(post._id)}
                            >
                              delete
                            </span>
                          )}
                      </div>
                    </div>

                    <div className={styles.postContent}>
                      <p>{post.body}</p>
                      {post.media && (
                        <div className={styles.postMedia}>
                          {isImage && (
                            <img
                              src={`${baseURL}/${post.media}`}
                              alt="Post media"
                            />
                          )}
                          {isVideo && (
                            <video controls src={`${baseURL}/${post.media}`} />
                          )}
                          {isArticle && (
                            <a
                              href={`${baseURL}/${post.media}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.articleLink}
                            >
                              View Article ({post.media})
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.postActions}>
                      <div
                        className={`${styles.postActionButton} ${
                          isLikedByCurrentUser ? styles.liked : ""
                        }`}
                        onClick={() => {
                          dispatch(toggleLikePost(post._id));
                        }}
                      >
                        <span className="material-symbols-outlined">
                          {isLikedByCurrentUser
                            ? "thumb_up"
                            : "thumb_up_off_alt"}
                        </span>
                        <p>{likeCount} Likes</p>
                      </div>

                      <div
                        onClick={() => {
                          if (activeCommentSection === post._id) {
                            setActiveCommentSection(null);
                          } else {
                            setActiveCommentSection(post._id);
                            dispatch(getAllComments({ postId: post._id }));
                          }
                        }}
                        className={styles.postActionButton}
                      >
                        <span className="material-symbols-outlined">
                          chat_bubble
                        </span>
                        Comment
                      </div>

                      <div className={styles.postActionButton}>
                        <span className="material-symbols-outlined">share</span>
                        Share
                      </div>
                    </div>
                    {activeCommentSection === post._id && (
                      <CommentSection postId={post._id} />
                    )}
                  </div>
                );
              })
            ) : (
              <p>No posts found or still loading...</p>
            )}
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
