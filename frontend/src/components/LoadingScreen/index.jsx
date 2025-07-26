import React from "react";
import styles from "../../styles/LoadingScreen.module.css";
import { useSelector } from "react-redux";

export default function LoadingScreen() {
  const user = useSelector((state) => state.auth.user?.userId); // Adjust if needed
  console.log("LoadingScreen user:", user); // For debugging

  return (
    <div className={styles.overlay}>
      <div className={styles.loadingMessage}>
        <h1 className={styles.gradientText}>
          Linked
        </h1>
        <img src="/LinkedIn_icon.svg" alt="LinkedIn" />
      </div>
      <div className={styles.loader}></div>
    </div>
  );
}
