import { useEffect, useState } from "react";

export default function Home() {
  const Router = require("next/router");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", storedTheme);
    setTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <div>
      <div className="container">
        <header className="header">
          <img
            src="/images/LinkedIn-Logo.png"
            alt="LinkedIn Logo"
            className="logo"
          />

          <nav className="nav-links-tab">
            <div className="navbtn">
              <span class="material-symbols-outlined">home</span>
              <a href="">Home</a>
            </div>
            <div className="navbtn">
              <span class="material-symbols-outlined">
                notifications_active
              </span>
              <a href="">Notifications</a>
            </div>
            <div className="navbtn">
              <span class="material-symbols-outlined">groups</span>
              <a href="">My Network</a>
            </div>
            <div className="navbtn">
              <span class="material-symbols-outlined">work</span>
              <a href="">Jobs</a>
            </div>
            <div className="navbtn">
              <span class="material-symbols-outlined">
                mark_unread_chat_alt
              </span>
              <a href="">Messaging</a>
            </div>
          </nav>

          <div className="nav-btn">
            <button onClick={toggleTheme} id="theme-toggle">
              {" "}
              {theme === "light" ? (
                <span class="material-symbols-outlined">light_off</span>
              ) : (
                <span class="material-symbols-outlined">lightbulb</span>
              )}
            </button>

            <a
              onClick={() => {
                Router.push("/login");
              }}
              className="join-now"
            >
              Join now
            </a>
            <button
              onClick={() => Router.push("/register")}
              className="sign-in-button"
            >
              Sign in
            </button>
          </div>
        </header>
        <div className="mainContainer">
          <div className="mainContainer-left">
            <h1 className="mainContainer-left-title">
              Welcome to your professional network
            </h1>
            <p className="mainContainer-left-subtitle">
              Discover new opportunities, connect with industry leaders, and
              grow your career.
            </p>
            <div className="mainContainer-left-buttons">
              <button className="google-sign-in">
                <img src="/images/Google.png" alt="Google Logo" />
                Continue with Google
              </button>
              <button
                onClick={() => Router.push("/register")}
                className="email-sign-in"
              >
                Sign in with email
              </button>
            </div>
            <div className="terms-n-condition">
              <p>
                By clicking Continue to join or sign in, you agree to LinkedIn's{" "}
                <strong>User Agreement, Privacy Policy</strong> and{" "}
                <strong>Cookie Policy</strong>.
              </p>
            </div>
            <div className="new-join">
              <p>
                New to LinkedIn?
                <a
                  onClick={() => {
                    Router.push("/login");
                  }}
                  className="join-now-link"
                >
                  Join now
                </a>
              </p>
            </div>
          </div>

          <div className="mainContainer-right">
            <img
              src="/images/LinkedIn-Hero-Img.png"
              alt="LinkedIn Hero Image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
