import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createPost, getAllPosts } from "@/config/redux/action/postAction";
import styles from "../../styles/PostModal.module.css";

export default function PostModal({
  onClose,
  profileImage,
  file: incomingFile,
  fileType,
}) {
  const dispatch = useDispatch();
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState(incomingFile || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRemoveFile = () => setFile(null);

  const handleUpload = async () => {
    setLoading(true);
    setError("");

    try {
      await dispatch(createPost({ file, body: postContent })).unwrap();
      dispatch(getAllPosts());
      setPostContent("");
      onClose();
    } catch (err) {
      setError(err?.toString() || "Failed to upload post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.header}>
          <img src={profileImage} alt="profile" className={styles.avatar} />
          <span>Post to Anyone</span>
        </div>

        <textarea
          className={styles.textarea}
          placeholder="What do you want to talk about?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />

        {file && (
          <div className={styles.previewSection}>
            {file.type?.startsWith("image") && (
              <img src={URL.createObjectURL(file)} alt="preview" />
            )}
            {file.type?.startsWith("video") && (
              <video controls src={URL.createObjectURL(file)} />
            )}
            {fileType === "article" && (
              <p className={styles.articlePreview}>{file.name}</p>
            )}
            <button className={styles.removeBtn} onClick={handleRemoveFile}>
              Remove
            </button>
          </div>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          className={styles.submitBtn}
          onClick={handleUpload}
          disabled={loading || (!postContent && !file)}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
