import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        name: user.name,
        email: user.email,
        password: user.password,
        username: user.username,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        emailOrUsername: user.emailOrUsername,
        password: user.password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        return thunkAPI.rejectWithValue("No token received");
      }
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      localStorage.removeItem("token");
      return thunkAPI.fulfillWithValue("User logged out successfully");
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      if (!user.token) {
        return thunkAPI.rejectWithValue("No token provided");
      }
      const response = await clientServer.get("/get_user_and_profile", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  "user/searchUsers",
  async (query, thunkAPI) => {
    try {
      if (!query) {
        return thunkAPI.rejectWithValue("Search term cannot be empty");
      }
      const response = await clientServer.get("/users/search", {
        params: { q: query },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const updateUserProfileData = createAsyncThunk(
  "user/updateProfileData",
  async (updateData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue(
          "Authorization failed: No token found."
        );
      }
      const payload = { token, ...updateData };
      const response = await clientServer.post("/update_profile_data", payload);
      thunkAPI.dispatch(getAboutUser({ token }));
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async ({ token, connectionId }, thunkAPI) => {
    try {
      const response = await clientServer.post("/connections/request", {
        token,
        connectionId,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const getPendingRequests = createAsyncThunk(
  "user/getPendingRequests",
  async ({ token }, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/connections/pending-requests",
        { token }
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const getAcceptedConnections = createAsyncThunk(
  "user/getAcceptedConnections",
  async ({ token }, thunkAPI) => {
    try {
      const response = await clientServer.post("/connections", { token });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  "user/acceptConnectionRequest",
  async ({ token, requestId }, thunkAPI) => {
    try {
      const response = await clientServer.post("/connections/accept", {
        token,
        requestId,
      });
      thunkAPI.dispatch(getPendingRequests({ token }));
      thunkAPI.dispatch(getAcceptedConnections({ token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  "user/updateProfilePicture",
  async (formData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found.");
      }

      // The backend expects the token in the body, so we append it to FormData
      formData.append("token", token);

      const response = await clientServer.post(
        "/update_profile_picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // After successful upload, refresh the user's profile data
      thunkAPI.dispatch(getAboutUser({ token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);
