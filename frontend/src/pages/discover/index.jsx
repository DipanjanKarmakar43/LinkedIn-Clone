import React, { useEffect } from 'react'
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/authAction";


export default function DiscoverPage() {

    const authState = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    useEffect(() => {
        if(!authState.all_profiles_fetched) {
            dispatch(getAllUsers());
        }
    }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.discoverContainer}>
          <h1>Discover</h1>
          <p>Find new connections and opportunities.</p>
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}
