import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  fetchAppointments,
  cancelAppointment,
  markArrived,
  updateAppointment,
} from "../store";
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiXCircle,
  FiCheckCircle,
  FiFilter,
  FiRefreshCw,
  FiChevronDown,
  FiBookOpen,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";

const AppointmentList = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { appointments, pagination, loading } = useSelector(
    (state) => state.appointment,
  );
  const { user } = useSelector((state) => state.auth);

  // Filter and Query states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [department, setDepartment] = useState(
    searchParams.get("department") || "",
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  // Sorting state
  const [sortField, setSortField] = useState(
    searchParams.get("sort") || "-createdAt",
  );

  // Modal consult / edit note states
  const [activeConsultApp, setActiveConsultApp] = useState(null);
  const [consultNotes, setConsultNotes] = useState("");
  const [consultPurpose, setConsultPurpose] = useState("");

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 12;

  const loadAppointments = useCallback(() => {
    const params = {
      page,
      limit,
      sort: sortField,
    };
    if (search) params.search = search;
    if (status) params.status = status;
    if (department) params.department = department;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    dispatch(fetchAppointments(params));
  }, [
    dispatch,
    page,
    limit,
    sortField,
    search,
    status,
    department,
    dateFrom,
    dateTo,
  ]);

  // Load appointments when query params change
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams);
      if (search.trim()) {
        currentParams.set("search", search.trim());
      } else {
        currentParams.delete("search");
      }
      currentParams.delete("page"); // reset to page 1
      setSearchParams(currentParams);
    }, 600);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (field, value) => {
    const currentParams = new URLSearchParams(searchParams);
    if (value) {
      currentParams.set(field, value);
    } else {
      currentParams.delete(field);
    }
    currentParams.delete("page");
    setSearchParams(currentParams);

    // Sync local states
    if (field === "status") setStatus(value);
    if (field === "department") setDepartment(value);
    if (field === "dateFrom") setDateFrom(value);
    if (field === "dateTo") setDateTo(value);
  };

  const handleSortToggle = (field) => {
    const isDesc = sortField === `-${field}`;
    const nextSort = isDesc ? field : `-${field}`;
    setSortField(nextSort);

    const currentParams = new URLSearchParams(searchParams);
    currentParams.set("sort", nextSort);
    setSearchParams(currentParams);
  };

  const handlePageChange = (newPage) => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set("page", newPage.toString());
    setSearchParams(currentParams);
  };

  const handleLimitChange = (newLimit) => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set("limit", newLimit.toString());
    currentParams.delete("page");
    setSearchParams(currentParams);
  };

  const handleMarkArrived = async (id) => {
    try {
      await dispatch(markArrived(id)).unwrap();
      toast.success("Patient marked as arrived");
    } catch (err) {
      toast.error(err || "Action failed");
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt("Please enter cancellation reason:");
    if (reason === null) return; // Discard click

    try {
      await dispatch(
        cancelAppointment({
          id,
          reason: reason || "Cancelled by Receptionist",
        }),
      ).unwrap();
      toast.success("Appointment cancelled successfully");
    } catch (err) {
      toast.error(err || "Action failed");
    }
  };

  const handleOpenConsult = (app) => {
    setActiveConsultApp(app);
    setConsultNotes(app.notes || "");
    setConsultPurpose(app.purpose || "");
  };

  const handleSaveConsult = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateAppointment({
          id: activeConsultApp._id,
          data: {
            notes: consultNotes,
            purpose: consultPurpose,
          },
        }),
      ).unwrap();

      toast.success("Consultation records updated successfully");
      setActiveConsultApp(null);
      loadAppointments();
    } catch (err) {
      toast.error(err || "Failed to update records");
    }
  };

  const getStatusStyle = (status) => {
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
    <div className="space-y-6 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-teal tracking-tight">
          Manage Appointments
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Filter, search, audit, and update appointment records for patients
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-primary-teal font-bold text-sm">
          <FiFilter className="w-4.5 h-4.5" />
          <span>Filter Criteria</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Search by Patient ID, Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-250 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-xs font-bold"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full bg-gray-50 border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:bg-white focus:border-action-gold outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="arrived">Arrived</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Department Filter */}
          <input
            type="text"
            placeholder="Filter Department..."
            value={department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="w-full px-3 py-2 border border-gray-250 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-xs font-bold"
          />

          {/* Reset Filters button */}
          <button
            onClick={() => {
              setSearch("");
              setStatus("");
              setDepartment("");
              setDateFrom("");
              setDateTo("");
              setSearchParams({});
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition text-xs cursor-pointer flex items-center justify-center gap-1"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Clear Filters
          </button>
        </div>

        {/* Date Ranges selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-250 rounded-xl outline-none focus:border-action-gold text-xs font-bold cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-250 rounded-xl outline-none focus:border-action-gold text-xs font-bold cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Table view layout */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-action-gold border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-semibold">
              Loading appointments list...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FiCalendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h4 className="font-bold text-gray-700">No Appointments Found</h4>
            <p className="text-xs mt-1">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider select-none">
                  <th
                    className="p-4 cursor-pointer hover:bg-gray-100 transition flex items-center gap-1"
                    onClick={() => handleSortToggle("date")}
                  >
                    Date & Time{" "}
                    <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition">
                    {/* Date / Time */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900">
                          {new Date(app.date).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <FiClock className="w-3 h-3 text-action-gold" />{" "}
                          {app.slotTime}
                        </p>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900">
                          {app.patient?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {app.patient?.patientId} | Ph: {app.patient?.phone}
                        </p>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-bold text-gray-800">
                        {app.doctor?.user?.name}
                      </p>
                    </td>

                    {/* Department */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-gray-50 py-1 px-3 rounded-full text-xs font-semibold border border-gray-100">
                        {app.department}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-block py-0.5 px-2 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusStyle(
                          app.status,
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Purpose of visit */}
                    <td className="p-4 max-w-[200px] truncate text-xs text-gray-500">
                      {app.purpose || "N/A"}
                    </td>

                    {/* Row Actions */}
                    <td className="p-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        {/* Arrive action (Receptionist/Admin) */}
                        {app.status === "scheduled" &&
                          (user?.role === "receptionist" ||
                            user?.role === "superadmin") && (
                            <button
                              onClick={() => handleMarkArrived(app._id)}
                              className="text-green-600 hover:bg-green-50 p-1.5 rounded-xl transition cursor-pointer"
                              title="Mark Patient Arrived"
                            >
                              <FiCheckCircle className="w-4.5 h-4.5" />
                            </button>
                          )}

                        {/* Cancel action (Receptionist/Admin) */}
                        {(app.status === "scheduled" ||
                          app.status === "arrived") &&
                          (user?.role === "receptionist" ||
                            user?.role === "superadmin") && (
                            <button
                              onClick={() => handleCancel(app._id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <FiXCircle className="w-4.5 h-4.5" />
                            </button>
                          )}

                        {/* Consult / Update Notes action (Doctor or Admin) */}
                        {user?.role === "doctor" && (
                          <button
                            onClick={() => handleOpenConsult(app)}
                            className="text-primary-teal hover:bg-primary-teal/5 p-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold border border-primary-teal/10"
                            title="Consult / Edit Notes"
                          >
                            <FiBookOpen className="w-4 h-4" /> Consult
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 border-t border-gray-100 bg-gray-50/50">
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>

      {/* Consult Update Notes Modal */}
      {activeConsultApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveConsultApp(null)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl z-10 mx-4 select-none animate-slideDown text-left">
            <button
              onClick={() => setActiveConsultApp(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FiX className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Consultation Notes
            </h3>
            <p className="text-xs text-gray-500 font-semibold mb-4">
              Patient: {activeConsultApp.patient?.name} (
              {activeConsultApp.patient?.patientId})
            </p>

            <form onSubmit={handleSaveConsult} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Purpose of Visit
                </label>
                <input
                  type="text"
                  value={consultPurpose}
                  onChange={(e) => setConsultPurpose(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Clinical Consultation Notes
                </label>
                <textarea
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  placeholder="Record symptoms, diagnosis, prescription advice..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm resize-none"
                />
              </div>

              <div className="flex gap-4 justify-center pt-2">
                <button
                  type="submit"
                  className="bg-primary-teal hover:bg-teal-800 text-white font-bold px-8 py-2.5 rounded-full transition text-sm shadow cursor-pointer uppercase tracking-wider"
                >
                  Save Consultation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConsultApp(null)}
                  className="bg-gray-150 text-gray-700 font-bold px-8 py-2.5 rounded-full transition text-sm cursor-pointer uppercase tracking-wider"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
