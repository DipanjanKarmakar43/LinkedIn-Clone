import React, { useEffect, useState } from "react";
import styles from "../../styles/LoadingScreen.module.css";

export default function LoadingScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.loadingMessage}>
        {user && (
          <div>
            <h1>Welcome, {user.name}!</h1>
          </div>
        )}
      </div>
      <div className={styles.loader}></div>
    </div>
  );
}
