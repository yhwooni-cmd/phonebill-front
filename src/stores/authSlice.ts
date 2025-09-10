import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/common';
import { LoginResponseNormalized } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<LoginResponseNormalized>) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // 토큰을 localStorage 또는 sessionStorage에 저장
      const storage = user.userId ? localStorage : sessionStorage;
      storage.setItem('token', accessToken);
      storage.setItem('refreshToken', refreshToken);
      storage.setItem('user', JSON.stringify(user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // 스토리지에서 토큰 제거
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    },
    refreshTokenSuccess: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.token = action.payload.accessToken;
      const storage = state.user ? localStorage : sessionStorage;
      storage.setItem('token', action.payload.accessToken);
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreAuth: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
      const { token, refreshToken, user } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // 업데이트된 사용자 정보를 스토리지에도 저장
        const storage = state.user.userId ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenSuccess,
  clearError,
  restoreAuth,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;