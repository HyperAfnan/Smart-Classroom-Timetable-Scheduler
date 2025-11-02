import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  mode: "system",
  resolvedMode: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    hydrateTheme(state, action) {
      const { mode, resolvedMode } = action.payload || {};
      if (mode) state.mode = mode;
      if (resolvedMode) state.resolvedMode = resolvedMode;
    },
    setMode(state, action) {
      state.mode = action.payload;
    },
    setResolvedMode(state, action) {
      state.resolvedMode = action.payload;
    },
    toggleMode(state) {
      if (state.mode === "system") {
        state.mode = state.resolvedMode === "dark" ? "light" : "dark";
        state.resolvedMode = state.mode;
        return;
      }
      state.mode = state.mode === "dark" ? "light" : "dark";
      state.resolvedMode = state.mode;
    },
  },
});

export const { hydrateTheme, setMode, setResolvedMode, toggleMode } =
  themeSlice.actions;

export const selectThemeMode = (state) => state.theme.mode;
export const selectResolvedTheme = (state) => state.theme.resolvedMode;

export default themeSlice.reducer;
