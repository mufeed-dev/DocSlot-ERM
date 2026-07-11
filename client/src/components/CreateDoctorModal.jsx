import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createDoctor } from "../store";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
} from "../utils/validation";

const CreateDoctorModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    specialization: "",
    qualification: "",
    phone: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(formData.name)) {
      toast.warning("Name must be at least 2 characters.");
      return;
    }
    if (!validateEmail(formData.email)) {
      toast.warning("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(formData.password)) {
      toast.warning(
        "Password must be at least 8 characters and contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
      );
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast.warning("Phone number must be between 10 and 15 digits.");
      return;
    }

    setLoading(true);

    try {
      await dispatch(createDoctor(formData)).unwrap();
      toast.success("Doctor account created successfully!");
      onClose();
    } catch (err) {
      toast.error(err || "Failed to create doctor account");
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

        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Register New Doctor
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Dr. John Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="doctor@clinic.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Portal Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min 8 chars"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Phone number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
              />
            </div>
          </div>

          <hr className="border-gray-100 my-2" />

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="e.g. Cardiology, Pediatrics"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                placeholder="e.g. Heart Surgery"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Qualifications
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                placeholder="e.g. MD, MBBS"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-action-gold bg-gray-50/50 focus:bg-white text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-action-gold hover:bg-yellow-600 text-white font-bold px-8 py-2.5 rounded-full transition text-sm shadow disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {loading ? "Creating..." : "Create Account"}
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

export default CreateDoctorModal;
