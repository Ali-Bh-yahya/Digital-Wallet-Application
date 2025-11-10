import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [notice, setNotice] = useState(null);
  const [theme, setTheme] = useState("dim");

  const { logout } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const showNotice = (type, msg) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 3500);
  };

  const loadPendingUsers = async () => {
    const res = await api.get("/admin/pending-users");
    return res.data.data || res.data || [];
  };
  const loadActiveUsers = async () => {
    const res = await api.get("/admin/active-users");
    return res.data.data || res.data || [];
  };
  const loadSuspendedUsers = async () => {
    const res = await api.get("/admin/suspended-users");
    return res.data.data || res.data || [];
  };
  const loadAllTransactions = async () => {
    const res = await api.get("/admin/all-transactions");
    return res.data?.data || res.data || [];
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, a, s, t] = await Promise.all([
          loadPendingUsers(),
          loadActiveUsers(),
          loadSuspendedUsers(),
          loadAllTransactions()
        ]);
        setPendingUsers(p);
        setActiveUsers(a);
        setSuspendedUsers(s);
        setAllTransactions(t);
      } catch (e) {
        console.error(e);
        showNotice("error", e.response?.data?.error || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const approve = async (id) => {
    if (!window.confirm("Approve this user?")) return;
    if (busyAction) return;
    try {
      setBusyAction(id);
      await api.patch(`/admin/approve/${id}`);
      const [p, a] = await Promise.all([loadPendingUsers(), loadActiveUsers()]);
      setPendingUsers(p);
      setActiveUsers(a);
      showNotice("success", "✓ User approved successfully");
    } catch (e) {
      showNotice("error", e.response?.data?.error || e.message);
    } finally {
      setBusyAction(null);
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this user? This cannot be undone.")) return;
    if (busyAction) return;
    try {
      setBusyAction(id);
      await api.patch(`/admin/reject/${id}`);
      setPendingUsers(await loadPendingUsers());
      showNotice("success", "User rejected");
    } catch (e) {
      showNotice("error", e.response?.data?.error || e.message);
    } finally {
      setBusyAction(null);
    }
  };

  const suspendUser = async (id) => {
    if (!window.confirm("Suspend this user? They won't be able to access their account.")) return;
    if (busyAction) return;
    try {
      setBusyAction(id);
      await api.patch(`/admin/suspend/${id}`);
      const [a, s] = await Promise.all([loadActiveUsers(), loadSuspendedUsers()]);
      setActiveUsers(a);
      setSuspendedUsers(s);
      showNotice("success", "User suspended");
    } catch (e) {
      showNotice("error", e.response?.data?.error || e.message);
    } finally {
      setBusyAction(null);
    }
  };

  const unsuspendUser = async (id) => {
    if (!window.confirm("Reactivate this user?")) return;
    if (busyAction) return;
    try {
      setBusyAction(id);
      await api.patch(`/admin/unsuspend/${id}`);
      const [a, s] = await Promise.all([loadActiveUsers(), loadSuspendedUsers()]);
      setActiveUsers(a);
      setSuspendedUsers(s);
      showNotice("success", "✓ User reactivated");
    } catch (e) {
      showNotice("error", e.response?.data?.error || e.message);
    } finally {
      setBusyAction(null);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("⚠️ DANGER: This will permanently delete the user and ALL their data. Continue?")) return;
    if (busyAction) return;
    try {
      setBusyAction(id);
      await api.delete(`/admin/user/${id}`);
      setActiveUsers(await loadActiveUsers());
      showNotice("success", "User deleted permanently");
    } catch (e) {
      showNotice("error", e.response?.data?.error || e.message);
    } finally {
      setBusyAction(null);
    }
  };

  const downloadImage = (imagePath, userName) => {
    const link = document.createElement("a");
    link.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${imagePath}`;
    link.download = `ID_${userName}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (allTransactions || []).filter((t) => {
      const matchesType = filterType === "all" || t.type === filterType;
      const matchesSearch =
        !term ||
        t.user?.name?.toLowerCase().includes(term) ||
        t.user?.idNumber?.toString().includes(term) ||
        t.toUser?.name?.toLowerCase().includes(term) ||
        t.toUser?.idNumber?.toString().includes(term);
      return matchesType && matchesSearch;
    });
  }, [allTransactions, searchTerm, filterType]);

  const stats = useMemo(
    () => ({
      totalUsers: activeUsers.length,
      pendingApprovals: pendingUsers.length,
      suspendedUsers: suspendedUsers.length,
      totalTransactions: allTransactions.length,
      totalVolume: allTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      todayTransactions: allTransactions.filter((t) => {
        const today = new Date().toDateString();
        return new Date(t.createdAt).toDateString() === today;
      }).length,
      // 🆕 NEW: Additional stats
      depositsToday: allTransactions.filter((t) => {
        const today = new Date().toDateString();
        return t.type === 'deposit' && new Date(t.createdAt).toDateString() === today;
      }).reduce((sum, t) => sum + t.amount, 0),
      transfersToday: allTransactions.filter((t) => {
        const today = new Date().toDateString();
        return t.type === 'transfer' && new Date(t.createdAt).toDateString() === today;
      }).length,
    }),
    [activeUsers, pendingUsers, suspendedUsers, allTransactions]
  );

  return (
    <div className="admin-container">
      <div className="admin-wrapper">

        {/* 🎨 Enhanced Header with Gradient */}
        <header className="admin-header glass glow">
          <div className="title-wrap">
            <h1>
              <span className="gradient-text">Admin Dashboard</span>
            </h1>
            <p className="subtitle">Monitor system health, manage users, and review transactions</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="btn icon-btn"
              onClick={() => setTheme((t) => (t === "light" ? "dim" : "light"))}
              title={theme === "light" ? "Switch to dim mode" : "Switch to light mode"}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button
              className="logout-btn pulse-hover"
              onClick={async () => {
                await logout();
                window.location.href = "/";
              }}
            >
              Logout →
            </button>
          </div>
        </header>

        {/* 🔔 Animated Notice */}
        {notice && (
          <div className={`notice fade-in ${notice.type === "error" ? "notice-error" : "notice-success"}`}>
            <span className="notice-icon">{notice.type === "error" ? "⚠️" : "✓"}</span>
            {notice.msg}
          </div>
        )}

        {/* 📊 Enhanced KPI Cards with Animation */}
        <section className="stats-grid">
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => <div key={i} className="stat-card skeleton pulse" />)}
            </>
          ) : (
            <>
              <Kpi icon="👥" label="Active Users" value={stats.totalUsers} trend="+12%" color="blue" delay="0ms" />
              <Kpi icon="⏳" label="Pending" value={stats.pendingApprovals} color="amber" delay="100ms" />
              <Kpi icon="💰" label="Volume Today" value={`$${stats.depositsToday.toFixed(0)}`} trend="+23%" color="green" delay="200ms" />
              <Kpi icon="📊" label="Transactions" value={stats.todayTransactions} color="purple" delay="300ms" />
            </>
          )}
        </section>

        {/* 🎯 Modern Tabs */}
        <nav className="tabs-container glass">
          <TabButton 
            active={activeTab === "pending"} 
            onClick={() => setActiveTab("pending")} 
            count={pendingUsers.length} 
            icon="📝" 
            label="Pending" 
            color="amber"
          />
          <TabButton 
            active={activeTab === "active"} 
            onClick={() => setActiveTab("active")} 
            count={activeUsers.length} 
            icon="✅" 
            label="Active" 
            color="green"
          />
          <TabButton 
            active={activeTab === "suspended"} 
            onClick={() => setActiveTab("suspended")} 
            count={suspendedUsers.length} 
            icon="⛔" 
            label="Suspended" 
            color="red"
          />
          <TabButton 
            active={activeTab === "transactions"} 
            onClick={() => setActiveTab("transactions")} 
            count={allTransactions.length} 
            icon="📊" 
            label="Transactions" 
            color="blue"
          />
        </nav>

        {/* 📄 Content Area */}
        <section className="content-container glass slide-up">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {activeTab === "pending" && (
                <div className="cards-col">
                  {pendingUsers.length === 0 ? (
                    <EmptyState 
                      icon="📭" 
                      title="No pending applications" 
                      hint="New user registrations will appear here for your review." 
                    />
                  ) : (
                    pendingUsers.map((u, idx) => (
                      <div key={u._id} className="user-card fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="card-header">
                          <div>
                            <h3>
                              {u.name} 
                              <span className="id-badge">#{u.idNumber}</span>
                            </h3>
                            <div className="user-meta">
                              <span>📧 {u.email}</span>
                              <span>📱 {u.phone}</span>
                            </div>
                          </div>
                          <div className="applied-date">
                            <small>Applied</small>
                            <strong>{new Date(u.createdAt).toLocaleDateString()}</strong>
                          </div>
                        </div>

                        {u.idCardImage && (
                          <div className="image-actions">
                            <button
                              className="btn outline"
                              onClick={() => setViewingImage(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${u.idCardImage}`)}
                            >
                              🔍 View ID Card
                            </button>
                            <button className="btn solid emerald" onClick={() => downloadImage(u.idCardImage, u.name)}>
                              ⬇️ Download
                            </button>
                          </div>
                        )}

                        <div className="action-buttons">
                          <button 
                            disabled={busyAction === u._id} 
                            className="btn solid emerald grow" 
                            onClick={() => approve(u._id)}
                          >
                            {busyAction === u._id ? "⏳" : "✓"} Approve
                          </button>
                          <button 
                            disabled={busyAction === u._id} 
                            className="btn solid danger grow" 
                            onClick={() => reject(u._id)}
                          >
                            {busyAction === u._id ? "⏳" : "✕"} Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "active" && (
                <SmartTable
                  rows={activeUsers}
                  emptyTitle="No active users"
                  emptyIcon="👤"
                  cols={[
                    { 
                      key: "name", 
                      label: "User", 
                      render: (u) => (
                        <div className="user-cell">
                          <div className="avatar">{u.name.charAt(0)}</div>
                          <div>
                            <div className="bold">{u.name}</div>
                            <div className="id-badge small">#{u.idNumber}</div>
                          </div>
                        </div>
                      )
                    },
                    { key: "email", label: "Email", render: (u) => <span className="muted">{u.email}</span> },
                    { 
                      key: "walletBalance", 
                      label: "Balance", 
                      render: (u) => (
                        <span className="amount-badge pos">${(u.walletBalance || 0).toFixed(2)}</span>
                      )
                    },
                    { key: "status", label: "Status", render: () => <span className="chip success">● Active</span> },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (u) => (
                        <div className="button-group">
                          <button 
                            disabled={busyAction === u._id} 
                            className="btn pill amber" 
                            onClick={() => suspendUser(u._id)}
                          >
                            Suspend
                          </button>
                          <button 
                            disabled={busyAction === u._id} 
                            className="btn pill danger" 
                            onClick={() => deleteUser(u._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )
                    }
                  ]}
                />
              )}

              {activeTab === "suspended" && (
                <SmartTable
                  rows={suspendedUsers}
                  emptyTitle="No suspended users"
                  emptyIcon="⛔"
                  cols={[
                    { 
                      key: "name", 
                      label: "User", 
                      render: (u) => (
                        <div className="user-cell">
                          <div className="avatar suspended">{u.name.charAt(0)}</div>
                          <div>
                            <div className="bold">{u.name}</div>
                            <div className="id-badge small">#{u.idNumber}</div>
                          </div>
                        </div>
                      )
                    },
                    { key: "email", label: "Email", render: (u) => <span className="muted">{u.email}</span> },
                    { 
                      key: "walletBalance", 
                      label: "Balance", 
                      render: (u) => <span className="amount-badge">${(u.walletBalance || 0).toFixed(2)}</span> 
                    },
                    { key: "status", label: "Status", render: () => <span className="chip warning">● Suspended</span> },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (u) => (
                        <button 
                          disabled={busyAction === u._id} 
                          className="btn pill emerald" 
                          onClick={() => unsuspendUser(u._id)}
                        >
                          Reactivate
                        </button>
                      )
                    }
                  ]}
                />
              )}

              {activeTab === "transactions" && (
                <div>
                  <div className="toolbar">
                    <div className="search-wrapper">
                      <span className="search-icon">🔍</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="Search by name or ID number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select className="select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                      <option value="all">All Types</option>
                      <option value="deposit">💰 Deposits</option>
                      <option value="withdrawal">💸 Withdrawals</option>
                      <option value="transfer">📤 Transfers</option>
                      <option value="receive">📥 Receives</option>
                    </select>
                  </div>

                  <SmartTable
                    rows={filteredTransactions}
                    emptyTitle="No transactions found"
                    emptyIcon="📊"
                    emptyHint="Transactions will appear here as users perform actions."
                    cols={[
                      {
                        key: "createdAt",
                        label: "Date & Time",
                        render: (t) => (
                          <div className="datetime-cell">
                            <div className="bold">{new Date(t.createdAt).toLocaleDateString()}</div>
                            <div className="muted small">{new Date(t.createdAt).toLocaleTimeString()}</div>
                          </div>
                        )
                      },
                      {
                        key: "type",
                        label: "Type",
                        render: (t) => (
                          <span className={`chip-fancy ${
                            t.type === "deposit" ? "success" : 
                            t.type === "withdrawal" ? "danger" : 
                            t.type === "receive" ? "info" :
                            "primary"
                          }`}>
                            {t.type === "deposit" && "💰"}
                            {t.type === "withdrawal" && "💸"}
                            {t.type === "transfer" && "📤"}
                            {t.type === "receive" && "📥"}
                            {" "}{t.type}
                          </span>
                        )
                      },
                      {
                        key: "from",
                        label: "From",
                        render: (t) =>
                          t.user ? (
                            <div className="user-mini">
                              <div className="bold">{t.user.name}</div>
                              <div className="id-badge small">#{t.user.idNumber}</div>
                            </div>
                          ) : <span className="muted">—</span>
                      },
                      {
                        key: "to",
                        label: "To",
                        render: (t) =>
                          (t.type === "transfer" || t.type === "receive") && t.toUser ? (
                            <div className="user-mini">
                              <div className="bold">{t.toUser.name}</div>
                              <div className="id-badge small">#{t.toUser.idNumber}</div>
                            </div>
                          ) : <span className="muted">—</span>
                      },
                      {
                        key: "amount",
                        label: "Amount",
                        render: (t) => (
                          <span className={`amount-badge ${t.type === "deposit" || t.type === "receive" ? "pos" : "neg"}`}>
                            {(t.type === "deposit" || t.type === "receive") ? "+" : "-"}${t.amount.toFixed(2)}
                          </span>
                        )
                      },
                      { 
                        key: "description", 
                        label: "Description", 
                        render: (t) => <span className="muted">{t.description || "—"}</span> 
                      },
                      { 
                        key: "status", 
                        label: "Status", 
                        render: (t) => (
                          <span className={`chip ${
                            t.status === "completed" ? "success" : 
                            t.status === "failed" ? "danger" : 
                            "warning"
                          }`}>
                            {t.status === "completed" && "✓"}
                            {t.status === "failed" && "✕"}
                            {t.status === "pending" && "⏳"}
                            {" "}{t.status}
                          </span>
                        )
                      }
                    ]}
                  />

                  {/* 🎨 Enhanced Summary Cards */}
                  <div className="summary-grid">
                    <SummaryCard 
                      label="Total Transactions" 
                      value={filteredTransactions.length} 
                      icon="📊"
                      color="blue"
                    />
                    <SummaryCard 
                      label="Total Volume" 
                      value={`$${filteredTransactions.reduce((s, t) => s + (t.amount || 0), 0).toFixed(2)}`}
                      icon="💰"
                      color="green"
                    />
                    <SummaryCard 
                      label="Deposits" 
                      value={filteredTransactions.filter((t) => t.type === "deposit").length}
                      icon="💵"
                      color="emerald"
                    />
                    <SummaryCard 
                      label="Withdrawals" 
                      value={filteredTransactions.filter((t) => t.type === "withdrawal").length}
                      icon="💸"
                      color="red"
                    />
                    <SummaryCard 
                      label="Transfers" 
                      value={filteredTransactions.filter((t) => t.type === "transfer").length}
                      icon="📤"
                      color="purple"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* 🖼️ Enhanced Image Modal */}
      {viewingImage && (
        <div className="modal-overlay fade-in" onClick={() => setViewingImage(null)}>
          <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewingImage(null)}>
              ✕
            </button>
            <img className="modal-image" src={viewingImage} alt="ID Card" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== PRESENTATIONAL COMPONENTS ========== */

function Kpi({ icon, label, value, trend, color, delay }) {
  return (
    <div className={`stat-card ${color} fade-in`} style={{ animationDelay: delay }}>
      <div className="stat-icon-wrap">
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value-wrap">
          <div className="stat-value">{value}</div>
          {trend && <span className="stat-trend">↗ {trend}</span>}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, count, icon, label, color }) {
  return (
    <button 
      className={`tab-btn ${active ? "active" : ""} ${color}`} 
      onClick={onClick}
    >
      <span className="tab-icon">{icon}</span>
      <span className="tab-label">{label}</span>
      <span className="tab-count">{count}</span>
    </button>
  );
}

function EmptyState({ icon, title, hint }) {
  return (
    <div className="empty-state fade-in">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {hint && <p className="muted">{hint}</p>}
    </div>
  );
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className={`summary-card ${color} fade-in`}>
      <div className="summary-icon">{icon}</div>
      <div className="summary-info">
        <div className="summary-label">{label}</div>
        <div className="summary-value">{value}</div>
      </div>
    </div>
  );
}

function SmartTable({ rows, cols, emptyTitle, emptyIcon, emptyHint }) {
  if (!rows || rows.length === 0) {
    return <EmptyState icon={emptyIcon || "📭"} title={emptyTitle} hint={emptyHint} />;
  }
  return (
    <div className="table-wrap">
      <table className="users-table">
        <thead>
          <tr>{cols.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r._id || i} className="fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              {cols.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-line pulse" />
      ))}
    </div>
  );
}