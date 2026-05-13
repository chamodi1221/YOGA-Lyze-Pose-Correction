import { useEffect, useState } from "react";
import axios from "axios";

const UserStatistics = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_messages: 0,
    pending_messages: 0,
    replied_messages: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/admin/statistics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);
    } catch (error) {
      console.error("Failed to load statistics", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F2] p-8">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#C96B2C] font-semibold uppercase tracking-wide">
          ADMIN DASHBOARD
        </p>

        <h1 className="text-4xl font-bold text-gray-800 mt-2">
          User Statistics
        </h1>

        <p className="text-gray-500 mt-2">
          Real-time platform statistics from database.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-gray-500 text-lg">Total Users</h2>

            <p className="text-5xl font-bold text-[#C96B2C] mt-4">
              {stats.total_users}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-gray-500 text-lg">Total Messages</h2>

            <p className="text-5xl font-bold text-[#C96B2C] mt-4">
              {stats.total_messages}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-gray-500 text-lg">Pending Messages</h2>

            <p className="text-5xl font-bold text-red-500 mt-4">
              {stats.pending_messages}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-gray-500 text-lg">Replied Messages</h2>

            <p className="text-5xl font-bold text-green-500 mt-4">
              {stats.replied_messages}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;