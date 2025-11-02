import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import themeReducer from "./theme";

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});

export default store;
