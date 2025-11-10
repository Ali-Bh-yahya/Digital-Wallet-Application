// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthModal.css";

export default function Login({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const userData = await auth.login(email, password);
      
      // Check user status
      if (userData?.status === "pending") {
        navigate("/pending");
        onClose?.();
        return;
      }

      if (userData?.status === "rejected") {
        setErr("Your account has been rejected. Please contact support.");
        return;
      }

      if (userData?.status === "suspended") {
        setErr("Your account has been suspended. Please contact support.");
        return;
      }

      const role = userData?.role || "user";
      
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      onClose?.();
    } catch (error) {
      setErr(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          {err && <div className="error-message">{err}</div>}
          <button className="btn" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}