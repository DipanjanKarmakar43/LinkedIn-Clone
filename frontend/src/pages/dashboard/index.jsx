import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styles from "../../styles/Dashboard.module.css";
import { useDispatch } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import { getAboutUser } from "@/config/redux/action/authAction";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        dispatch(getAllPosts());
        dispatch(getAboutUser({ token }));
      }
    }
  }, [dispatch, router]);

  return (
    <UserLayout>
      <div className={styles.dashboardContainer}>
        {authState.profileFetched && (
          <div>
            <h1>Welcome, {authState.user?.userId?.name}</h1>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
