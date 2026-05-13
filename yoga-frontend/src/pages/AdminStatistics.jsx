import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Activity,
  TrendingUp,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";

function AdminStatistics() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_messages: 0,
    pending_messages: 0,
    replied_messages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get("http://127.0.0.1:8000/admin/statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.data);
    } catch (err) {
      console.error("Failed to load statistics:", err);
      setError("Failed to load statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const repliedRate = useMemo(() => {
    if (!stats.total_messages) return 0;
    return Math.round((stats.replied_messages / stats.total_messages) * 100);
  }, [stats.total_messages, stats.replied_messages]);

  const pendingRate = useMemo(() => {
    if (!stats.total_messages) return 0;
    return Math.round((stats.pending_messages / stats.total_messages) * 100);
  }, [stats.total_messages, stats.pending_messages]);

  const cards = [
    {
      title: "Total Users",
      value: stats.total_users,
      subtitle: "Registered users",
      icon: Users,
      bg: "bg-orange-100",
      text: "text-[#F47C3C]",
    },
    {
      title: "Total Messages",
      value: stats.total_messages,
      subtitle: "All contact messages",
      icon: MessageSquare,
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    {
      title: "Pending Messages",
      value: stats.pending_messages,
      subtitle: "Waiting for reply",
      icon: Clock,
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },
    {
      title: "Replied Messages",
      value: stats.replied_messages,
      subtitle: "Already replied",
      icon: CheckCircle,
      bg: "bg-green-100",
      text: "text-green-600",
    },
  ];

  const barData = [
    { name: "Users", value: stats.total_users },
    { name: "Messages", value: stats.total_messages },
    { name: "Pending", value: stats.pending_messages },
    { name: "Replied", value: stats.replied_messages },
  ];

  const pieData = [
    { name: "Pending", value: stats.pending_messages },
    { name: "Replied", value: stats.replied_messages },
  ];

  const radialData = [
    {
      name: "Reply Rate",
      value: repliedRate,
      fill: "#F47C3C",
    },
  ];

  const COLORS = ["#F59E0B", "#22C55E"];

  return (
    <AdminLayout>
      <div>
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#F47C3C]">
              Admin Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-extrabold text-[#2E2E2E]">
              User Statistics
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              Monitor real-time users, contact messages, pending requests, and reply performance.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-3xl border border-orange-100 bg-white px-6 py-4 shadow-sm">
            <div className="rounded-xl bg-orange-100 p-3 text-[#F47C3C]">
              <Activity size={24} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Reply Rate</p>
              <p className="text-2xl font-extrabold text-[#2E2E2E]">
                {repliedRate}%
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading statistics...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`rounded-2xl ${card.bg} p-3 ${card.text}`}>
                        <Icon size={24} />
                      </div>

                      <TrendingUp
                        size={18}
                        className="text-gray-300 transition group-hover:text-[#F47C3C]"
                      />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-gray-500">
                      {card.title}
                    </p>

                    <h2 className="mt-2 text-4xl font-extrabold text-[#2E2E2E]">
                      {card.value}
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                      {card.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-3">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#2E2E2E]">
                      System Overview
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      A quick comparison of users and message activity.
                    </p>
                  </div>

                  <div className="rounded-full bg-[#FFF3EC] px-4 py-2 text-sm font-bold text-[#F47C3C]">
                    Live Data
                  </div>
                </div>

                <div className="mt-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barSize={48}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#FFF3EC" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid #F3E8E2",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#F47C3C"
                        radius={[14, 14, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-[#2E2E2E]">
                  Reply Performance
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Percentage of messages already replied.
                </p>

                <div className="mt-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      barSize={18}
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar background dataKey="value" cornerRadius={30} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>

                <div className="-mt-36 flex flex-col items-center">
                  <p className="text-5xl font-extrabold text-[#F47C3C]">
                    {repliedRate}%
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-500">
                    Replied
                  </p>
                </div>

                <div className="mt-20 space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-semibold text-gray-600">
                        Replied
                      </span>
                      <span className="font-bold text-green-600">
                        {repliedRate}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100">
                      <div
                        className="h-3 rounded-full bg-green-500"
                        style={{ width: `${repliedRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-semibold text-gray-600">
                        Pending
                      </span>
                      <span className="font-bold text-yellow-600">
                        {pendingRate}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100">
                      <div
                        className="h-3 rounded-full bg-yellow-500"
                        style={{ width: `${pendingRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-[#2E2E2E]">
                  Message Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Pending and replied contact messages.
                </p>

                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={115}
                        paddingAngle={4}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#7A3300] to-[#CC5500] p-6 text-white shadow-sm">
                <h2 className="text-xl font-extrabold">
                  Dashboard Summary
                </h2>

                <p className="mt-2 text-sm text-orange-100">
                  Current admin system overview based on database values.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                    <p className="text-sm text-orange-100">Users</p>
                    <p className="mt-2 text-3xl font-extrabold">
                      {stats.total_users}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                    <p className="text-sm text-orange-100">Messages</p>
                    <p className="mt-2 text-3xl font-extrabold">
                      {stats.total_messages}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                    <p className="text-sm text-orange-100">Pending</p>
                    <p className="mt-2 text-3xl font-extrabold">
                      {stats.pending_messages}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                    <p className="text-sm text-orange-100">Replied</p>
                    <p className="mt-2 text-3xl font-extrabold">
                      {stats.replied_messages}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminStatistics;