import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import doctorReducer from "./doctorSlice";
import appointmentReducer from "./appointmentSlice";
import patientReducer from "./patientSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    doctor: doctorReducer,
    appointment: appointmentReducer,
    patient: patientReducer,
  },
});

export default store;
