import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPosts,
  createPost,
  deletePost,
  toggleLikePost,
  getAllComments,
  createComment,
  deleteComment,
  editComment,
  replyToComment,
  getUserPosts,
} from "@/config/redux/action/postAction";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  comments: [],
  postId: "",
};

const buildThread = (comments, parentId, depth) => {
  let thread = [];
  const children = comments.filter(
    (c) => String(c.parentCommentId) === String(parentId)
  );

  if (children.length > 0) {
    children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    children.forEach((child) => {
      thread.push({ ...child, depth: depth });
      thread = thread.concat(buildThread(comments, child._id, depth + 1));
    });
  }
  return thread;
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    restPostId: (state) => {
      state.postId = "";
    },
    addPostRealTime: (state, action) => {
      if (!state.posts.find((p) => p._id === action.payload._id)) {
        state.posts.unshift(action.payload);
      }
    },
    removePostRealTime: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
    updatePostRealTime: (state, action) => {
      const updatedPost = action.payload;
      const index = state.posts.findIndex((p) => p._id === updatedPost._id);
      if (index !== -1) {
        state.posts[index] = updatedPost;
      }
    },
    addCommentOrReplyRealTime: (state, action) => {
      const newComment = action.payload;
      if (state.postId === newComment.postId) {
        if (!state.comments.find((c) => c._id === newComment._id)) {
          const allComments = [...state.comments, newComment];
          const topLevelComments = allComments.filter(
            (c) => !c.parentCommentId
          );
          state.comments = buildThread(allComments, null, 0);
        }
      }
    },
    removeCommentRealTime: (state, action) => {
      const { commentId, postId } = action.payload;
      if (state.postId === postId) {
        const commentsToDelete = [commentId];
        const commentIndex = state.comments.findIndex(
          (c) => c._id === commentId
        );
        if (commentIndex === -1) return;
        const parentDepth = state.comments[commentIndex].depth;
        for (let i = commentIndex + 1; i < state.comments.length; i++) {
          if (state.comments[i].depth > parentDepth) {
            commentsToDelete.push(state.comments[i]._id);
          } else {
            break;
          }
        }
        state.comments = state.comments.filter(
          (comment) => !commentsToDelete.includes(comment._id)
        );
      }
    },
    updateCommentRealTime: (state, action) => {
      const updatedComment = action.payload;
      if (state.postId === updatedComment.postId) {
        const index = state.comments.findIndex(
          (c) => c._id === updatedComment._id
        );
        if (index !== -1) {
          const originalDepth = state.comments[index].depth;
          state.comments[index] = { ...updatedComment, depth: originalDepth };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.postFetched = true;
        state.posts = action.payload.posts;
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to fetch posts";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to create post";
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedPostId = action.payload;
        state.posts = state.posts.filter((post) => post._id !== deletedPostId);
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const parentId = action.payload.parentCommentId;
        if (parentId) {
          // It's a reply
          const parentIndex = state.comments.findIndex(
            (comment) => comment._id === parentId
          );
          if (parentIndex !== -1) {
            const parentComment = state.comments[parentIndex];
            const replyWithDepth = {
              ...action.payload,
              depth: (parentComment.depth || 0) + 1,
            };
            let lastChildIndex = parentIndex;
            for (let i = parentIndex + 1; i < state.comments.length; i++) {
              if (state.comments[i].depth > parentComment.depth) {
                lastChildIndex = i;
              } else {
                break;
              }
            }
            state.comments.splice(lastChildIndex + 1, 0, replyWithDepth);
          }
        } else {
          // It's a top-level comment
          const newComment = { ...action.payload, depth: 0 };
          state.comments.unshift(newComment);
        }
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        const comments = action.payload.comments.comments;
        const topLevelComments = comments.filter((c) => !c.parentCommentId);
        const sortedComments = buildThread(comments, null, 0);
        state.comments = sortedComments;
        state.postId = action.payload.postId;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedCommentId = action.payload;
        const commentsToDelete = [deletedCommentId];
        const commentIndex = state.comments.findIndex(
          (c) => c._id === deletedCommentId
        );
        if (commentIndex === -1) return;
        const parentDepth = state.comments[commentIndex].depth;
        for (let i = commentIndex + 1; i < state.comments.length; i++) {
          if (state.comments[i].depth > parentDepth) {
            commentsToDelete.push(state.comments[i]._id);
          } else {
            break;
          }
        }
        state.comments = state.comments.filter(
          (comment) => !commentsToDelete.includes(comment._id)
        );
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        const index = state.comments.findIndex(
          (comment) => comment._id === updatedComment._id
        );
        if (index !== -1) {
          const originalDepth = state.comments[index].depth;
          state.comments[index] = { ...updatedComment, depth: originalDepth };
        }
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        const newReply = action.payload;
        const parentIndex = state.comments.findIndex(
          (comment) => comment._id === newReply.parentCommentId
        );
        if (parentIndex !== -1) {
          const parentComment = state.comments[parentIndex];
          const replyWithDepth = {
            ...newReply,
            depth: (parentComment.depth || 0) + 1,
          };
          let lastChildIndex = parentIndex;
          for (let i = parentIndex + 1; i < state.comments.length; i++) {
            if (state.comments[i].depth > parentComment.depth) {
              lastChildIndex = i;
            } else {
              break;
            }
          }
          state.comments.splice(lastChildIndex + 1, 0, replyWithDepth);
        }
      })
      .addCase(getUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts || action.payload;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  reset,
  restPostId,
  addPostRealTime,
  removePostRealTime,
  updatePostRealTime,
  addCommentOrReplyRealTime,
  removeCommentRealTime,
  updateCommentRealTime,
} = postSlice.actions;

export default postSlice.reducer;
