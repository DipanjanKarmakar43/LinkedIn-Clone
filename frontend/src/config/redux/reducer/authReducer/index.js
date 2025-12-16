import { createSlice } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  getAboutUser,
  getAllUsers,
  logoutUser,
  searchUsers,
  updateUserProfileData,
  sendConnectionRequest,
  getPendingRequests,
  getAcceptedConnections,
  acceptConnectionRequest,
  updateProfilePicture,
  getSentRequests,
} from "@/config/redux/action/authAction";

const initialState = {
  user: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionRequests: [],
  sentRequests: [],
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    hadleLoginUser: (state) => {
      state.message = "hello";
    },
    emptyMessage: (state) => {
      state.message = "";
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
      state.loggedIn = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Invalid credentials";
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Registration failed";
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        return {
          ...initialState,
          message: "Logged out successfully",
        };
      })
      // Get User Profile
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileFetched = true;
        state.user = action.payload;
      })
      .addCase(getAboutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAboutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch profile";
      })
      // Get All Users
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.all_users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.all_users = [];
      })
      // Update Profile
      .addCase(updateUserProfileData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(updateUserProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Failed to update profile.";
      })
      // Connections
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = action.payload.message;
        state.sentRequests.push(action.payload.request);
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Failed to send request";
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.connectionRequests = action.payload.requests;
      })
      .addCase(getAcceptedConnections.fulfilled, (state, action) => {
        state.connections = action.payload.connections;
      })
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload.requests;
      })
      .addCase(acceptConnectionRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(acceptConnectionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Failed to accept request";
      })
      // Profile Picture
      .addCase(updateProfilePicture.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Failed to upload picture.";
      });
  },
});

export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere } =
  authSlice.actions;

export default authSlice.reducer;
