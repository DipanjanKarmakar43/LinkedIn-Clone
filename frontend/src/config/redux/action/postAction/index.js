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
      if (file) {
        formData.append("media", file);
      }

      const response = await axios.post(`${baseURL}/post`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Post upload failed"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async ({ postId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found.");
      }

      // The backend needs the token for authorization
      const response = await clientServer.delete(`/posts/delete/${postId}`, {
        data: { token: token }, // Pass token in the request body
      });

      // Return the ID of the deleted post to remove it from the state
      return thunkAPI.fulfillWithValue(postId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
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
      const response = await clientServer.post("/create_comment", commentData);
      return thunkAPI.fulfillWithValue(response.data.comment);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to post comment"
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  "post/deleteComment",
  async ({ commentId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      await clientServer.delete("/delete_comment", {
        data: { commentId, token },
      });
      return thunkAPI.fulfillWithValue(commentId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);

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
      return thunkAPI.fulfillWithValue(response.data.comment);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to edit comment"
      );
    }
  }
);

export const replyToComment = createAsyncThunk(
  "post/replyToComment",
  async ({ commentId, replyBody }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.post("/reply_comment", {
        commentId,
        replyBody,
        token,
      });
      return thunkAPI.fulfillWithValue(response.data.reply);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to reply to comment"
      );
    }
  }
);

export const getUserPosts = createAsyncThunk(
  "posts/getUserPosts",
  async ({ token }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await clientServer.get("/api/posts/my_posts", config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data || error.message);
    }
  }
);
