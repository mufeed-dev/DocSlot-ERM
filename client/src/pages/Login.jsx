import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store";
import { FiMail, FiLock, FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";

import { validateEmail } from "../utils/validation";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "admin@docslot.com",
    password: "Admin@123",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.warning("Please fill in all fields.");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="w-screen min-h-screen md:h-screen flex flex-col md:flex-row bg-white overflow-hidden select-none">
      {/* Left panel Form */}
      <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-16 flex flex-col justify-center bg-white min-h-[60vh] md:h-full order-1 md:order-1 relative">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Logo */}
          <div className="flex justify-center md:justify-start items-center gap-2 text-2xl font-bold tracking-wider text-primary-teal mb-4">
            <span className="p-1.5 bg-action-gold text-primary-teal rounded-lg">
              <FiCalendar className="w-5 h-5" />
            </span>
            <span>
              Doc<span className="text-action-gold">Slot</span>
            </span>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Enter your credentials to access the EMR clinic portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FiMail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-action-gold transition text-sm sm:text-base text-gray-700 shadow-sm"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FiLock className="w-5 h-5" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-action-gold transition text-sm sm:text-base text-gray-700 shadow-sm"
              />
            </div>

            <div className="text-center md:text-left">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-action-gold hover:bg-yellow-600 text-white font-bold px-12 py-3 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm tracking-wider cursor-pointer uppercase"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right panel Navigation Message */}
      <div className="hidden md:flex w-full md:w-1/2 bg-primary-teal text-white p-8 md:p-16 flex-col justify-center items-center text-center relative overflow-hidden h-full order-2">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-10 w-8 h-8 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-12 right-12 w-24 h-24 bg-white/5 rotate-45 pointer-events-none border border-white/10" />
        <div className="absolute top-12 left-1/3 w-16 h-16 bg-white/5 rotate-12 pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-sm">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-wide">
            EMR Clinic Portal
          </h1>
          <p className="text-sm font-medium text-teal-50 max-w-[300px] leading-relaxed">
            Welcome to the enterprise Electronic Medical Record clinic portal.
            Secure role-based scheduler portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
