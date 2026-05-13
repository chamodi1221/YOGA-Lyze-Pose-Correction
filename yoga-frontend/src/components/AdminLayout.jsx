import { NavLink, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      name: "Contact Messages",
      path: "/admin/messages",
      icon: MessageSquare,
    },
    {
      name: "User Statistics",
      path: "/admin/statistics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F4F1]">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-[#171411] border-r border-white/5 px-4 py-5 shadow-2xl">
        {/* LOGO */}
        <div className="mb-8 px-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#F47C3C]">
            Admin Panel
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-white">
            YOGA <span className="text-[#F47C3C]">Lyze</span>
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Management Console
          </p>
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-7">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#F47C3C] to-[#E3642B] text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon
                  size={19}
                  className="transition-transform duration-300 group-hover:scale-110"
                />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="absolute bottom-5 left-4 right-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F47C3C] to-[#E3642B] px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02] hover:opacity-90"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* TOP BAR */}
      <div className="fixed left-60 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-8">
          {/* LEFT TITLE */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F47C3C]">
              Admin Dashboard
            </p>

            <h1 className="text-lg font-bold text-[#2E2E2E]">
              Yoga Management Panel
            </h1>
          </div>

          {/* SEARCH BAR ONLY */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 bg-[#F6F4F1] px-4 py-2 shadow-sm">
            <Search size={16} className="text-gray-500" />

            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="ml-60 min-h-screen px-8 pb-8 pt-24">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;