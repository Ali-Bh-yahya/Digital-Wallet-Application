// src/components/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { useNavigate } from "react-router-dom";
import VirtualCardDisplay from "./VirtualCardDisplay";
import "../styles/UserDashboard.css";

export default function UserDashboard() {
  const { user, fetchProfile, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [desc, setDesc] = useState("");
  const [verifiedRecipient, setVerifiedRecipient] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [transferring, setTransferring] = useState(false); // NEW: Transfer loading state
  const navigate = useNavigate();

  const load = async () => {
    try {
      const tRes = await api.get("/wallet/transactions");
      setTransactions(tRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      const res = await api.post("/wallet/deposit", { amount: Number(amount), description: desc });
      alert(res.data.msg);
      setAmount("");
      setDesc("");
      // Smooth refresh: Run both in parallel
      await Promise.all([fetchProfile(), load()]);
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      const res = await api.post("/wallet/withdraw", { amount: Number(amount), description: desc });
      alert(res.data.msg);
      setAmount("");
      setDesc("");
      // Smooth refresh: Run both in parallel
      await Promise.all([fetchProfile(), load()]);
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  const handleVerifyRecipient = async () => {
    if (!recipientId.trim()) {
      alert("Please enter recipient ID");
      return;
    }

    setVerifying(true);
    try {
      const res = await api.post("/wallet/verify-recipient", { recipientId: recipientId.trim() });
      setVerifiedRecipient(res.data.recipient);
      alert(`✓ Recipient found: ${res.data.recipient.name}`);
    } catch (e) {
      setVerifiedRecipient(null);
      alert(e.response?.data?.error || "Recipient not found");
    } finally {
      setVerifying(false);
    }
  };

  // 🔥 FIXED: Smooth transfer with no hard refresh
  const handleTransfer = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!recipientId.trim()) {
      alert("Please enter recipient ID number");
      return;
    }
    if (!verifiedRecipient) {
      alert("Please verify the recipient first by clicking 'Verify'");
      return;
    }

    // Final confirmation
    const confirmMsg = `Transfer $${amount} to ${verifiedRecipient.name} (ID: ${verifiedRecipient.idNumber})?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setTransferring(true); // Show loading state

    try {
      const res = await api.post("/wallet/transfer", { 
        amount: Number(amount), 
        recipientId: recipientId.trim(),
        description: desc 
      });
      
      // Show success message
      alert(res.data.msg);
      
      // Clear form immediately (feels faster)
      setAmount("");
      setRecipientId("");
      setDesc("");
      setVerifiedRecipient(null);
      
      // Refresh data in parallel (smoother, no blocking)
      await Promise.all([fetchProfile(), load()]);
      
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setTransferring(false); // Stop loading state
    }
  };

  const handleGenerateCard = async () => {
    try {
      const res = await api.post("/wallet/generate-card");
      alert(res.data.msg);
      await fetchProfile();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  const getTransactionAmount = (transaction) => {
    const amount = transaction.amount || 0;
    // Positive: deposit or receive money
    // Negative: withdrawal or transfer (sending money)
    const isPositive = transaction.type === "deposit" || transaction.type === "receive";
    return {
      amount: `${isPositive ? '+' : '-'}${Math.abs(amount)}`,
      className: isPositive ? "amount-positive" : "amount-negative"
    };
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <div className="user-info">
            <h1>Welcome back, {user?.name || 'User'}</h1>
            <div className="user-stats">
              <div className="stat-item">
                <p className="stat-label">Current Balance</p>
                <p className="stat-value">${user?.balance ?? user?.walletBalance ?? 0}</p>
              </div>
              <div className="stat-item">
                <p className="stat-label">Your ID</p>
                <p className="stat-value" style={{ fontSize: '16px', fontWeight: '600' }}>
                  {user?.idNumber || 'N/A'}
                </p>
              </div>
              <div className="stat-item">
                <span className="status-badge-header">
                  {user?.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
          <button className="logout-button" onClick={async () => { await logout(); navigate("/"); }}>
            Logout
          </button>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Actions Card */}
          <div className="dashboard-card">
            <h2 className="card-title">
              <span className="card-icon">💰</span>
              Quick Actions
            </h2>
            <div className="action-inputs">
              <input 
                className="dashboard-input"
                type="number"
                placeholder="Amount ($)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                disabled={transferring} // Disable during transfer
              />
              
              {/* Recipient ID input with verify button */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  className="dashboard-input"
                  style={{ flex: 1 }}
                  placeholder="Recipient ID (for transfer)" 
                  value={recipientId} 
                  onChange={(e) => {
                    setRecipientId(e.target.value);
                    setVerifiedRecipient(null);
                  }}
                  disabled={transferring} // Disable during transfer
                />
                <button 
                  className="action-btn"
                  style={{ 
                    minWidth: '100px',
                    backgroundColor: verifiedRecipient ? '#10b981' : '#3b82f6',
                    padding: '10px 16px'
                  }}
                  onClick={handleVerifyRecipient}
                  disabled={verifying || !recipientId.trim() || transferring}
                >
                  {verifying ? 'Verifying...' : verifiedRecipient ? '✓ Verified' : 'Verify'}
                </button>
              </div>

              {/* Show verified recipient info */}
              {verifiedRecipient && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #86efac',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '8px'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#059669' }}>
                    ✓ Recipient Found:
                  </p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>
                    {verifiedRecipient.name}
                  </p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                    ID: {verifiedRecipient.idNumber} • {verifiedRecipient.emailHint}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#059669', textTransform: 'uppercase' }}>
                    Status: {verifiedRecipient.status}
                  </p>
                </div>
              )}

              <input 
                className="dashboard-input"
                placeholder="Description (optional)" 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)}
                disabled={transferring} // Disable during transfer
              />
            </div>
            <div className="action-buttons">
              <button 
                className="action-btn btn-deposit" 
                onClick={handleDeposit}
                disabled={transferring}
              >
                Deposit
              </button>
              <button 
                className="action-btn btn-withdraw" 
                onClick={handleWithdraw}
                disabled={transferring}
              >
                Withdraw
              </button>
              <button 
                className="action-btn btn-transfer" 
                onClick={handleTransfer}
                disabled={!verifiedRecipient || transferring}
                style={{ 
                  opacity: (verifiedRecipient && !transferring) ? 1 : 0.5,
                  cursor: (verifiedRecipient && !transferring) ? 'pointer' : 'not-allowed'
                }}
              >
                {transferring ? '⏳ Processing...' : 'Transfer'}
              </button>
            </div>
          </div>

          {/* Transactions Card */}
          <div className="dashboard-card">
            <h2 className="card-title">
              <span className="card-icon">📊</span>
              Recent Transactions
            </h2>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">No transactions yet</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.map(t => {
                  const { amount, className } = getTransactionAmount(t);
                  return (
                    <div key={t._id || t.id} className="transaction-item">
                      <div className="transaction-info">
                        <p className="transaction-type">{t.type}</p>
                        {/* Show recipient info for transfers */}
                        {t.type === 'transfer' && t.toUser && (
                          <p className="transaction-desc" style={{ fontSize: '12px', color: '#6b7280' }}>
                            To: {t.toUser.name} (ID: {t.toUser.idNumber})
                          </p>
                        )}
                        <p className="transaction-date">
                          {new Date(t.createdAt).toLocaleDateString()} at {new Date(t.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className={`transaction-amount ${className}`}>{amount}</p>
                      <span className={`transaction-status status-${t.status}`}>
                        {t.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Virtual Card Section */}
        <div className="dashboard-card card-full-width">
          <h2 className="card-title">
            <span className="card-icon">💳</span>
            Virtual Card
          </h2>
          {user?.virtualCard ? (
            <VirtualCardDisplay cardData={user.virtualCard} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Generate your virtual card for secure online payments
              </p>
              <button className="generate-card-btn" onClick={handleGenerateCard}>
                Generate Virtual Card
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}