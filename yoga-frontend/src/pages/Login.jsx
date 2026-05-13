import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login, loginWithToken } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("All fields are required!");
      return;
    }

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser?.role === "admin") {
        navigate("/admin/messages");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");
      setSuccess("");

      const googleToken = credentialResponse.credential;

      if (!googleToken) {
        setError("Google login failed. Please try again.");
        return;
      }

      const googleUser = jwtDecode(googleToken);
      console.log("Google user:", googleUser);

      const response = await fetch("http://localhost:8000/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: googleToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.detail || "Google login failed.");
        return;
      }

      const loggedInUser = await loginWithToken(data.access_token);

      setSuccess("Google login successful.");

      if (loggedInUser?.role === "admin") {
        navigate("/admin/messages");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-sm p-6 mt-12 bg-white shadow-xl rounded-3xl">

        <div className="mb-5 text-center">
          <h1 className="text-2xl font-bold text-[#2E2E2E]">
            Welcome back
          </h1>

          <p className="mt-1 text-xs text-gray-500">
            Find your balance. Strengthen your mind & body.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-[#D62828] text-xs p-2 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-2 mb-4 text-xs text-center text-green-700 bg-green-100 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-gray-600">
              User Name
            </label>

            <input
              type="text"
              placeholder="Your User Name"
              className="w-full mt-1 p-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47C3C]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="text-xs text-gray-600">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="w-full mt-1 p-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47C3C]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="absolute text-gray-500 cursor-pointer right-3 top-9"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="accent-[#F47C3C]" />
              Remember me
            </label>

            <a
              href="#"
              className="text-[#F47C3C] hover:underline font-medium"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#F47C3C] to-[#E3642B] text-white py-2.5 text-sm rounded-full font-semibold transition duration-300 hover:opacity-90 shadow-md"
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Google login failed.");
            }}
          />
        </div>

        <p className="mt-5 text-xs text-center text-gray-500">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-[#F47C3C] font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;