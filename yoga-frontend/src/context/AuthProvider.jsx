import { useEffect, useMemo, useState } from "react";
import { authService, userService } from "../services/api";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapUser = async () => {
      const token = localStorage.getItem("token");
      const cachedUser = localStorage.getItem("auth_user");

      if (!token) {
        setLoading(false);
        return;
      }

      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser({ token, ...parsedUser });
        } catch {
          localStorage.removeItem("auth_user");
        }
      }

      try {
        const profile = await userService.me();
        setUser({ token, ...profile });
        localStorage.setItem("auth_user", JSON.stringify(profile));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("auth_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapUser();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);

      const profile = await userService.me();
      localStorage.setItem("auth_user", JSON.stringify(profile));

      const authenticatedUser = {
        token: data.access_token,
        ...profile,
      };

      setUser(authenticatedUser);
      return authenticatedUser;
    }

    return null;
  };

  // ✅ Google login walata refresh nathuwa user state update karanna
  const loginWithToken = async (token) => {
    if (!token) return null;

    localStorage.setItem("token", token);

    const profile = await userService.me();
    localStorage.setItem("auth_user", JSON.stringify(profile));

    const authenticatedUser = {
      token,
      ...profile,
    };

    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const register = async (email, password, fullName) => {
    const data = await authService.register(email, password, fullName);
    return data;
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      loginWithToken,
      register,
      logout,
      loading,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;