import UserLayout from "@/layout/UserLayout";
import React, { useEffect } from "react";
import styles from "../../styles/MyConnections.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/authAction";

export default function MyConnections() {
  const authState = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  return (
    <UserLayout>
      <div className={styles.myConnectionContainer}>
        <div className={styles.connectionCountContainer}>
          <h1>My Connections</h1>
          <p>You have no connections yet.</p>
        </div>
        <div className={styles.connectionListContainer}>
          <div className={styles.pendingConnectionContainer}>
            <h1>No pending invitations</h1>
            <a href="#">Manage</a>
          </div>
          <hr />
          <div className={styles.connectionsDiscoverContainer}>
            <h2>Connections</h2>
            <p>You have no connections yet.</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
