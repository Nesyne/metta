import { configureStore } from "@reduxjs/toolkit";
import medTermReducer from "./slices/medTermSlice";
import authReducer from "./slices/authSlice";
import db from "./firestore/firebase";

const store = configureStore({
  reducer: {
    medTerms: medTermReducer,
  },
});

export default store;
