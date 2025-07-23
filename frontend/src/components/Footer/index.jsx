import React from "react";
import styles from "../../styles/Footer.module.css";

export default function FooterComponent() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLeft}>
        <img
          src="/images/LinkedIn-Logo.png"
          alt="LinkedIn Logo"
          className={styles.logo}
        />
        <span>© 2025</span>
      </div>
      <div className={styles.footerLinks}>
        <a href="#">User Agreement</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Community Guidelines</a>
        <a href="#">Cookie Policy</a>
        <a href="#">Copyright Policy</a>
        <a href="#">Send Feedback</a>
        <a href="#">Language</a>
      </div>
    </footer>
  );
}
