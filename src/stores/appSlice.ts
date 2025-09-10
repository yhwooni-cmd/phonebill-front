import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  loading: boolean;
  error: string | null;
  currentPage: string;
}

const initialState: AppState = {
  loading: false,
  error: null,
  currentPage: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setCurrentPage,
} = appSlice.actions;

export default appSlice.reducer;