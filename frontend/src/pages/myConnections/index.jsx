import UserLayout from "@/layout/UserLayout";
import React from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";

export default function MyConnectionsPage() {
  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.myConnectionContainer}>
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
      </DashboardLayout>
    </UserLayout>
  );
}
