import React, { useState } from "react";
import styles from "../../styles/PostModal.module.css";

export default function PostModal({
  onClose,
  profileImage,
  file: incomingFile,
  fileType,
}) {
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState(incomingFile || null);

  const handleRemoveFile = () => setFile(null);

  const handleSubmit = () => {
    console.log("Submitted post:", { postContent, file });
    onClose();
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

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!postContent && !file}
        >
          Post
        </button>
      </div>
    </div>
  );
}
