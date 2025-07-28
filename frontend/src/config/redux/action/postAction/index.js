import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL, clientServer } from "@/config";

export const getAllPosts = createAsyncThunk(
  "posts/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (userData, thunkAPI) => {
    const { file, body } = userData;
    try {
      const formData = new FormData();
      formData.append("token", localStorage.getItem("token"));
      formData.append("body", body);
      formData.append("media", file);

      const response = await axios.post(`${baseURL}/post`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.status === 201
        ? thunkAPI.fulfillWithValue("Post uploaded successfully")
        : thunkAPI.rejectWithValue("Post upload failed");
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Post upload failed"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${baseURL}/delete_post`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { postId, token },
      });

      if (response.status === 200) {
        return postId;
      } else {
        return thunkAPI.rejectWithValue("Post deletion failed");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Post deletion failed"
      );
    }
  }
);

export const toggleLikePost = createAsyncThunk(
  "posts/toggleLikePost",
  async (postId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${baseURL}/toggle_like`, {
        postId,
        token,
      });
      return response.data.post;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update like status"
      );
    }
  }
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_comments", {
        params: {
          postId: postData.postId,
        },
      });
      return thunkAPI.fulfillWithValue({
        comments: response.data,
        postId: postData.postId,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

export const createComment = createAsyncThunk(
  "post/createComment",
  async (commentData, thunkAPI) => {
    try {
      // Assuming your API endpoint is /create_comment
      const response = await clientServer.post("/create_comment", commentData);
      return thunkAPI.fulfillWithValue(response.data.comment);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to post comment"
      );
    }
  }
);

// --- NEW ACTION: DELETE COMMENT ---
export const deleteComment = createAsyncThunk(
  "post/deleteComment",
  async ({ commentId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      // For axios.delete, the body must be sent in a `data` property
      await clientServer.delete("/delete_comment", {
        data: { commentId, token },
      });
      // Return the ID of the comment that was deleted
      return thunkAPI.fulfillWithValue(commentId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);

// --- NEW ACTION: EDIT COMMENT ---
export const editComment = createAsyncThunk(
  "post/editComment",
  async ({ commentId, updatedBody }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.put("/edit_comment", {
        commentId,
        updatedBody,
        token,
      });
      // Return the updated comment object from the server
      return thunkAPI.fulfillWithValue(response.data.comment);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to edit comment"
      );
    }
  }
);

// --- NEW ACTION: REPLY TO COMMENT ---
export const replyToComment = createAsyncThunk(
  "post/replyToComment",
  async ({ commentId, replyBody }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/reply_comment", {
        commentId, // This will be the parentCommentId on the backend
        replyBody,
        token,
      });
      // Return the new reply, which is also a comment object
      return thunkAPI.fulfillWithValue(response.data.reply);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to reply to comment"
      );
    }
  }
);
