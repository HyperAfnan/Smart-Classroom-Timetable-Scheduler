import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  roles: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.roles = action.payload.roles;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.roles = [];
    },
    setRoles(state, action) {
      state.roles = action.payload;
    },
  },
});

export const { setAuth, clearAuth, setRoles } = authSlice.actions;
export default authSlice.reducer;
