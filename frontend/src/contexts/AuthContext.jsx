import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, email: decoded.email });
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  async function login(email, password) {
    const res = await api.post("/members/login", { email, password });
    const { token, member } = res.data;
    localStorage.setItem("token", token);
    setUser(member);
    return member;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
