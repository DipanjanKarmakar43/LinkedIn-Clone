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

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    restPostId: (state) => {
      state.postId = "";
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
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to create post";
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const updatedPostFromServer = action.payload;
        const postIndex = state.posts.findIndex(
          (p) => p._id === updatedPostFromServer._id
        );
        if (postIndex !== -1) {
          state.posts[postIndex].likes = updatedPostFromServer.likes;
        }
      })
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedPostId = action.payload;
        state.posts = state.posts.filter((post) => post._id !== deletedPostId);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to delete post";
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload);
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        const comments = action.payload.comments.comments;
        const commentMap = {};
        comments.forEach((comment) => {
          const parentId = comment.parentCommentId || null;
          if (!commentMap[parentId]) {
            commentMap[parentId] = [];
          }
          commentMap[parentId].push(comment);
          commentMap[parentId].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
        const buildThread = (parentId, depth) => {
          let thread = [];
          const children = commentMap[parentId];
          if (children) {
            children.forEach((child) => {
              thread.push({ ...child, depth: depth });
              thread = thread.concat(buildThread(child._id, depth + 1));
            });
          }
          return thread;
        };
        const sortedComments = buildThread(null, 0);
        state.comments = sortedComments;
        state.postId = action.payload.postId;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(
          (comment) => comment._id !== action.payload
        );
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        const index = state.comments.findIndex(
          (comment) => comment._id === updatedComment._id
        );
        if (index !== -1) {
          state.comments[index] = updatedComment;
        }
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        const newReply = action.payload;
        const parentIndex = state.comments.findIndex(
          (comment) => comment._id === newReply.parentCommentId
        );
        if (parentIndex !== -1) {
          state.comments.splice(parentIndex + 1, 0, newReply);
        } else {
          state.comments.push(newReply);
        }
      });
  },
});

export const { reset, restPostId } = postSlice.actions;
export default postSlice.reducer;
