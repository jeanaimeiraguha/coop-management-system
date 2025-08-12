import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function decodeToken() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const jwtDecode = (await import("jwt-decode")).default;
          const data = jwtDecode(token);
          setUser({ id: data.id, email: data.email, name: data.name });
        } catch (e) {
          console.error("Invalid token", e);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    }
    decodeToken();
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
