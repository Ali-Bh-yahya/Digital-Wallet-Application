// src/components/PendingApproval.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/PendingApproval.css";

export default function PendingApproval() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="pending-container">
      <div className="pending-card">
        <div className="pending-icon">
          <div className="clock-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h1 className="pending-title">Account Under Review</h1>
        
        <p className="pending-message">
          Thank you for registering! Your account is currently being reviewed by our admin team.
        </p>

        <div className="pending-info">
          <div className="info-item">
            <div className="info-icon">✉️</div>
            <p>You'll receive an email notification once your account is approved</p>
          </div>
          <div className="info-item">
            <div className="info-icon">⏱️</div>
            <p>Review typically takes 24-48 hours</p>
          </div>
          <div className="info-item">
            <div className="info-icon">🔔</div>
            <p>Check your email regularly for updates</p>
          </div>
        </div>

        <div className="pending-status">
          <div className="status-badge">
            <span className="status-dot"></span>
            Pending Approval
          </div>
        </div>

        <button className="btn-back" onClick={handleLogout}>
          Back to Home
        </button>

        <p className="pending-footer">
          Need help? Contact support at <a href="mailto:support@walletapp.com">support@walletapp.com</a>
        </p>
      </div>
    </div>
  );
}