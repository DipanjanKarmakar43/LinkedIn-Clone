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
  getAcceptedConnections,
  getSentRequests,
  getPendingRequests,
} from "@/config/redux/action/authAction";
import { getImageUrl } from "@/config";

export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Effect 1: Runs only ONCE to fetch all connection statuses
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAcceptedConnections({ token }));
      dispatch(getSentRequests({ token }));
      dispatch(getPendingRequests({ token }));
    }
  }, [dispatch]);

  // Effect 2: Handles searching for users
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
            {authState.isLoading && authState.all_users.length === 0 && (
              <p>Loading...</p>
            )}
            {!authState.isLoading && authState.all_users?.length > 0
              ? authState.all_users.map((profile) => {
                  if (!profile || !profile.userId) return null;

                  const loggedInUserId = authState.user?.userId?._id;
                  if (profile.userId._id === loggedInUserId) {
                    return null;
                  }

                  let buttonState = "connect";

                  const isConnected = authState.connections?.some(
                    (conn) =>
                      conn.userId._id === profile.userId._id ||
                      conn.connectionId._id === profile.userId._id
                  );

                  const isRequestedByMe = authState.sentRequests?.some(
                    (req) => {
                      const receiverId =
                        typeof req.connectionId === "object"
                          ? req.connectionId?._id
                          : req.connectionId;
                      return receiverId === profile.userId._id;
                    }
                  );

                  const hasIncomingRequest = authState.connectionRequests?.some(
                    (req) => req.userId._id === profile.userId._id
                  );

                  if (isConnected) {
                    buttonState = "connected";
                  } else if (isRequestedByMe) {
                    buttonState = "requested";
                  } else if (hasIncomingRequest) {
                    buttonState = "pending";
                  }

                  return (
                    <div key={profile._id} className={styles.userProfileCard}>
                      <div
                        className={styles.profileClickableArea}
                        onClick={() =>
                          router.push(`/profile/${profile.userId._id}`)
                        }
                      >
                        <img
                          src={getImageUrl(profile.userId.profilePicture)}
                          alt="Profile"
                          className={styles.userProfileImage}
                        />
                        <div className={styles.userProfileContent}>
                          <h2>{profile.userId.name}</h2>
                          <p>
                            {profile.currentPost || "No position specified"}
                          </p>
                        </div>
                      </div>

                      {buttonState === "connect" && (
                        <button
                          className={styles.connectButton}
                          onClick={() => handleSendRequest(profile.userId._id)}
                        >
                          Connect
                        </button>
                      )}
                      {buttonState === "requested" && (
                        <button className={styles.requestedButton} disabled>
                          Requested
                        </button>
                      )}
                      {buttonState === "pending" && (
                        <button
                          className={styles.requestedButton}
                          onClick={() => router.push("/myConnections")}
                        >
                          Respond
                        </button>
                      )}
                      {buttonState === "connected" && (
                        <button className={styles.connectedButton} disabled>
                          Connected
                        </button>
                      )}
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