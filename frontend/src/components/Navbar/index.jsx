import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Navbar.module.css";

export default function NavbarComponent() {
  const router = useRouter();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const isAuthPage = ["/login", "/register"].includes(router.pathname);

  return (
    <header className={styles.header}>
      <a onClick={() => router.push("/")}>
        <img
          src="/images/LinkedIn-Logo.png"
          alt="LinkedIn Logo"
          className={styles.logo}
        />
      </a>

      {!isAuthPage && (
        <nav className={styles["nav-links-tab"]}>
          <div className={styles.navbtn}>
            <span className="material-symbols-outlined">home</span>
            <a href="#">Home</a>
          </div>
          <div className={styles.navbtn}>
            <span className="material-symbols-outlined">
              notifications_active
            </span>
            <a href="#">Notifications</a>
          </div>
          <div className={styles.navbtn}>
            <span className="material-symbols-outlined">groups</span>
            <a href="#">My Network</a>
          </div>
          <div className={styles.navbtn}>
            <span className="material-symbols-outlined">work</span>
            <a href="#">Jobs</a>
          </div>
          <div className={styles.navbtn}>
            <span className="material-symbols-outlined">
              mark_unread_chat_alt
            </span>
            <a href="#">Messaging</a>
          </div>
        </nav>
      )}

      <div className={styles["nav-btn"]}>
        <button onClick={toggleTheme} className={styles.themeToggle}>
          {theme === "light" ? (
            <span className="material-symbols-outlined">light_off</span>
          ) : (
            <span className="material-symbols-outlined">lightbulb</span>
          )}
        </button>

        {!isAuthPage && (
          <>
            <a
              onClick={() => router.push("/login")}
              className={styles["join-now"]}
            >
              Join now
            </a>
            <button
              onClick={() => router.push("/register")}
              className={styles["sign-in-button"]}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </header>
  );
}
