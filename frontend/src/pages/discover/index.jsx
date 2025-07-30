// DiscoverPage.js

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "../../styles/Discover.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  searchUsers,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";
import { baseURL } from "@/config";

export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        dispatch(searchUsers(searchTerm));
      } else {
        if (!authState.all_profiles_fetched) {
          dispatch(getAllUsers());
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, dispatch, authState.all_profiles_fetched]);

  const handleSendRequest = (connectionId) => {
    const token = localStorage.getItem("token");
    if (token && connectionId) {
      dispatch(sendConnectionRequest({ token, connectionId }));
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.discoverContainer}>
          <div className={styles.searchUserProfile}>
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <hr />
          <div className={styles.allUserProfile}>
            {authState.isLoading && <p>Loading...</p>}
            {!authState.isLoading && authState.all_users?.length > 0
              ? authState.all_users.map((profile) => {
                  if (profile?.userId?._id === authState?.user?.userId?._id) {
                    return null; // Don't show the logged-in user
                  }
                  return (
                    <div key={profile._id} className={styles.userProfileCard}>
                      <img
                        src={
                          profile?.userId?.profilePicture
                            ? `${baseURL}/${profile.userId.profilePicture}`
                            : "/default.jpg"
                        }
                        alt="Profile"
                        className={styles.userProfileImage}
                        // onClick={() =>
                        //   router.push(`/profile/${profile.userId._id}`)
                        // }
                      />
                      <div
                        className={styles.userProfileContent}
                        // onClick={() =>
                        //   router.push(`/profile/${profile.userId._id}`)
                        // }
                      >
                        <h2>{profile?.userId?.name}</h2>
                        <p>{profile?.currentPost || "No position specified"}</p>
                      </div>
                      <button
                        className={styles.connectButton}
                        onClick={() => handleSendRequest(profile.userId._id)}
                      >
                        Connect
                      </button>
                    </div>
                  );
                })
              : !authState.isLoading && <p>No users found.</p>}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
