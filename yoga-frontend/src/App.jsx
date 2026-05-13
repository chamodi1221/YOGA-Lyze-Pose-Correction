import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LiveDetection from "./pages/LiveDetection";
import UploadImage from "./pages/UploadImage";
import PoseLibrary from "./pages/PoseLibrary";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Support from "./pages/Support";

import AdminMessages from "./pages/AdminMessages";
import AdminStatistics from "./pages/AdminStatistics";
import AdminSettings from "./pages/AdminSettings";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  const location = useLocation();
  const { user, loading } = useAuth();

  const defaultPath =
    user?.role === "admin" ? "/admin/messages" : "/dashboard";

  const isAdminPage = location.pathname.startsWith("/admin");

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
      {!isAdminPage && <Navbar />}

      <div className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to={defaultPath} /> : <Home />}
          />

          <Route
            path="/login"
            element={user ? <Navigate to={defaultPath} /> : <Login />}
          />

          <Route
            path="/register"
            element={user ? <Navigate to={defaultPath} /> : <Register />}
          />

          <Route path="/library" element={<PoseLibrary />} />
          <Route path="/about" element={<About />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live" element={<LiveDetection />} />
            <Route path="/upload" element={<UploadImage />} />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route element={<PrivateRoute adminOnly />}>
            <Route path="/admin/messages" element={<AdminMessages />} />

            <Route
              path="/admin/statistics"
              element={<AdminStatistics />}
            />

            <Route
              path="/admin/settings"
              element={<AdminSettings />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;