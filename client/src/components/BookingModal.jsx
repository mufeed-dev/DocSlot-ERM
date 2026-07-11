import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { bookAppointment } from "../store";
import { toast } from "react-toastify";
import { FiX, FiCalendar, FiClock, FiUser, FiInfo } from "react-icons/fi";

const BookingModal = ({
  isOpen,
  onClose,
  doctor,
  date,
  slotTime,
  patient,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(
        bookAppointment({
          patient: patient._id,
          doctor: doctor._id,
          department: doctor.department,
          date,
          slotTime,
          purpose,
          notes,
        }),
      ).unwrap();

      toast.success("Appointment booked successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl z-10 mx-4 select-none animate-slideDown">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Confirm Appointment
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient info card summary */}
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <FiUser className="w-4 h-4 text-primary-teal" />
              <span>Patient Details</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{patient?.name}</p>
              <p className="text-xs text-gray-500 font-medium">
                ID: {patient?.patientId} | Ph: {patient?.phone}
              </p>
            </div>
          </div>

          {/* Appointment details summary */}
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <FiCalendar className="w-4 h-4 text-primary-teal" />
              <span>Consultation details</span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600 font-semibold">
              <p>
                Doctor:{" "}
                <span className="text-gray-900 font-bold">
                  {doctor?.user?.name}
                </span>
              </p>
              <p>
                Department:{" "}
                <span className="text-gray-900 font-bold">
                  {doctor?.department}
                </span>
              </p>
              <div className="flex gap-4 pt-1 flex-wrap">
                <p className="flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5 text-action-gold" />
                  <span>Date: {new Date(date).toLocaleDateString()}</span>
                </p>
                <p className="flex items-center gap-1">
                  <FiClock className="w-3.5 h-3.5 text-action-gold" />
                  <span>Time Slot: {slotTime}</span>
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 my-1" />

          {/* Form fields */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FiInfo className="w-3.5 h-3.5" /> Purpose of Visit
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              placeholder="e.g. Regular Checkup, Fever, Consultation"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide symptoms or extra context..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm resize-none"
            />
          </div>

          <div className="flex gap-4 justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-action-gold hover:bg-yellow-600 text-white font-bold px-8 py-2.5 rounded-full transition text-sm shadow disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {loading ? "Confirming..." : "Book Slot"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-2.5 rounded-full transition text-sm cursor-pointer uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
