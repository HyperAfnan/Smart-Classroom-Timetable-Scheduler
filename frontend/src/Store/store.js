import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./theme";

const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

export default store;
