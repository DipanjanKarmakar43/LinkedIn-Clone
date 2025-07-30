import { useState, useEffect } from "react";
import styles from "../../styles/Modal.module.css"; // Adjust path if needed

export default function EditProfileModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  const [formData, setFormData] = useState({
    bio: "",
    currentPost: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        bio: initialData.bio || "",
        currentPost: initialData.currentPost || "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPost">Current Position</label>
            <input
              type="text"
              name="currentPost"
              value={formData.currentPost}
              onChange={handleChange}
              placeholder="e.g., Software Engineer at Google"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="bio">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about yourself"
            ></textarea>
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
