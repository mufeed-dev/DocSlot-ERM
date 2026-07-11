import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiCalendar,
  FiUser,
  FiClock,
  FiShield,
} from "react-icons/fi";
import { toast } from "react-toastify";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const isActive = (path) => location.pathname === path;

  const getRoleBadge = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-red-500/20 text-red-300 border border-red-500/30";
      case "doctor":
        return "bg-accent-teal/20 text-accent-teal border border-accent-teal/30";
      case "receptionist":
        return "bg-action-gold/20 text-action-gold border border-action-gold/30";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <nav className="bg-primary-teal text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold tracking-wider text-white"
            >
              <span className="p-1.5 bg-action-gold text-primary-teal rounded-lg">
                <FiCalendar className="w-5 h-5" />
              </span>
              <span>
                Doc<span className="text-action-gold">Slot</span>
              </span>
            </Link>
          </div>

          {/* Navigation Desktop Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/")
                    ? "bg-white/10 text-action-gold"
                    : "text-gray-200 hover:bg-white/5 hover:text-white"
                }`}
              >
                Dashboard
              </Link>

              {/* Super Admin & Receptionist only */}
              {(user?.role === "superadmin" ||
                user?.role === "receptionist") && (
                <Link
                  to="/scheduler"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive("/scheduler")
                      ? "bg-white/10 text-action-gold"
                      : "text-gray-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Appointment Scheduler
                </Link>
              )}

              {/* Super Admin only */}
              {user?.role === "superadmin" && (
                <>
                  <Link
                    to="/users"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive("/users")
                        ? "bg-white/10 text-action-gold"
                        : "text-gray-200 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    User Management
                  </Link>
                  <Link
                    to="/audit"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive("/audit")
                        ? "bg-white/10 text-action-gold"
                        : "text-gray-200 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    Audit Trail
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User profile & controls */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center gap-3 bg-white/5 pl-3 pr-4 py-1.5 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-full bg-action-gold/20 flex items-center justify-center text-action-gold">
                  <FiUser className="w-4 h-4" />
                </div>
                <div className="text-left leading-none">
                  <p className="text-sm font-bold truncate max-w-[120px]">
                    {user?.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 mt-1 ${getRoleBadge(user?.role)}`}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all cursor-pointer"
                title="Sign Out"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link
                to="/login"
                className="bg-action-gold hover:bg-yellow-600 text-primary-teal font-bold px-6 py-2 rounded-full transition-all text-sm shadow-md"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-200 hover:bg-white/5 hover:text-white focus:outline-none transition-colors"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary-teal/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                {/* Profile Display */}
                <div className="flex items-center gap-3 px-3 py-3 border-b border-white/10 mb-2">
                  <div className="w-10 h-10 rounded-full bg-action-gold/20 flex items-center justify-center text-action-gold">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{user?.name}</p>
                    <span
                      className={`inline-block text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 mt-0.5 ${getRoleBadge(user?.role)}`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
                    isActive("/")
                      ? "bg-white/10 text-action-gold"
                      : "text-gray-200 hover:bg-white/5"
                  }`}
                >
                  Dashboard
                </Link>

                {(user?.role === "superadmin" ||
                  user?.role === "receptionist") && (
                  <Link
                    to="/scheduler"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
                      isActive("/scheduler")
                        ? "bg-white/10 text-action-gold"
                        : "text-gray-200 hover:bg-white/5"
                    }`}
                  >
                    Appointment Scheduler
                  </Link>
                )}

                {user?.role === "superadmin" && (
                  <>
                    <Link
                      to="/users"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
                        isActive("/users")
                          ? "bg-white/10 text-action-gold"
                          : "text-gray-200 hover:bg-white/5"
                      }`}
                    >
                      User Management
                    </Link>
                    <Link
                      to="/audit"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2.5 rounded-xl text-base font-semibold ${
                        isActive("/audit")
                          ? "bg-white/10 text-action-gold"
                          : "text-gray-200 hover:bg-white/5"
                      }`}
                    >
                      Audit Trail
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-base font-semibold text-red-400 hover:bg-red-500/10 transition-colors mt-4"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-action-gold text-primary-teal font-bold px-4 py-2.5 rounded-full transition-all text-base mx-3 my-2"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
