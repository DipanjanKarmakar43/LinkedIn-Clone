import { useEffect, useState } from "react";

export default function Home() {
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
              <i className="fa-solid fa-home"></i>
              <a href="">Home</a>
            </div>
            <div className="navbtn">
              <i className="fa-solid fa-bell"></i>
              <a href="">Notifications</a>
            </div>
            <div className="navbtn">
              <i className="fa-solid fa-users"></i>
              <a href="">My Network</a>
            </div>
            <div className="navbtn">
              <i className="fa-solid fa-briefcase"></i>
              <a href="">Jobs</a>
            </div>
            <div className="navbtn">
              <i className="fa-solid fa-comment"></i>
              <a href="">Messaging</a>
            </div>
          </nav>

          <div className="nav-btn">
            <button onClick={toggleTheme} id="theme-toggle">
              Toggle to {theme === "light" ? "Dark" : "Light"} Theme
            </button>
            <a href="">Join now</a>
            <button> Sign in</button>
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
