import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const isActive = (path) =>
    location.pathname === path
      ? "text-[#F47C3C] border-b-2 border-[#F47C3C]"
      : "text-gray-600 hover:text-[#F47C3C]";

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate("/");
    }, 100);
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">

        {/* LEFT SIDE - Logo + Name */}
       <Link
         to="/"
         className="flex items-center gap-3 text-xl tracking-wide"
       >
        <span className="text-[#2E2E2E]">
    
        <span className="text-3xl font-extrabold">YOGA</span>{" "}
    
        <span className="text-[#F47C3C] font-bold">Lyze</span>

        </span>
      </Link>

        {/* CENTER - Pages */}
        <div className="flex items-center gap-8 text-sm font-medium">

          {/* PUBLIC NAVBAR (Not Logged In) */}
          {!user && (
            <>
              <Link to="/" className={isActive("/")}>
                Home
              </Link>

              <Link
                to="/library"
                className={`transition pb-1 ${isActive("/library")}`}
              >
                Pose Library
              </Link>

              <Link
                to="/about"
                className={`transition pb-1 ${isActive("/about")}`}
              >
                About
              </Link>
            </>
          )}

          {/* PRIVATE NAVBAR (Logged In) */}
          {user && user.role !== "admin" && (
            <>
              <Link
                to="/dashboard"
                className={`transition pb-1 ${isActive("/dashboard")}`}
              >
                Dashboard
              </Link>

              <Link
                to="/live"
                className={`transition pb-1 ${isActive("/live")}`}
              >
                Live Detection
              </Link>

              <Link
                to="/upload"
                className={`transition pb-1 ${isActive("/upload")}`}
              >
                Upload Image
              </Link>

              <Link
                to="/support"
                className={`transition pb-1 ${isActive("/support")}`}
              >
                Support
              </Link>

              <Link
                to="/contact"
                className={`transition pb-1 ${isActive("/contact")}`}
              >
                Contact
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                to="/admin/messages"
                className={`transition pb-1 ${isActive("/admin/messages")}`}
              >
                Admin
              </Link>
            </>
          )}

        </div>

        {/* RIGHT SIDE - Auth Buttons */}
        <div className="flex items-center gap-4 text-sm">

          {!user && (
            <Link
              to="/login"
              className={`font-medium transition ${isActive("/login")}`}
            >
              Login
            </Link>
          )}

          {!user && (
            <Link
              to="/register"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#F47C3C] to-[#E3642B] text-white font-medium shadow-md hover:opacity-90 transition duration-300"
            >
              Sign Up
            </Link>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#F47C3C] to-[#E3642B] text-white font-medium shadow-md hover:opacity-90 transition duration-300"
            >
              Logout
            </button>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;