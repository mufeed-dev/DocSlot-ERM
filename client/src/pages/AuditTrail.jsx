import React, { useEffect, useState } from "react";
import { auditAPI } from "../utils/api";
import { FiShield, FiClock, FiSearch } from "react-icons/fi";
import Pagination from "../components/Pagination";
import { formatAuditAction } from "../utils/formatters";

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditAPI.getLogs({ page, limit: 20 });
      setLogs(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-teal tracking-tight flex items-center gap-2">
          <FiShield className="w-8 h-8 text-primary-teal" /> Security Audit
          Trail
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Comprehensive compliance log of clinic actions, user sessions,
          bookings, and database status events
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-action-gold border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-semibold">
              Loading security audit records...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FiShield className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h4 className="font-bold text-gray-700">No Audit Records Found</h4>
            <p className="text-xs mt-1">
              Actions performed on the server will be logged here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition">
                    {/* Timestamp */}
                    <td className="p-4 whitespace-nowrap text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5 text-action-gold" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-primary-teal/10 text-primary-teal py-1 px-3 rounded-full text-xs font-bold border border-primary-teal/10">
                        {formatAuditAction(log.action)}
                      </span>
                    </td>

                    {/* User */}
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900">
                        {log.user?.name || "System"}
                      </p>
                      {log.user?.email && (
                        <p className="text-xs text-gray-400">
                          {log.user.email}
                        </p>
                      )}
                    </td>

                    {/* Role */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                        {log.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 border-t border-gray-100 bg-gray-50/50">
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
