// src/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // IMPORTANT: allow cookies from the backend
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
