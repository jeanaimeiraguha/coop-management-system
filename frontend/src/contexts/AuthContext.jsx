import React, { createContext, useState, useEffect } from "react";
// Correct import for jwt-decode for Vite + React
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode token properly
        const decoded = jwtDecode(token);
        // Assume token contains user info like id and email
        setUser({ id: decoded.id, email: decoded.email });
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  async function login(email, password) {
    // Call your API login here and get token + user info
    // Example with axios instance 'api':
    // const res = await api.post('/members/login', { email, password });
    // localStorage.setItem('token', res.data.token);
    // setUser(res.data.member);
    // return res.data.member;

    throw new Error("Implement login logic here");
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
