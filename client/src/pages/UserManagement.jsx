import React, { useEffect, useState } from "react";
import { userAPI } from "../utils/api";
import { FiUserPlus, FiUsers, FiClock } from "react-icons/fi";
import { toast } from "react-toastify";

// Modal imports
import CreateDoctorModal from "../components/CreateDoctorModal";
import CreateReceptionistModal from "../components/CreateReceptionistModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");

  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isReceptOpen, setIsReceptOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers(
        roleFilter ? { role: roleFilter } : {},
      );
      setUsers(response.data);
    } catch (err) {
      toast.error("Failed to load user accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const getRoleColor = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-red-100 text-red-800 border-red-200";
      case "doctor":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "receptionist":
        return "bg-yellow-100 text-yellow-800 border-yellow-250";
      default:
        return "bg-gray-100 text-gray-800 border-gray-250";
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title / Action bar */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-teal tracking-tight">
            User Account Management
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Manage administrative, clinical (doctor), and desk roles
            (receptionist)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsDocOpen(true)}
            className="bg-action-gold hover:bg-yellow-600 text-white font-bold px-6 py-2.5 rounded-full transition-all text-xs tracking-wider uppercase cursor-pointer flex items-center gap-1 shadow"
          >
            <FiUserPlus className="w-4 h-4" /> Add Doctor
          </button>
          <button
            onClick={() => setIsReceptOpen(true)}
            className="bg-primary-teal hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-full transition-all text-xs tracking-wider uppercase cursor-pointer flex items-center gap-1 shadow"
          >
            <FiUserPlus className="w-4 h-4" /> Add Receptionist
          </button>
        </div>
      </div>

      {/* Filters card */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <FiUsers className="w-4.5 h-4.5 text-primary-teal" /> Filter by Role:
        </span>
        <div className="flex gap-2">
          {["", "doctor", "receptionist"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`py-1 px-4 border rounded-full text-xs font-bold transition-all cursor-pointer ${
                roleFilter === role
                  ? "bg-primary-teal border-primary-teal text-white shadow"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {role === "" ? "All Roles" : role.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Users grid */}
      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-4 border-action-gold border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-semibold">Loading user accounts...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white py-16 text-center text-gray-400 rounded-3xl border border-gray-200 shadow-sm">
          <FiUsers className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No user accounts matched this role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((item) => (
            <div
              key={item._id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-base">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium">
                      {item.email}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getRoleColor(
                      item.role,
                    )}`}
                  >
                    {item.role}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                  <FiClock className="w-3.5 h-3.5" /> Registered:{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Modals */}
      {isDocOpen && (
        <CreateDoctorModal
          isOpen={isDocOpen}
          onClose={() => {
            setIsDocOpen(false);
            fetchUsers();
          }}
        />
      )}
      {isReceptOpen && (
        <CreateReceptionistModal
          isOpen={isReceptOpen}
          onClose={() => {
            setIsReceptOpen(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
