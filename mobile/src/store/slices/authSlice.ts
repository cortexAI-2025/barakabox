import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../../services/api';

interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';
  avatar?: string;
  locale: string;
  walletBalance?: number;
  merchant?: { id: string; businessName: string; status: string };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const register = createAsyncThunk('auth/register', async (data: any, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data);
    await SecureStore.setItemAsync('accessToken', res.data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.data.refreshToken);
    return res.data.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data: any, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    await SecureStore.setItemAsync('accessToken', res.data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.data.refreshToken);
    return res.data.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Login failed');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return rejectWithValue('No token');
    const res = await authAPI.getMe();
    return { user: res.data.data, accessToken: token };
  } catch (e: any) {
    return rejectWithValue('Session expired');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (refreshToken) await authAPI.logout(refreshToken).catch(() => {});
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: AuthState) => { state.isLoading = true; state.error = null; };
    const setError = (state: AuthState, action: any) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(register.pending, setLoading)
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, setError)
      .addCase(login.pending, setLoading)
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, setError)
      .addCase(loadUser.pending, setLoading)
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
