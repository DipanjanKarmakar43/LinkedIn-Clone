import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styles from "../../styles/Dashboard.module.css";
import { useDispatch } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import { getAboutUser } from "@/config/redux/action/authAction";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  // const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        dispatch(getAllPosts());
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      }
    }
  }, []);

  return (
    <UserLayout>
      <div className={styles.dashboardContainer}>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </div>
    </UserLayout>
  );
}
