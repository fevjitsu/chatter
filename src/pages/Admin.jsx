// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Store,
  ShoppingCart,
  BarChart3,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Package,
  UserCheck,
  Mail,
  Lock,
  Globe,
  CreditCard
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState([]);

  // Check if user is admin (you'll need to implement this logic)
  const isAdmin = user?.email === 'admin@example.com' || user?.uid === 'admin'; // Replace with actual admin check

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      const [statsData, usersData, storesData, transactionsData, reportsData] = await Promise.all([
        loadStats(),
        loadUsers(),
        loadStores(),
        loadTransactions(),
        loadReports()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setStores(storesData);
      setTransactions(transactionsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data loading functions
  const loadStats = async () => ({
    totalUsers: 12489,
    totalStores: 567,
    totalTransactions: 89234,
    totalRevenue: 1245678.90,
    pendingVerifications: 23,
    activeToday: 1247,
    newRegistrations: 89,
    systemHealth: 99.8
  });

  const loadUsers = async () => [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      joinDate: '2024-01-15',
      status: 'active',
      verified: true,
      storeOwner: true,
      lastLogin: '2024-03-20T10:30:00Z'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      joinDate: '2024-02-01',
      status: 'suspended',
      verified: true,
      storeOwner: false,
      lastLogin: '2024-03-18T14:20:00Z'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      joinDate: '2024-03-10',
      status: 'active',
      verified: false,
      storeOwner: true,
      lastLogin: '2024-03-20T08:15:00Z'
    }
  ];

  const loadStores = async () => [
    {
      id: '1',
      name: 'Tech Gadgets',
      owner: 'John Doe',
      email: 'john@example.com',
      status: 'verified',
      products: 45,
      sales: 1234,
      rating: 4.8,
      joinDate: '2024-01-20'
    },
    {
      id: '2',
      name: 'Fashion Hub',
      owner: 'Sarah Wilson',
      email: 'sarah@example.com',
      status: 'pending',
      products: 23,
      sales: 567,
      rating: 4.5,
      joinDate: '2024-02-15'
    },
    {
      id: '3',
      name: 'Home Essentials',
      owner: 'Mike Johnson',
      email: 'mike@example.com',
      status: 'rejected',
      products: 12,
      sales: 89,
      rating: 4.2,
      joinDate: '2024-03-01'
    }
  ];

  const loadTransactions = async () => [
    {
      id: '1',
      user: 'John Doe',
      amount: 199.99,
      type: 'sale',
      status: 'completed',
      date: '2024-03-20T10:30:00Z',
      product: 'Wireless Headphones'
    },
    {
      id: '2',
      user: 'Jane Smith',
      amount: 24.99,
      type: 'refund',
      status: 'processed',
      date: '2024-03-20T09:15:00Z',
      product: 'Coffee Beans'
    },
    {
      id: '3',
      user: 'Mike Johnson',
      amount: 149.99,
      type: 'sale',
      status: 'pending',
      date: '2024-03-20T08:45:00Z',
      product: 'Smart Watch'
    }
  ];

  const loadReports = async () => [
    {
      id: '1',
      type: 'user_report',
      reporter: 'user123',
      reported: 'store456',
      reason: 'Inappropriate content',
      status: 'pending',
      date: '2024-03-20T10:00:00Z'
    },
    {
      id: '2',
      type: 'product_report',
      reporter: 'user456',
      reported: 'product789',
      reason: 'Counterfeit item',
      status: 'investigating',
      date: '2024-03-19T15:30:00Z'
    }
  ];

  // Admin actions
  const verifyStore = (storeId) => {
    setStores(stores.map(store =>
      store.id === storeId ? { ...store, status: 'verified' } : store
    ));
  };

  const rejectStore = (storeId) => {
    setStores(stores.map(store =>
      store.id === storeId ? { ...store, status: 'rejected' } : store
    ));
  };

  const suspendUser = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: 'suspended' } : user
    ));
  };

  const activateUser = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: 'active' } : user
    ));
  };

  const resolveReport = (reportId) => {
    setReports(reports.map(report =>
      report.id === reportId ? { ...report, status: 'resolved' } : report
    ));
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <Shield size={64} />
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-actions">
            <button className="export-btn">
              <Download size={16} />
              Export Data
            </button>
            <button className="settings-btn">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalUsers?.toLocaleString()}</div>
              <div className="stat-label">Total Users</div>
              <div className="stat-change positive">+{stats.newRegistrations} today</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stores">
              <Store size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalStores?.toLocaleString()}</div>
              <div className="stat-label">Active Stores</div>
              <div className="stat-change">
                <span className="warning">{stats.pendingVerifications} pending</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">${stats.totalRevenue?.toLocaleString()}</div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-change positive">+12.5% this month</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon transactions">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalTransactions?.toLocaleString()}</div>
              <div className="stat-label">Transactions</div>
              <div className="stat-change positive">+8.2% growth</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={18} />
            Dashboard
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Users
          </button>
          <button 
            className={`tab ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            <Store size={18} />
            Stores
          </button>
          <button 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <CreditCard size={18} />
            Transactions
          </button>
          <button 
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <AlertTriangle size={18} />
            Reports
          </button>
          <button 
            className={`tab ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <Settings size={18} />
            System
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab 
              stats={stats}
              users={users}
              stores={stores}
              transactions={transactions}
            />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UsersTab 
              users={users}
              onSuspendUser={suspendUser}
              onActivateUser={activateUser}
            />
          )}

          {/* Stores Tab */}
          {activeTab === 'stores' && (
            <StoresTab 
              stores={stores}
              onVerifyStore={verifyStore}
              onRejectStore={rejectStore}
            />
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <TransactionsTab transactions={transactions} />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsTab 
              reports={reports}
              onResolveReport={resolveReport}
            />
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <SystemTab stats={stats} />
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ stats, users, stores, transactions }) => {
  return (
    <div className="dashboard-tab">
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="activity-item">
                <div className="activity-avatar">
                  {user.name.charAt(0)}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{user.name}</strong> {user.status === 'active' ? 'joined' : 'was suspended'}
                  </div>
                  <div className="activity-time">
                    {formatTime(user.lastLogin)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Verifications */}
        <div className="dashboard-card">
          <h3>Pending Verifications</h3>
          <div className="verification-list">
            {stores.filter(store => store.status === 'pending').map(store => (
              <div key={store.id} className="verification-item">
                <div className="store-info">
                  <strong>{store.name}</strong>
                  <span>by {store.owner}</span>
                </div>
                <div className="verification-actions">
                  <button className="approve-btn">Approve</button>
                  <button className="reject-btn">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="dashboard-card">
          <h3>System Health</h3>
          <div className="health-metrics">
            <div className="health-metric">
              <span className="metric-label">Uptime</span>
              <span className="metric-value">{stats.systemHealth}%</span>
            </div>
            <div className="health-metric">
              <span className="metric-label">Active Users</span>
              <span className="metric-value">{stats.activeToday}</span>
            </div>
            <div className="health-metric">
              <span className="metric-label">Response Time</span>
              <span className="metric-value">128ms</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="quick-action">
              <Mail size={18} />
              <span>Send Announcement</span>
            </button>
            <button className="quick-action">
              <UserCheck size={18} />
              <span>Verify Stores</span>
            </button>
            <button className="quick-action">
              <Shield size={18} />
              <span>Security Scan</span>
            </button>
            <button className="quick-action">
              <Download size={18} />
              <span>Backup Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users, onSuspendUser, onActivateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-tab">
      <div className="tab-header">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="filter-btn">
          <Filter size={16} />
          Filter
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Store Owner</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      {user.verified && <span className="verified-badge">Verified</span>}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  {user.storeOwner ? (
                    <CheckCircle size={16} color="#00ba7c" />
                  ) : (
                    <XCircle size={16} color="#8b98a5" />
                  )}
                </td>
                <td>{formatDate(user.joinDate)}</td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn" title="View Profile">
                      <Eye size={14} />
                    </button>
                    {user.status === 'active' ? (
                      <button 
                        className="suspend-btn"
                        onClick={() => onSuspendUser(user.id)}
                        title="Suspend User"
                      >
                        <Lock size={14} />
                      </button>
                    ) : (
                      <button 
                        className="activate-btn"
                        onClick={() => onActivateUser(user.id)}
                        title="Activate User"
                      >
                        <UserCheck size={14} />
                      </button>
                    )}
                    <button className="more-btn">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stores Tab Component
const StoresTab = ({ stores, onVerifyStore, onRejectStore }) => {
  const [filter, setFilter] = useState('all');

  const filteredStores = stores.filter(store =>
    filter === 'all' || store.status === filter
  );

  return (
    <div className="stores-tab">
      <div className="tab-header">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Stores
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            Verified
          </button>
        </div>
      </div>

      <div className="stores-grid">
        {filteredStores.map(store => (
          <div key={store.id} className="store-card">
            <div className="store-header">
              <h4>{store.name}</h4>
              <span className={`store-status ${store.status}`}>
                {store.status}
              </span>
            </div>
            <div className="store-details">
              <div className="store-owner">
                <strong>Owner:</strong> {store.owner}
              </div>
              <div className="store-email">
                <strong>Email:</strong> {store.email}
              </div>
              <div className="store-stats">
                <span>Products: {store.products}</span>
                <span>Sales: {store.sales}</span>
                <span>Rating: ⭐ {store.rating}</span>
              </div>
            </div>
            <div className="store-actions">
              {store.status === 'pending' && (
                <>
                  <button 
                    className="verify-btn"
                    onClick={() => onVerifyStore(store.id)}
                  >
                    <CheckCircle size={16} />
                    Verify
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => onRejectStore(store.id)}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              )}
              <button className="view-store-btn">
                <Eye size={16} />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab = ({ transactions }) => {
  return (
    <div className="transactions-tab">
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Product</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>#{transaction.id}</td>
                <td>{transaction.user}</td>
                <td>${transaction.amount}</td>
                <td>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>{transaction.product}</td>
                <td>{formatTime(transaction.date)}</td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn" title="View Details">
                      <Eye size={14} />
                    </button>
                    <button className="more-btn">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reports Tab Component
const ReportsTab = ({ reports, onResolveReport }) => {
  return (
    <div className="reports-tab">
      <div className="reports-list">
        {reports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-type">{report.type.replace('_', ' ')}</div>
              <span className={`report-status ${report.status}`}>
                {report.status}
              </span>
            </div>
            <div className="report-content">
              <p><strong>Reporter:</strong> {report.reporter}</p>
              <p><strong>Reported:</strong> {report.reported}</p>
              <p><strong>Reason:</strong> {report.reason}</p>
            </div>
            <div className="report-actions">
              <button className="view-details-btn">
                <Eye size={14} />
                View Details
              </button>
              <button 
                className="resolve-btn"
                onClick={() => onResolveReport(report.id)}
              >
                <CheckCircle size={14} />
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// System Tab Component
const SystemTab = ({ stats }) => {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    storeCreations: true,
    emailNotifications: true
  });

  return (
    <div className="system-tab">
      <div className="system-grid">
        {/* System Settings */}
        <div className="system-card">
          <h3>System Settings</h3>
          <div className="settings-list">
            <label className="setting-toggle">
              <span>Maintenance Mode</span>
              <input
                type="checkbox"
                checked={systemSettings.maintenanceMode}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  maintenanceMode: e.target.checked
                })}
              />
            </label>
            <label className="setting-toggle">
              <span>Allow New Registrations</span>
              <input
                type="checkbox"
                checked={systemSettings.newRegistrations}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  newRegistrations: e.target.checked
                })}
              />
            </label>
            <label className="setting-toggle">
              <span>Allow Store Creations</span>
              <input
                type="checkbox"
                checked={systemSettings.storeCreations}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  storeCreations: e.target.checked
                })}
              />
            </label>
            <label className="setting-toggle">
              <span>Email Notifications</span>
              <input
                type="checkbox"
                checked={systemSettings.emailNotifications}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  emailNotifications: e.target.checked
                })}
              />
            </label>
          </div>
          <button className="save-settings-btn">
            Save Settings
          </button>
        </div>

        {/* System Information */}
        <div className="system-card">
          <h3>System Information</h3>
          <div className="system-info">
            <div className="info-item">
              <span>Platform Version</span>
              <span>v2.1.0</span>
            </div>
            <div className="info-item">
              <span>Last Backup</span>
              <span>2024-03-19 02:00 UTC</span>
            </div>
            <div className="info-item">
              <span>Database Size</span>
              <span>245 MB</span>
            </div>
            <div className="info-item">
              <span>Uptime</span>
              <span>{stats.systemHealth}%</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="system-card danger-zone">
          <h3>Danger Zone</h3>
          <div className="danger-actions">
            <button className="danger-btn">
              <Trash2 size={16} />
              Clear All Caches
            </button>
            <button className="danger-btn">
              <Download size={16} />
              Backup Database
            </button>
            <button className="danger-btn critical">
              <AlertTriangle size={16} />
              Emergency Shutdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default Admin;