import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchPatients, createPatient, selectPatient } from "../store";
import {
  FiSearch,
  FiUserPlus,
  FiUserCheck,
  FiCheck,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  validateName,
  validatePhone,
  validateEmail,
  validatePastDate,
} from "../utils/validation";

const PatientSearchForm = () => {
  const dispatch = useDispatch();
  const { searchResults, selectedPatient, loading } = useSelector(
    (state) => state.patient,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // New Patient registration form state
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
  });

  // Debounced search trigger
  useEffect(() => {
    if (!searchQuery.trim()) {
      dispatch({ type: "patient/clearSearch" });
      return;
    }

    const timer = setTimeout(() => {
      dispatch(searchPatients(searchQuery.trim()));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const handleSelectPatient = (patient) => {
    dispatch(selectPatient(patient));
    setSearchQuery("");
    toast.success(`Selected Patient: ${patient.name}`);
  };

  const handleRegisterChange = (e) => {
    setNewPatientData({
      ...newPatientData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(newPatientData.name)) {
      toast.warning("Patient name must be at least 2 characters.");
      return;
    }
    if (!validatePhone(newPatientData.phone)) {
      toast.warning("Mobile number must be between 10 and 15 digits.");
      return;
    }
    if (newPatientData.email && !validateEmail(newPatientData.email)) {
      toast.warning("Please enter a valid email address.");
      return;
    }
    if (!validatePastDate(newPatientData.dateOfBirth)) {
      toast.warning("Date of birth must be a past date.");
      return;
    }

    try {
      const patient = await dispatch(createPatient(newPatientData)).unwrap();
      toast.success(`Patient registered successfully: ${patient.patientId}`);
      setIsRegistering(false);
      setNewPatientData({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "male",
        address: "",
      });
    } catch (err) {
      toast.error(err || "Failed to register patient");
    }
  };

  return (
    <div className="space-y-4">
      {/* Selection Status indicator */}
      {selectedPatient ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <FiUserCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs text-green-600 font-bold uppercase tracking-wider">
                Selected Patient
              </span>
              <p className="font-bold text-gray-900 leading-tight">
                {selectedPatient.name}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                ID: {selectedPatient.patientId} | Ph: {selectedPatient.phone}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(selectPatient(null))}
            className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
          >
            Deselect
          </button>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-150 p-4 rounded-xl flex items-center gap-3 text-yellow-800 text-sm font-medium">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
            <FiUser className="w-4 h-4" />
          </div>
          <span>
            Please select an existing patient or register a new one to book
            appointments.
          </span>
        </div>
      )}

      {/* Mode selectors */}
      <div className="flex rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setIsRegistering(false)}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            !isRegistering
              ? "bg-white text-primary-teal shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Search Existing
        </button>
        <button
          onClick={() => setIsRegistering(true)}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isRegistering
              ? "bg-white text-primary-teal shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Register New Patient
        </button>
      </div>

      {/* Search Input and Results */}
      {!isRegistering ? (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FiSearch className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by ID, Mobile, or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
            />
          </div>

          {/* Results list */}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-action-gold border-t-transparent rounded-full mx-auto" />
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="border border-gray-100 rounded-xl max-h-48 overflow-y-auto custom-scrollbar bg-white divide-y divide-gray-50 shadow-inner">
              {searchResults.map((patient) => (
                <button
                  key={patient._id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full text-left p-3 hover:bg-primary-teal/5 flex justify-between items-center transition cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {patient.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      ID: {patient.patientId} | Ph: {patient.phone}
                    </p>
                  </div>
                  {selectedPatient?._id === patient._id && (
                    <FiCheck className="text-green-500 w-5 h-5" />
                  )}
                </button>
              ))}
            </div>
          )}

          {searchQuery && !loading && searchResults.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-4">
              No matching patient records found.
            </p>
          )}
        </div>
      ) : (
        /* Registration Form */
        <form
          onSubmit={handleRegisterSubmit}
          className="space-y-3.5 bg-white p-4 rounded-xl border border-gray-200"
        >
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={newPatientData.name}
              onChange={handleRegisterChange}
              required
              placeholder="Patient Full Name"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-action-gold text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                name="phone"
                value={newPatientData.phone}
                onChange={handleRegisterChange}
                required
                placeholder="Mobile number"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-action-gold text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={newPatientData.gender}
                onChange={handleRegisterChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:border-action-gold text-xs"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={newPatientData.dateOfBirth}
                onChange={handleRegisterChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-action-gold text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={newPatientData.email}
                onChange={handleRegisterChange}
                placeholder="email@address.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-action-gold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Residential Address
            </label>
            <input
              type="text"
              name="address"
              value={newPatientData.address}
              onChange={handleRegisterChange}
              placeholder="Apartment, Street Address, City"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-action-gold text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-teal hover:bg-teal-800 text-white font-bold py-2 rounded-xl transition text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow"
          >
            <FiUserPlus className="w-3.5 h-3.5" /> Register and Select
          </button>
        </form>
      )}
    </div>
  );
};

export default PatientSearchForm;
