import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!accepted) {
      setError("You must accept Terms & Conditions!");
      return;
    }

    try {
      await register(email, password, name);
      navigate('/login');
    } catch (err) {
      console.error("Registration error:", err);
      setError('Registration failed');
    }

    
  };

  return (
    <div className="min-h-screen  bg-[#F9F9F9] flex items-start justify-center pt-14 px-4">
      <div className="w-full max-w-sm p-6 mt-12 bg-white shadow-xl rounded-3xl">

        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-[#2E2E2E]">
            Begin Your Journey
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Start your yoga journey today.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-[#D62828] text-xs p-2 rounded-lg mb-3 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-2 mb-3 text-xs text-center text-green-700 bg-green-100 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">

          {/* Full Name */}
          <div>
            <label className="text-xs text-gray-600">Full Name</label>
            <input
              type="text"
              placeholder="Your Full Name"
              className="w-full mt-1 p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47C3C]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Your Email"
              className="w-full mt-1 p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47C3C]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-xs text-gray-600">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              className="w-full mt-1 p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47C3C]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute text-gray-500 cursor-pointer right-3 top-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="text-xs text-gray-600">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              className="w-full mt-1 p-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47C3C]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="absolute text-gray-500 cursor-pointer right-3 top-8"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </span>
          </div>

          {/* Accept Terms */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
              className="accent-[#F47C3C]"
            />
            <span>
              I accept the{" "}
              <span className="text-[#F47C3C] font-medium">
                Terms & Conditions
              </span>
            </span>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-2.5 text-sm rounded-full font-semibold transition duration-300 shadow-md bg-gradient-to-r from-[#F47C3C] to-[#E3642B] text-white hover:opacity-90"
          >
            Sign Up
          </button>

        </form>

        <p className="mt-4 text-xs text-center text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#F47C3C] font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;