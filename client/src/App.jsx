import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";

// Store
import store, {
  socketAppointmentCreated,
  socketAppointmentUpdated,
} from "./store";

// Components
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

// Configuration
import { config } from "./config/config";

// Lazy loaded pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AppointmentScheduler = lazy(() => import("./pages/AppointmentScheduler"));
const AppointmentList = lazy(() => import("./pages/AppointmentList"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const AuditTrail = lazy(() => import("./pages/AuditTrail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InternalServerError = lazy(() => import("./pages/InternalServerError"));

// Loading spinner component
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
    <div className="animate-spin w-10 h-10 border-4 border-action-gold border-t-transparent rounded-full mb-3" />
    <span className="text-sm font-semibold tracking-wide">
      Loading portal view...
    </span>
  </div>
);

// Socket listener wrapper component to access Redux dispatch in context
const SocketListenerWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to WebSocket server
    const serverUrl = config.API_URL.replace("/api/v1", "");
    const socket = io(serverUrl);

    socket.on("connect", () => {
      socket.emit("join:scheduler");
    });

    // Real-Time Events Listening
    socket.on("appointment:created", (appointment) => {
      dispatch(socketAppointmentCreated(appointment));
    });

    socket.on("appointment:updated", (appointment) => {
      dispatch(socketAppointmentUpdated(appointment));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, dispatch]);

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SocketListenerWrapper>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Access Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />

                {/* Portal Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route
                    path="scheduler"
                    element={
                      <ProtectedRoute
                        allowedRoles={["superadmin", "receptionist"]}
                      >
                        <AppointmentScheduler />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="appointments" element={<AppointmentList />} />
                  <Route
                    path="appointments/:id"
                    element={<AppointmentList />}
                  />
                  {/* Super Admin Restricted */}
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute allowedRoles={["superadmin"]}>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="audit"
                    element={
                      <ProtectedRoute allowedRoles={["superadmin"]}>
                        <AuditTrail />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Error Boundaries */}
                <Route path="/server-error" element={<InternalServerError />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </SocketListenerWrapper>
        <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
