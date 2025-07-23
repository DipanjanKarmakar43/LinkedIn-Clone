import React from "react";
import UserLayout from "@/layout/UserLayout";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.homeContainer}>
        <div className={styles.left}>
          <h1 className={styles.title}>Welcome to your professional network</h1>
          <p className={styles.subtitle}>
            Discover new opportunities, connect with industry leaders, and grow
            your career.
          </p>

          <div className={styles.buttons}>
            <button className={styles.googleBtn}>
              <img src="/images/Google.png" alt="Google Logo" />
              Continue with Google
            </button>

            <button
              onClick={() => router.push("/register")}
              className={styles.emailBtn}
            >
              Sign in with email
            </button>
          </div>

          <div className={styles.terms}>
            <p>
              By clicking Continue to join or sign in, you agree to LinkedIn's{" "}
              <strong>User Agreement, Privacy Policy</strong> and{" "}
              <strong>Cookie Policy</strong>.
            </p>
          </div>

          <div className={styles.joinNow}>
            <p>
              New to LinkedIn?
              <a onClick={() => router.push("/login")} className={styles.link}>
                Join now
              </a>
            </p>
          </div>
        </div>

        <div className={styles.right}>
          <img src="/images/LinkedIn-Hero-Img.png" alt="LinkedIn Hero" />
        </div>
      </div>
    </UserLayout>
  );
}
