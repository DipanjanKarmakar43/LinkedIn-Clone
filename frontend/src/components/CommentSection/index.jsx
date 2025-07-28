import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/Dashboard.module.css";
import { baseURL } from "@/config";
import {
  createComment,
  deleteComment,
  editComment,
  replyToComment,
} from "@/config/redux/action/postAction";

export default function CommentSection({ postId }) {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { comments, loadingComments } = useSelector((state) => state.posts);

  const profilePic = user?.userId?.profilePicture;
  const imageSrc = profilePic ? `${baseURL}/${profilePic}` : "/default.jpg";
  const currentUserId = user?.userId?._id;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(
      createComment({ postId, text: commentText, userId: currentUserId })
    );
    setCommentText("");
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedBody = e.target.elements.editInput.value;
    if (!updatedBody.trim() || !editingComment) return;
    dispatch(editComment({ commentId: editingComment._id, updatedBody }));
    setEditingComment(null);
  };

  const handleReplySubmit = (e, parentCommentId) => {
    e.preventDefault();
    const replyBody = e.target.elements.replyInput.value;
    if (!replyBody.trim()) return;
    dispatch(replyToComment({ commentId: parentCommentId, replyBody }));
    setReplyingTo(null);
  };

  const handleDelete = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      dispatch(deleteComment({ commentId }));
    }
  };

  return (
    <div className={styles.commentSection}>
      <div className={styles.addComment}>
        <img src={imageSrc} alt="Your profile" />
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            rows="1"
          />
          <button
            className={styles.commentButton}
            type="submit"
            disabled={!commentText.trim()}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>

      <div className={styles.commentsList}>
        {loadingComments ? (
          <p>Loading comments...</p>
        ) : (
          comments.map((comment) => {
            const isOwner = comment.userId?._id === currentUserId;

            return (
              <div
                key={comment._id}
                className={styles.commentItem}
                style={{ marginLeft: `${(comment.depth || 0) * 30}px` }}
              >
                <img
                  src={`${baseURL}/${
                    comment.userId?.profilePicture || "default.jpg"
                  }`}
                  alt={comment.userId?.name}
                />
                <div className={styles.commentContent}>
                  {editingComment?._id === comment._id ? (
                    <form onSubmit={handleEditSubmit}>
                      <textarea
                        name="editInput"
                        defaultValue={comment.body}
                        className={styles.editCommentTextarea}
                        autoFocus
                      />
                      <div className={styles.editActions}>
                        <button type="submit">Save</button>
                        <button
                          type="button"
                          onClick={() => setEditingComment(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className={styles.commentHeader}>
                        <strong>{comment.userId?.name || "User"}</strong>
                        <span>
                          · {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p>{comment.body}</p>
                    </>
                  )}

                  <div className={styles.commentActions}>
                    <button onClick={() => setReplyingTo(comment._id)}>
                      Reply
                    </button>
                    {isOwner && editingComment?._id !== comment._id && (
                      <>
                        <button onClick={() => setEditingComment(comment)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(comment._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {replyingTo === comment._id && (
                    <form
                      onSubmit={(e) => handleReplySubmit(e, comment._id)}
                      className={styles.replyForm}
                    >
                      <textarea
                        name="replyInput"
                        placeholder={`Replying to ${comment.userId?.name}`}
                        autoFocus
                      />
                      <div className={styles.replyActions}>
                        <button type="submit">Post Reply</button>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
        {comments.length === 0 && !loadingComments && <p>No comments yet.</p>}
      </div>
    </div>
  );
}
