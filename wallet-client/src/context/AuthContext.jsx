// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wallet/info");
      const walletData = res.data;
      
      // Determine if user is admin by calling admin endpoint
      let role = "user";
      try {
        await api.get("/admin/pending-users");
        role = "admin";
      } catch (err) {
        // If 403 or any error, user is not admin - this is expected for regular users
        role = "user";
      }
      
      const userData = { ...walletData, role };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      // Only set user to null if wallet/info fails (user not logged in)
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const userData = await fetchProfile();
    return userData;
  };

  const register = async (payload) => {
  // payload is now FormData, not a plain object
  const res = await api.post("/auth/register", payload, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, fetchProfile, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}