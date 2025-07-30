import { useState, useEffect } from "react";
import styles from "../../styles/Modal.module.css";

export default function EducationModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    years: ""
  });
  
  const isEditMode = !!initialData;

  useEffect(() => {
    setFormData(
      initialData || { school: "", degree: "", fieldOfStudy: "", years: "" }
    );
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
        <h2>{isEditMode ? "Edit Education" : "Add Education"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>School/University</label>
            <input type="text" name="school" value={formData.school} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Degree</label>
            <input type="text" name="degree" value={formData.degree} onChange={handleChange} required />
          </div>
           <div className={styles.formGroup}>
            <label>Field of Study</label>
            <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Years</label>
            <input type="text" name="years" value={formData.years} onChange={handleChange} placeholder="e.g., 2016-2020" required />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.submitButton}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}