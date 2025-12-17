import React, { useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "../../styles/MyConnections.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingRequests,
  getAcceptedConnections,
  acceptConnectionRequest,
} from "@/config/redux/action/authAction";
import { getImageUrl } from "@/config";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const { connectionRequests, connections, user } = authState;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getPendingRequests({ token }));
      dispatch(getAcceptedConnections({ token }));
    }
  }, [dispatch]);

  const handleAccept = (requestId) => {
    const token = localStorage.getItem("token");
    if (token && requestId) {
      dispatch(acceptConnectionRequest({ token, requestId }));
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.myConnectionContainer}>
          <div className={styles.connectionListContainer}>
            {/* Pending Invitations Section */}
            <div className={styles.pendingConnectionContainer}>
              <h1>Invitations</h1>
              <div className={styles.pendingConnectionGrid}>
                {connectionRequests && connectionRequests.length > 0 ? (
                  connectionRequests.map((req) => (
                    <div key={req._id} className={styles.connectionCard}>
                      <div className={styles.profileBanner}>
                        <img
                          src={getImageUrl(req.userId.profilePicture)}
                          alt="profile"
                          className={styles.connectionImage}
                          onClick={() =>
                            router.push(`/profile/${req.userId._id}`)
                          }
                        />
                      </div>
                      <div className={styles.connectionInfo}>
                        <h3
                          onClick={() =>
                            router.push(`/profile/${req.userId._id}`)
                          }
                        >
                          {req.userId.name}
                        </h3>
                        <p>{req.userId.email}</p>
                      </div>
                      <button
                        className={styles.acceptButton}
                        onClick={() => handleAccept(req._id)}
                      >
                        Accept
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No pending invitations.</p>
                )}
              </div>
            </div>
            {/* Accepted Connections Section */}
            <div className={styles.connectionsDiscoverContainer}>
              <h2>{connections?.length || 0} Connections</h2>
              <div className={styles.acceptedConnectionGrid}>
                {connections && connections.length > 0 ? (
                  connections.map((conn) => {
                    // Determine who the other person is in the connection
                    const friend =
                      conn.userId._id === user.userId._id
                        ? conn.connectionId
                        : conn.userId;
                    return (
                      <div key={conn._id} className={styles.connectionCard}>
                        <div className={styles.profileBanner}>
                          <img
                            src={getImageUrl(friend.profilePicture)}
                            alt="profile"
                            className={styles.connectionImage}
                            onClick={() =>
                              router.push(`/profile/${friend._id}`)
                            }
                          />
                        </div>
                        <div className={styles.connectionInfo}>
                          <h3
                            onClick={() =>
                              router.push(`/profile/${friend._id}`)
                            }
                          >
                            {friend.name}
                          </h3>
                          <p>{friend.email}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>
                    You have no connections yet. Go to the Discover page to find
                    people!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}