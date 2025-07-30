import { useState, useEffect } from "react";
import styles from "../../styles/Modal.module.css";

export default function ExperienceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    setFormData(initialData || { company: "", position: "", years: "" });
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
        <h2>{isEditMode ? "Edit Experience" : "Add Experience"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Years</label>
            <input
              type="text"
              name="years"
              value={formData.years}
              onChange={handleChange}
              placeholder="e.g. 2020-2024"
              required
            />
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
