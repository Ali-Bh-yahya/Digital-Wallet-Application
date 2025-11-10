// src/components/LandingPage.jsx
import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <div className="landing">
        <nav className="landing-nav">
          <h2 className="logo">Wallet App</h2>
          <div className="nav-buttons">
            <button className="nav-btn" onClick={() => setShowLogin(true)}>
              Login
            </button>
            <button className="nav-btn nav-btn-primary" onClick={() => setShowRegister(true)}>
              Register
            </button>
          </div>
        </nav>

        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Manage Your Money With Confidence</h1>
            <p className="hero-description">
              Experience seamless digital banking with secure transactions, instant transfers, 
              and complete control over your finances.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => setShowRegister(true)}>
                Get Started
              </button>
              <button className="btn-secondary" onClick={() => setShowLogin(true)}>
                Sign In
              </button>
            </div>
          </div>
          
          <div className="hero-features">
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Virtual Cards</h3>
              <p>Get instant virtual cards for secure online payments</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Transactions</h3>
              <p>Bank-level encryption protects all your transfers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Transfer</h3>
              <p>Send and receive money in seconds</p>
            </div>
          </div>
        </div>
      </div>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </>
  );
}