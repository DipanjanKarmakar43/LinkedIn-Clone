import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { clientServer, getImageUrl } from "@/config";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "../../styles/Profile.module.css";
import {
  sendConnectionRequest,
  getAcceptedConnections,
  getSentRequests,
  getPendingRequests,
  downloadResume,
} from "@/config/redux/action/authAction";

const Post = ({ post }) => {
  if (!post) return null;

  const isImage = post.fileType?.startsWith("image/");
  const isVideo = post.fileType?.startsWith("video/");
  const isArticle = post.media && !isImage && !isVideo;

  return (
    <div key={post._id} className={styles.postItem}>
      <p>{post.body}</p>
      {post.media && (
        <div className={styles.postMedia}>
          {isImage && (
            <img
              src={getImageUrl(post.media)}
              alt="Post media"
              className={styles.postImage}
            />
          )}
          {isVideo && (
            <video
              controls
              src={getImageUrl(post.media)}
              className={styles.postVideo}
            />
          )}
          {isArticle && (
            <a
              href={getImageUrl(post.media)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.articleLink}
            >
              View Document ({post.media})
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default function UserProfilePage() {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { authState } = useSelector((state) => ({ authState: state.auth }));

  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const res = await clientServer.get(`/profile/${userId}`);
          setProfileData(res.data);
        } catch (error) {
          console.error("Failed to fetch profile", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAcceptedConnections({ token }));
      dispatch(getSentRequests({ token }));
      dispatch(getPendingRequests({ token }));
    }
  }, [dispatch]);

  const handleSendRequest = (connectionId) => {
    const token = localStorage.getItem("token");
    if (token && connectionId) {
      dispatch(sendConnectionRequest({ token, connectionId }));
    }
  };

  const handleDownloadResume = () => {
    if (profile?.userId?._id) {
      dispatch(downloadResume({ userId: profile.userId._id }));
    }
  };

  if (isLoading || !profileData || !profileData.profile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <p>{isLoading ? "Loading profile..." : "Profile not found."}</p>
        </DashboardLayout>
      </UserLayout>
    );
  }

  const { profile, posts } = profileData;
  const profilePicUrl = getImageUrl(profile.userId?.profilePicture);

  let buttonState = "connect";
  if (profile.userId?._id === authState.user?.userId?._id) {
    buttonState = "ownProfile";
  } else {
    const isConnected = authState.connections?.some(
      (conn) =>
        conn.userId._id === profile.userId._id ||
        conn.connectionId._id === profile.userId._id
    );
    const isRequestedByMe = authState.sentRequests?.some(
      (req) =>
        (req.connectionId?._id || req.connectionId) === profile.userId._id
    );
    const hasIncomingRequest = authState.connectionRequests?.some(
      (req) => req.userId._id === profile.userId._id
    );

    if (isConnected) buttonState = "connected";
    else if (isRequestedByMe) buttonState = "requested";
    else if (hasIncomingRequest) buttonState = "pending";
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.profilePageContainer}>
          <div className={styles.profileCard}>
            <div className={styles.profileCardBanner}>
              <div className={styles.profileCardImage}>
                <img src={profilePicUrl} alt="Profile" />
              </div>
            </div>
            <div className={styles.profileCardContent}>
              <h1>{profile.userId?.name}</h1>
              <p>{profile.userId?.email}</p>
            </div>
          </div>

          <div className={styles.profileAbout}>
            <h3>About</h3>
            <p>{profile.bio || "Not specified"}</p>
            <p>
              <strong>Current Role:</strong>{" "}
              {profile.currentPost || "Not specified"}
            </p>
          </div>

          <div className={styles.profileActions}>
            {buttonState === "connect" && (
              <button onClick={() => handleSendRequest(profile.userId._id)}>
                Connect{" "}
                <span className="material-symbols-outlined">person_add</span>
              </button>
            )}
            {buttonState === "requested" && <button disabled>Requested</button>}
            {buttonState === "pending" && (
              <button onClick={() => router.push("/myConnections")}>
                Respond to Request
              </button>
            )}
            {buttonState === "connected" && <button disabled>Connected</button>}
            {buttonState === "ownProfile" && (
              <button onClick={() => router.push("/profile")}>
                Edit Your Profile
              </button>
            )}
            <button onClick={handleDownloadResume}>
              Download Resume{" "}
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>

          <div className={styles.profilePosts}>
            <div className={styles.profilePostsSectionHeader}>
              <h3>Posts by {profile.userId?.name}</h3>
            </div>
            <div className={styles.profilePostDisplay}>
              {posts && posts.length > 0 ? (
                posts.map((post) => <Post key={post._id} post={post} />)
              ) : (
                <p>This user has no posts yet.</p>
              )}
            </div>
          </div>

          <div className={styles.profileExperience}>
            <div className={styles.profileSectionHeader}>
              <h3>Experience</h3>
            </div>
            {profile.pastWork && profile.pastWork.length > 0 ? (
              profile.pastWork.map((exp) => (
                <div key={exp._id} className={styles.experienceItem}>
                  <div>
                    <h4>
                      {exp.position} at {exp.company}
                    </h4>
                    <p>Years: {exp.years}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No experience listed.</p>
            )}
          </div>

          <div className={styles.profileEducation}>
            <div className={styles.profileSectionHeader}>
              <h3>Education</h3>
            </div>
            {profile.education && profile.education.length > 0 ? (
              profile.education.map((edu) => (
                <div key={edu._id} className={styles.educationItem}>
                  <div>
                    <h4>
                      {edu.degree} in {edu.fieldOfStudy}
                    </h4>
                    <p>{edu.school}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No education listed.</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}