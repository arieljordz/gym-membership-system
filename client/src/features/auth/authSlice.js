import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../../api/axios.js";

const tokenFromStorage = localStorage.getItem("accessToken") || null;

export const loginUser = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", creds);
    const { user, accessToken, refreshToken } = data.data;
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    return user;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const registerUser = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/users/me");
    return data.data.user;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    /* ignore */
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: tokenFromStorage,
    status: "idle",
    initialized: false,
    error: null,
  },
  reducers: {
    setInitialized(state, action) {
      state.initialized = action.payload ?? true;
    },
    updateUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(loginUser.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(loginUser.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.user = a.payload;
      s.token = localStorage.getItem("accessToken");
      s.initialized = true;
    });
    b.addCase(loginUser.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload;
    });
    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.user = a.payload;
      s.initialized = true;
    });
    b.addCase(fetchMe.rejected, (s) => {
      s.user = null;
      s.token = null;
      s.initialized = true;
    });
    b.addCase(logoutUser.fulfilled, (s) => {
      s.user = null;
      s.token = null;
    });
  },
});

export const { setInitialized, updateUser } = authSlice.actions;
export default authSlice.reducer;
