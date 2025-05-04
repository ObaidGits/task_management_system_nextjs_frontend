// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "../services";
import { getToken, setToken, removeToken } from "../utils/auth";
import { useSocket } from "../hooks/useSocket";

type User = { _id: string; fullName: string; email: string; role: string };

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthCtx>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const socket = useSocket();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: try to fetch profile
  useEffect(() => {
    authService.getProfile()
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Re-register on socket once logged in
  useEffect(() => {
    if (user && socket?.connected) {
      console.log("🔁 register-socket", user._id, socket.id);
      socket.emit("register", user._id);
    }
  }, [user, socket]);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setToken(res.data.accessToken);
    const prof = await authService.getProfile();
    setUser(prof.data.user);
  };

  const logout = async () => {
    await authService.logout();
    removeToken();
    setUser(null);
    router.push("/login"); // ✅ Redirect to login page after logout
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
