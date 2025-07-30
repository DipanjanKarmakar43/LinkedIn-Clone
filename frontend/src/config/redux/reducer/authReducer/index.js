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
        state.message = "Knocking the door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.user = action.payload.user; // This might be redundant if getAboutUser is called after
        state.message = "Login successful!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message || "Invalid credentials";
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering you...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.message = "Registration successful!";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message || "Registration failed";
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
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload; // This is where the user object with full profile is stored
      })
      .addCase(getAboutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAboutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message || "Failed to fetch profile";
      })
      // Get All Users
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.message = "Searching...";
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_users = action.payload;
        state.message = "Search complete.";
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.all_users = [];
        state.message = action.payload.message || "Search failed";
      })
      // ✨ ADDED REDUCERS FOR PROFILE UPDATE
      .addCase(updateUserProfileData.pending, (state) => {
        state.isLoading = true;
        state.message = "Updating profile...";
      })
      .addCase(updateUserProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message =
          action.payload.message || "Profile updated successfully!";
        // We don't need to set state.user here, as the dispatched 'getAboutUser'
        // action will handle updating the user object with the latest data.
      })
      .addCase(updateUserProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message || "Failed to update profile.";
      })
      .addCase(sendConnectionRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.connectionRequests = action.payload.requests;
      })
      .addCase(getAcceptedConnections.fulfilled, (state, action) => {
        state.connections = action.payload.connections;
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
        state.message = action.payload.message;
      })
      .addCase(updateProfilePicture.pending, (state) => {
        state.isLoading = true;
        state.message = "Uploading picture...";
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message || "Failed to upload picture.";
      });
  },
});

export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere } =
  authSlice.actions;

export default authSlice.reducer;
