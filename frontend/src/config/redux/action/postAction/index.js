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
