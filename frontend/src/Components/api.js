// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Change to your backend URL
  withCredentials: true, // if your backend uses cookies
});

export default api;
