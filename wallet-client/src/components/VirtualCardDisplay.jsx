// src/components/VirtualCardDisplay.jsx
import React, { useState } from 'react';
import api from '../api';
import "../styles/VirtualCard.css";

export default function VirtualCardDisplay({ cardData }) {
  const [copiedField, setCopiedField] = useState(null);
  const [showCVV, setShowCVV] = useState(false);
  const [cvvValue, setCvvValue] = useState('•••');
  const [loading, setLoading] = useState(false);

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCardNumber = (number) => {
    if (!number) return 'XXXX XXXX XXXX XXXX';
    const numStr = String(number);
    return numStr.match(/.{1,4}/g)?.join(' ') || numStr;
  };

  const formatExpiry = (expiry) => {
    if (!expiry) return 'MM/YY';
    try {
      if (typeof expiry === 'string' && expiry.includes('/')) {
        return expiry;
      }
      return expiry;
    } catch (e) {
      return 'MM/YY';
    }
  };

  const handleToggleCVV = async () => {
    if (showCVV) {
      setShowCVV(false);
      setCvvValue('•••');
      return;
    }

    const password = prompt('Enter your password to reveal CVV:');
    if (!password) return;

    setLoading(true);
    try {
      const res = await api.post('/wallet/reveal-cvv', { password });
      setCvvValue(res.data.cvv);
      setShowCVV(true);
      
      setTimeout(() => {
        setShowCVV(false);
        setCvvValue('•••');
      }, 30000);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reveal CVV');
    } finally {
      setLoading(false);
    }
  };

  if (!cardData) {
    return (
      <div className="no-card-container">
        <p>No card data available</p>
      </div>
    );
  }

  const cardNumber = cardData.cardNumber || '';
  const cardHolderName = (cardData.cardHolderName || 'CARD HOLDER').toUpperCase();
  const expiryDate = cardData.expirationDate || '';

  return (
    <div className="modern-card-wrapper">
      <div className="credit-card-scene">
        <div className="credit-card">
          <div className="card-bg">
            <div className="gradient-layer"></div>
            <div className="pattern-layer"></div>
          </div>

          <div className="card-main-content">
            <div className="card-header-row">
              <div className="card-chip-group">
                <div className="chip-main">
                  <div className="chip-inner"></div>
                  <div className="chip-glare"></div>
                </div>
              </div>
              <div className="card-brand">
                <div className="brand-badge">
                  <span className="badge-text">VISA</span>
                </div>
              </div>
            </div>

            <div className="card-number-display">
              <p className="number-text">{formatCardNumber(cardNumber)}</p>
            </div>

            <div className="card-footer-row">
              <div className="holder-info">
                <span className="info-label">Card Holder</span>
                <span className="info-value">{cardHolderName}</span>
              </div>
              <div className="expiry-info">
                <span className="info-label">Valid Thru</span>
                <span className="info-value">{formatExpiry(expiryDate)}</span>
              </div>
            </div>
          </div>

          <div className="card-circle-1"></div>
          <div className="card-circle-2"></div>
        </div>
      </div>

      <div className="card-info-panel">
        <div className="panel-header">
          <h3 className="panel-title">
            <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2"/>
            </svg>
            Secure Card Details
          </h3>
        </div>

        <div className="info-row">
          <div className="info-left">
            <span className="row-label">Card Number</span>
            <span className="row-value mono-text">{formatCardNumber(cardNumber)}</span>
          </div>
          <button
            className="copy-btn"
            onClick={() => copyToClipboard(cardNumber, 'cardNumber')}
            title="Copy card number"
          >
            {copiedField === 'cardNumber' ? (
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" strokeWidth="2"/>
              </svg>
            ) : (
              <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2"/>
              </svg>
            )}
          </button>
        </div>

        <div className="info-grid">
          <div className="grid-item cvv-item">
            <span className="row-label">CVV Code</span>
            <div className="cvv-display">
              <span className="row-value mono-text cvv-value">
                {loading ? '...' : cvvValue}
              </span>
              <button
                className="toggle-cvv-btn"
                onClick={handleToggleCVV}
                title={showCVV ? 'Hide CVV' : 'Show CVV'}
                disabled={loading}
              >
                {showCVV ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeWidth="2"/>
                    <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid-item">
            <span className="row-label">Expiry Date</span>
            <span className="row-value mono-text">{formatExpiry(expiryDate)}</span>
          </div>
        </div>

        <div className="info-row no-border">
          <div className="info-left">
            <span className="row-label">Card Holder Name</span>
            <span className="row-value uppercase-text">{cardHolderName}</span>
          </div>
        </div>

        <div className="status-container">
          <div className="status-badge active-status">
            <span className="status-dot"></span>
            <span className="status-text">Active & Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}