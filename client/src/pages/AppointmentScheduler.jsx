import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctors,
  fetchSlots,
  selectDoctor,
  clearActiveSlots,
} from "../store";
import { FiCalendar, FiClock, FiSettings, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";

// Component imports
import BookingModal from "../components/BookingModal";
import DoctorScheduleModal from "../components/DoctorScheduleModal";

const AppointmentScheduler = () => {
  const dispatch = useDispatch();
  const { doctors, selectedDoctor, activeSlots, slotsLoading } = useSelector(
    (state) => state.doctor,
  );
  const { selectedPatient } = useSelector((state) => state.patient);
  const { user } = useSelector((state) => state.auth);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Fetch doctors on mount
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Load slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor?._id && date) {
      dispatch(fetchSlots({ doctorId: selectedDoctor._id, date }));
    } else {
      dispatch(clearActiveSlots());
    }
  }, [selectedDoctor, date, dispatch]);

  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    const doc = doctors.find((d) => d._id === docId);
    dispatch(selectDoctor(doc || null));
  };

  const handleSlotClick = (slot) => {
    if (slot.status !== "available") return;

    if (!selectedPatient) {
      toast.warning("Please select a patient first on the Dashboard!");
      return;
    }

    setSelectedSlot(slot.time);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    // Refresh slots
    if (selectedDoctor?._id && date) {
      dispatch(fetchSlots({ doctorId: selectedDoctor._id, date }));
    }
  };

  const getSlotStyle = (status) => {
    switch (status) {
      case "available":
        return "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 cursor-pointer shadow-sm active:scale-95";
      case "booked":
        return "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60";
      case "past":
        return "bg-gray-50 border-gray-150 text-gray-300 cursor-not-allowed line-through";
      default:
        return "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed";
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-teal tracking-tight">
            Appointment Scheduler
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Generate dynamic appointment slots, check availability, and book
            patient visits
          </p>
        </div>

        {/* Selected Patient Status */}
        {selectedPatient && (
          <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-2xl flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <span className="text-xs font-bold text-green-700">
              Booking for: {selectedPatient.name} ({selectedPatient.patientId})
            </span>
          </div>
        )}
      </div>

      {/* Selectors and Settings */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Doctor Dropdown */}
          <div className="space-y-1 flex-1 sm:flex-initial sm:w-64">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Select Doctor
            </label>
            <div className="relative">
              <select
                value={selectedDoctor?._id || ""}
                onChange={handleDoctorChange}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-gray-800 focus:bg-white focus:border-action-gold outline-none cursor-pointer"
              >
                <option value="">-- Select a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.user?.name} ({doc.department})
                  </option>
                ))}
              </select>
              <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1 flex-1 sm:flex-initial sm:w-48">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Appointment Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates on client
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:bg-white focus:border-action-gold outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Configure Schedule Button (Super Admin only) */}
        {user?.role === "superadmin" && selectedDoctor && (
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="w-full md:w-auto bg-primary-teal hover:bg-teal-800 text-white font-bold px-6 py-3 rounded-full transition-all text-sm cursor-pointer shadow flex items-center justify-center gap-2"
          >
            <FiSettings className="w-4.5 h-4.5" /> Configure Schedule
          </button>
        )}
      </div>

      {/* Dynamic Slot Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm min-h-[40vh] flex flex-col">
        <h3 className="text-lg font-bold text-primary-teal pb-4 border-b border-gray-100 flex items-center gap-2">
          <FiClock className="w-5 h-5" /> Available Appointment Slots
        </h3>

        {slotsLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="animate-spin w-10 h-10 border-4 border-action-gold border-t-transparent rounded-full mb-4" />
            <p className="text-sm font-semibold">
              Generating doctor schedule slots...
            </p>
          </div>
        ) : !selectedDoctor ? (
          <div className="flex-grow flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <FiCalendar className="w-16 h-16 opacity-30 mb-4" />
            <h4 className="text-base font-bold text-gray-700">
              No Doctor Selected
            </h4>
            <p className="text-sm max-w-xs mt-1">
              Please select a doctor to load the dynamic slots schedule.
            </p>
          </div>
        ) : activeSlots.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <FiCalendar className="w-16 h-16 opacity-30 mb-4" />
            <h4 className="text-base font-bold text-gray-700">
              No Slots Generated
            </h4>
            <p className="text-sm max-w-xs mt-1">
              The doctor is not configured to work on this day, or has no active
              working sessions.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex-grow">
            {/* Slot Legend */}
            <div className="flex gap-4 mb-6 text-xs font-semibold flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-green-50 border border-green-200 rounded" />
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-gray-150 border border-gray-200 rounded" />
                <span className="text-gray-400">Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-gray-50 border border-gray-100 rounded line-through" />
                <span className="text-gray-300">Past</span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {activeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={slot.status !== "available"}
                  className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all select-none ${getSlotStyle(
                    slot.status,
                  )}`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Render Modals */}
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          doctor={selectedDoctor}
          date={date}
          slotTime={selectedSlot}
          patient={selectedPatient}
          onSuccess={handleBookingSuccess}
        />
      )}

      {isScheduleModalOpen && (
        <DoctorScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          doctor={selectedDoctor}
        />
      )}
    </div>
  );
};

export default AppointmentScheduler;
