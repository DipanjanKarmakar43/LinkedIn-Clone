import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Navbar.module.css";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, searchUsers } from "@/config/redux/action/authAction";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { baseURL } from "@/config";

export default function NavbarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchContainerRef = useRef(null);
  const authState = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { loggedIn, user, all_users, isLoading } = authState;
  const [theme, setTheme] = useState("light");
  const isAuthPage = ["/login", "/register"].includes(router.pathname);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        setDropdownVisible(true);
        dispatch(searchUsers(searchTerm));
      } else {
        setDropdownVisible(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);

    const token = localStorage.getItem("token");
    if (token) {
      dispatch(setTokenIsThere());
    }
  }, [dispatch]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const handleSeeAll = () => {
    setDropdownVisible(false);
    router.push(`/discover?q=${searchTerm}`);
  };

  return (
    <header className={styles.header}>
      <a onClick={() => router.push("/dashboard")}>
        <img
          src="/images/LinkedIn-Logo.png"
          alt="LinkedIn Logo"
          className={styles.logo}
        />
      </a>

      {/* Search Bar and Dropdown */}
      {loggedIn && !isAuthPage && (
        <div className={styles.searchContainer} ref={searchContainerRef}>
          <div className={styles.searchBar}>
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setDropdownVisible(true)}
            />
          </div>
          {isDropdownVisible && searchTerm && (
            <>
              <div className={styles.searchResultsDropdownLeft}></div>
              <div className={styles.searchResultsDropdown}>
                {isLoading ? (
                  <div className={styles.searchResultItem}>Searching...</div>
                ) : all_users?.length > 0 ? (
                  <>
                    {all_users.slice(0, 6).map((profile) => (
                      <a
                        key={profile._id}
                        className={styles.searchResultItem}
                        href={`/profile/${profile.userId._id}`}
                      >
                        <img
                          src={
                            profile?.userId?.profilePicture
                              ? `${baseURL}/${profile.userId.profilePicture}`
                              : "/default.jpg"
                          }
                          alt="Profile"
                          className={styles.searchResultImage}
                        />
                        <span>{profile.userId.name}</span>
                      </a>
                    ))}
                    <div
                      className={styles.seeAllResults}
                      onClick={handleSeeAll}
                    >
                      See all results
                    </div>
                  </>
                ) : (
                  <div className={styles.searchResultItem}>No users found.</div>
                )}
              </div>
              <div className={styles.searchResultsDropdownRight}></div>
            </>
          )}
        </div>
      )}

      {/* Navigation Links */}
      {!isAuthPage && (
        <nav className={styles["nav-links-tab"]}>
          <a
            onClick={() => router.push("/dashboard")}
            className={styles.navbtn}
          >
            <span className="material-symbols-outlined">home</span>
            <p>Home</p>
          </a>
          <a
            onClick={() => router.push("/myConnections")}
            className={styles.navbtn}
          >
            <span className="material-symbols-outlined">
              notifications_active
            </span>
            <p>Notifications</p>
          </a>
          <a onClick={() => router.push("/discover")} className={styles.navbtn}>
            <span className="material-symbols-outlined">groups</span>
            <p>My Network</p>
          </a>
          <a
            onClick={() => router.push("/dashboard")}
            className={styles.navbtn}
          >
            <span className="material-symbols-outlined">work</span>
            <p>Jobs</p>
          </a>
          <a
            onClick={() => router.push("/dashboard")}
            className={styles.navbtn}
          >
            <span className="material-symbols-outlined">
              mark_unread_chat_alt
            </span>
            <p>Messaging</p>
          </a>
        </nav>
      )}

      {/* Theme Toggle and Auth Section */}
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
            {!loggedIn ? (
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
            ) : // Check for user AND the nested user.userId to be safe
            user && user.userId ? (
              <div className={styles.authSection}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>

                <div className={styles.profileDisplay}>
                  <img
                    src={(() => {
                      // CORRECTED: Access properties through user.userId
                      const path =
                        user.userId.profilePicture ||
                        user.userId.avatar ||
                        user.userId.picture;
                      return path ? `${baseURL}/${path}` : "/default.jpg";
                    })()}
                    alt="Profile"
                    className={styles.profilePic}
                  />
                  <div className={styles.profileDetails}>
                    <span>{`Hello, ${
                      // CORRECTED: Access properties through user.userId
                      user.userId.name ||
                      user.userId.username ||
                      user.userId.fullName ||
                      "User"
                    }`}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
