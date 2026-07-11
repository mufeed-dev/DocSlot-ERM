import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { configureSchedule, fetchSchedule } from "../store";
import { toast } from "react-toastify";
import { FiX, FiPlus, FiTrash2, FiClock, FiCalendar } from "react-icons/fi";

const DoctorScheduleModal = ({ isOpen, onClose, doctor }) => {
  const dispatch = useDispatch();
  const { activeSchedule } = useSelector((state) => state.doctor);
  const [loading, setLoading] = useState(false);

  const [workingDays, setWorkingDays] = useState([]);
  const [slotDuration, setSlotDuration] = useState(15);
  const [sessions, setSessions] = useState([
    { startTime: "09:00", endTime: "12:00" },
  ]);
  const [breaks, setBreaks] = useState([
    { startTime: "12:00", endTime: "13:00" },
  ]);

  const daysOfWeek = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
  ];

  // Fetch existing schedule when opened
  useEffect(() => {
    if (isOpen && doctor?._id) {
      dispatch(fetchSchedule(doctor._id));
    }
  }, [isOpen, doctor, dispatch]);

  // Load existing schedule into form state if it exists
  useEffect(() => {
    if (activeSchedule && activeSchedule.doctor === doctor?._id) {
      setWorkingDays(activeSchedule.workingDays || []);
      setSlotDuration(activeSchedule.slotDuration || 15);
      setSessions(
        activeSchedule.sessions || [{ startTime: "09:00", endTime: "12:00" }],
      );
      setBreaks(activeSchedule.breaks || []);
    } else {
      // Default clean values
      setWorkingDays([1, 2, 3, 4, 5]); // Mon-Fri
      setSlotDuration(15);
      setSessions([{ startTime: "09:00", endTime: "12:00" }]);
      setBreaks([{ startTime: "12:00", endTime: "13:00" }]);
    }
  }, [activeSchedule, doctor]);

  if (!isOpen) return null;

  const handleDayToggle = (dayVal) => {
    if (workingDays.includes(dayVal)) {
      setWorkingDays(workingDays.filter((d) => d !== dayVal));
    } else {
      setWorkingDays([...workingDays, dayVal].sort());
    }
  };

  const handleAddSession = () => {
    setSessions([...sessions, { startTime: "13:00", endTime: "17:00" }]);
  };

  const handleRemoveSession = (idx) => {
    setSessions(sessions.filter((_, i) => i !== idx));
  };

  const handleSessionChange = (idx, field, value) => {
    const updated = sessions.map((s, i) => {
      if (i === idx) return { ...s, [field]: value };
      return s;
    });
    setSessions(updated);
  };

  const handleAddBreak = () => {
    setBreaks([...breaks, { startTime: "12:00", endTime: "13:00" }]);
  };

  const handleRemoveBreak = (idx) => {
    setBreaks(breaks.filter((_, i) => i !== idx));
  };

  const handleBreakChange = (idx, field, value) => {
    const updated = breaks.map((b, i) => {
      if (i === idx) return { ...b, [field]: value };
      return b;
    });
    setBreaks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (workingDays.length === 0) {
      toast.warning("Please select at least one working day.");
      return;
    }

    if (sessions.length === 0) {
      toast.warning("Please configure at least one active working session.");
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        configureSchedule({
          doctor: doctor._id,
          workingDays,
          slotDuration: parseInt(slotDuration, 10),
          sessions,
          breaks,
        }),
      ).unwrap();

      toast.success("Schedule configured successfully!");
      onClose();
    } catch (err) {
      toast.error(
        err || "Failed to configure schedule. Please verify sessions.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl z-10 mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar select-none animate-slideDown">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Configure Schedule
        </h3>
        <p className="text-xs text-gray-500 font-semibold text-center mb-6">
          Doctor: {doctor?.user?.name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Working Days Checkbox grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FiCalendar className="w-4 h-4 text-primary-teal" /> Working Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = workingDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-center select-none cursor-pointer ${
                      isSelected
                        ? "bg-primary-teal border-primary-teal text-white shadow-sm"
                        : "bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot duration and generic options */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Slot Duration (Minutes)
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:bg-white focus:border-action-gold outline-none cursor-pointer"
            >
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* Working Sessions Management */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <FiClock className="w-4 h-4 text-primary-teal" /> Daily Working
                Sessions
              </label>
              <button
                type="button"
                onClick={handleAddSession}
                className="text-xs font-bold text-action-gold hover:text-yellow-600 flex items-center gap-0.5 cursor-pointer"
              >
                <FiPlus className="w-3.5 h-3.5" /> Add Session
              </button>
            </div>

            <div className="space-y-2">
              {sessions.map((session, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="grid grid-cols-2 gap-3 flex-grow">
                    <input
                      type="time"
                      value={session.startTime}
                      onChange={(e) =>
                        handleSessionChange(idx, "startTime", e.target.value)
                      }
                      required
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
                    />
                    <input
                      type="time"
                      value={session.endTime}
                      onChange={(e) =>
                        handleSessionChange(idx, "endTime", e.target.value)
                      }
                      required
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
                    />
                  </div>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSession(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Breaks Configuration */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <FiClock className="w-4 h-4 text-red-400" /> Daily Break Timings
              </label>
              <button
                type="button"
                onClick={handleAddBreak}
                className="text-xs font-bold text-action-gold hover:text-yellow-600 flex items-center gap-0.5 cursor-pointer"
              >
                <FiPlus className="w-3.5 h-3.5" /> Add Break
              </button>
            </div>

            <div className="space-y-2">
              {breaks.map((brk, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="grid grid-cols-2 gap-3 flex-grow">
                    <input
                      type="time"
                      value={brk.startTime}
                      onChange={(e) =>
                        handleBreakChange(idx, "startTime", e.target.value)
                      }
                      required
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
                    />
                    <input
                      type="time"
                      value={brk.endTime}
                      onChange={(e) =>
                        handleBreakChange(idx, "endTime", e.target.value)
                      }
                      required
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBreak(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {breaks.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  No daily breaks configured.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-action-gold hover:bg-yellow-600 text-white font-bold px-8 py-2.5 rounded-full transition text-sm shadow disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {loading ? "Saving..." : "Save Schedule"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-2.5 rounded-full transition text-sm cursor-pointer uppercase tracking-wider"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorScheduleModal;
