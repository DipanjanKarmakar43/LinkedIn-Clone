import React, { useEffect } from "react";
import styles from "../../styles/Dashboard.module.css";
import { useRouter } from "next/router";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/authAction";
import { baseURL } from "@/config";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      router.push("/login");
    } else {
      dispatch(setTokenIsThere());
      dispatch(getAllUsers());
    }
  }, [dispatch, router]);

  return (
    <div>
      <div className={styles.dashboardContainer}>
        <div className={styles.profileContainer}>
          <div
            onClick={() => router.push("/dashboard")}
            className={styles.profileCard}
          >
            <div className={styles.profileCardBanner}>
              <div className={styles.profileCardImage}>
                {(() => {
                  const profilePic = authState?.user?.userId?.profilePicture;
                  const imageSrc = profilePic
                    ? `${baseURL}/${profilePic}`
                    : "/default.jpg";
                  return <img src={imageSrc} alt="Profile" />;
                })()}
              </div>
            </div>
            <div className={styles.profileCardContent}>
              {/* <h2>{userProfile?.userId?.name || "No name"}</h2> */}
              {/* <p>{userProfile?.userId?.email || "No email"}</p> */}
            </div>
          </div>

          <div
            onClick={() => router.push("/discover")}
            className={styles.connectionCard}
          >
            <h3>Discover</h3>
          </div>

          <div className={styles.connectionCard}>
            <a onClick={() => router.push("/myConnections")}>
              <h3>Connections</h3>
              {/* <p>{userProfile?.connections?.length || 0} connections</p> */}
            </a>
          </div>
        </div>

        <div className={styles.feedContainer}>{children}</div>

        <div className={styles.extraContainer}>
          <h2>Top Profiles</h2>

          {authState.all_profiles_fetched &&
            authState.all_users?.map((profile) => {
              if (!profile) return null;

              return (
                <div key={profile._id} className={styles.topProfileCard}>
                  <h3>{profile?.userId?.name}</h3>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
