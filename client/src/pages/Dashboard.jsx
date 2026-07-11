import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchAppointments, markArrived, fetchDoctors } from "../store";
import { auditAPI, userAPI, doctorAPI } from "../utils/api";
import {
  FiUsers,
  FiCalendar,
  FiActivity,
  FiClock,
  FiSearch,
  FiShield,
  FiUserPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";

// modals
import PatientSearchForm from "../components/PatientSearchForm";
import { formatAuditAction } from "../utils/formatters";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loading } = useSelector((state) => state.appointment);

  // Metrics for Admin Dashboard
  const [metrics, setMetrics] = useState({
    doctorsCount: 0,
    receptionistsCount: 0,
    appointmentsToday: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Filter today's appointments
  const todayDateString = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Basic setup
    dispatch(fetchDoctors());

    const params = {
      dateFrom: todayDateString,
      dateTo: todayDateString,
    };
    dispatch(fetchAppointments(params));

    if (user?.role === "superadmin") {
      fetchAdminMetrics();
    }
  }, [dispatch, user]);

  const fetchAdminMetrics = async () => {
    setDashboardLoading(true);
    try {
      const [docRes, userRes, auditRes] = await Promise.all([
        doctorAPI.getAll(),
        userAPI.getUsers({ role: "receptionist" }),
        auditAPI.getLogs({ page: 1, limit: 5 }), // Fetch recent logs
      ]);

      // Get count of today's appointments
      const responseApps = await dispatch(
        fetchAppointments({
          dateFrom: todayDateString,
          dateTo: todayDateString,
          limit: 100,
        }),
      ).unwrap();

      setMetrics({
        doctorsCount: docRes.data?.length || 0,
        receptionistsCount: userRes.data?.length || 0,
        appointmentsToday: responseApps.data?.length || 0,
      });

      setRecentLogs(auditRes.data || []);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleArrive = async (id) => {
    try {
      await dispatch(markArrived(id)).unwrap();
      toast.success("Patient marked as arrived successfully");
    } catch (err) {
      toast.error(err || "Failed to update appointment status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "arrived":
        return "bg-action-gold/15 text-yellow-800 border-action-gold/25";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Welcome banner */}
      <div className="bg-primary-teal text-white p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-lg border border-white/5">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full" />
        <div className="space-y-1 z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {user?.name}
          </h1>
          <p className="text-sm font-medium opacity-85">
            Clinic portal system dashboard — Active role:{" "}
            <span className="uppercase font-bold text-action-gold">
              {user?.role}
            </span>
          </p>
        </div>
        <div className="flex gap-3 z-10 flex-wrap">
          {user?.role === "receptionist" && (
            <Link
              to="/scheduler"
              className="bg-action-gold hover:bg-yellow-600 text-white font-bold px-6 py-2.5 rounded-full transition-all text-xs tracking-wider uppercase cursor-pointer flex items-center gap-1.5 shadow"
            >
              <FiCalendar className="w-4 h-4" /> Book Appointment
            </Link>
          )}
        </div>
      </div>

      {/* Render Role-Based Dashboards */}
      {user?.role === "superadmin" && (
        <div className="space-y-8">
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  Active Doctors
                </span>
                <p className="text-3xl font-extrabold text-gray-900">
                  {metrics.doctorsCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  Receptionists
                </span>
                <p className="text-3xl font-extrabold text-gray-900">
                  {metrics.receptionistsCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <FiUserPlus className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  Today's Appointments
                </span>
                <p className="text-3xl font-extrabold text-gray-900">
                  {metrics.appointmentsToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 text-action-gold rounded-2xl flex items-center justify-center">
                <FiActivity className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Audit Trail Preview */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-primary-teal flex items-center gap-2">
                  <FiShield className="w-5 h-5" /> Recent Audit Trails
                </h3>
                <Link
                  to="/audit"
                  className="text-sm font-semibold text-action-gold hover:underline"
                >
                  View All
                </Link>
              </div>

              {dashboardLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-100 rounded-lg animate-pulse w-full"
                    />
                  ))}
                </div>
              ) : recentLogs.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">
                  No logs generated yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div
                      key={log._id}
                      className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900">
                          {formatAuditAction(log.action)}
                        </p>
                        <p className="text-xs text-gray-400">
                          User: {log.user?.name || "System"} ({log.role})
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-primary-teal pb-4 mb-4 border-b border-gray-100">
                Quick Shortcuts
              </h3>
              <div className="space-y-3">
                <Link
                  to="/scheduler"
                  className="flex items-center gap-3 p-3 border border-gray-100 hover:border-primary-teal/20 hover:bg-primary-teal/5 rounded-xl transition text-sm font-bold text-gray-700"
                >
                  <FiCalendar className="w-5 h-5 text-primary-teal" />
                  <span>Configure schedules</span>
                </Link>
                <Link
                  to="/users"
                  className="flex items-center gap-3 p-3 border border-gray-100 hover:border-primary-teal/20 hover:bg-primary-teal/5 rounded-xl transition text-sm font-bold text-gray-700"
                >
                  <FiUsers className="w-5 h-5 text-primary-teal" />
                  <span>Manage users</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role === "receptionist" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Quick Search / Registration panel */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-primary-teal pb-4 mb-4 border-b border-gray-100 flex items-center gap-2">
              <FiSearch className="w-5 h-5" /> Patient Management
            </h3>
            <PatientSearchForm />
          </div>

          {/* Today's appointments scheduler */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-primary-teal flex items-center gap-2">
                <FiCalendar className="w-5 h-5" /> Today's Clinic Appointments
              </h3>
              <Link
                to="/appointments"
                className="text-sm font-semibold text-action-gold hover:underline"
              >
                Browse Appointments
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4 py-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-60" />
                <p>No appointments booked for today.</p>
                <Link
                  to="/scheduler"
                  className="text-sm text-primary-teal hover:underline font-bold mt-1 inline-block"
                >
                  Go configure or book slot
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <div
                    key={app._id}
                    className="flex justify-between items-center flex-wrap gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition"
                  >
                    <div className="space-y-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {app.patient?.name}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          ({app.patient?.patientId})
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        Doctor:{" "}
                        <span className="text-gray-700 font-semibold">
                          {app.doctor?.user?.name}
                        </span>{" "}
                        ({app.department})
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FiClock className="w-3.5 h-3.5" />
                        <span>Slot: {app.slotTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>

                      {app.status === "scheduled" && (
                        <button
                          onClick={() => handleArrive(app._id)}
                          className="bg-primary-teal hover:bg-teal-800 text-white font-bold py-1.5 px-4 rounded-full transition text-xs cursor-pointer"
                        >
                          Mark Arrived
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {user?.role === "doctor" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-primary-teal flex items-center gap-2">
                <FiCalendar className="w-5 h-5" /> Today's Consultations (
                {appointments.length})
              </h3>
              <Link
                to="/appointments"
                className="text-sm font-semibold text-action-gold hover:underline"
              >
                Consultation History
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4 py-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-60" />
                <p>You have no consultations scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <div
                    key={app._id}
                    className="flex justify-between items-center flex-wrap gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {app.patient?.name}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          ({app.patient?.patientId})
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        Gender:{" "}
                        <span className="text-gray-700 uppercase">
                          {app.patient?.gender}
                        </span>{" "}
                        | DOB:{" "}
                        <span className="text-gray-700">
                          {new Date(
                            app.patient?.dateOfBirth,
                          ).toLocaleDateString()}
                        </span>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FiClock className="w-3.5 h-3.5" />
                        <span>Slot: {app.slotTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                      <Link
                        to={`/appointments/${app._id}`}
                        className="bg-primary-teal hover:bg-teal-800 text-white font-bold py-2 px-5 rounded-full transition text-xs"
                      >
                        Consult
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
