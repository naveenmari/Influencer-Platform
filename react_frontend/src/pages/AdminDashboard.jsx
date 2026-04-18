import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiShield, FiLock, FiEye, FiEyeOff, FiActivity, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const AdminDashboard = () => {
    const { user: authUser } = useAuth();
    const [stats, setStats] = useState({ users: 0, brands: 0, influencers: 0, campaigns: 0 });
    const [users, setUsers] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [selectedTab, setSelectedTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verifyPassword, setVerifyPassword] = useState('');
    const [verifyError, setVerifyError] = useState('');
    const [showPasswords, setShowPasswords] = useState({});

    useEffect(() => {
        if (!authUser || authUser.role !== 'admin') {
            setError('Unauthorized: Admin access required.');
            setLoading(false);
            return;
        }

        const initDashboard = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchUsers(), fetchCampaigns(), fetchVerifications()]);
            setLoading(false);
        };
        initDashboard();
    }, [authUser]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/stats?user_id=${authUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else if (res.status === 403) {
                setError('Unauthorized: Admin access required.');
            }
        } catch (err) { console.error('Error fetching admin stats', err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users?user_id=${authUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) { console.error('Error fetching admin users', err); }
    };

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/campaigns?user_id=${authUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (err) { console.error('Error fetching admin campaigns', err); }
    };

    const fetchVerifications = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/verifications?user_id=${authUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setVerifications(data);
            }
        } catch (err) { console.error('Error fetching verifications', err); }
    };

    const handleVerifyInfluencer = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/verify/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: authUser.id, status })
            });
            if (res.ok) {
                fetchVerifications();
            }
        } catch (err) { console.error('Error updating status', err); }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setVerifyError('');
        try {
            const res = await fetch(`${API_URL}/api/admin/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: verifyPassword,
                    user_id: authUser.id
                })
            });
            if (res.ok) {
                setIsVerified(true);
            } else {
                setVerifyError('Verification failed. Invalid admin password.');
            }
        } catch (err) {
            setVerifyError('Network error during verification.');
        }
    };

    const togglePassword = (id) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading Admin Center...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 mt-5 text-center">
                <div className="card border-0 glass-card p-5">
                    <FiShield size={64} className="text-danger mb-4 mx-auto" />
                    <h2 className="fw-bold mb-3">Access Denied</h2>
                    <p className="text-muted mb-4">{error}</p>
                    <button onClick={() => window.location.href = '/login'} className="btn btn-primary px-5">Go to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5 mt-5">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="admin-header mb-5"
            >
                <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary overflow-hidden d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                        {authUser?.profile_pic_url ? (
                            <img
                                src={authUser.profile_pic_url.startsWith('/') ? `${API_URL}${authUser.profile_pic_url}?t=${new Date().getTime()}` : authUser.profile_pic_url}
                                alt="Admin Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <FiShield size={32} />
                        )}
                    </div>
                    <div>
                        <h1 className="fw-bold mb-0">Admin Control Center</h1>
                        <div className="d-flex align-items-center gap-2 mt-1">
                            <p className="text-muted mb-0">Welcome back, {authUser?.username}</p>
                            <span className="text-muted">•</span>
                            <a href="/edit-profile" className="text-primary small text-decoration-none fw-medium hover-light">Edit Profile</a>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="row g-4 mb-5">
                {[
                    { id: 'users', label: 'Total Users', value: stats.users, icon: <FiUsers />, color: '#6366f1' },
                    { id: 'brands', label: 'Active Brands', value: stats.brands, icon: <FiBriefcase />, color: '#a855f7' },
                    { id: 'influencers', label: 'Influencers', value: stats.influencers, icon: <FiActivity />, color: '#ec4899' },
                    { id: 'campaigns', label: 'Campaigns', value: stats.campaigns, icon: <FiTrendingUp />, color: '#10b981' },
                    { id: 'verifications', label: 'Verifications Queue', value: verifications.filter(v => v.verification_status === 'unverified').length, icon: <FiShield />, color: '#f59e0b' }
                ].map((stat, idx) => (
                    <motion.div key={idx} className="col-md-4 col-xl" variants={itemVariants}>
                        <div
                            className="card border-0 glass-card h-100 p-4"
                            onClick={() => setSelectedTab(stat.id)}
                            style={{
                                cursor: 'pointer',
                                border: selectedTab === stat.id ? `2px solid ${stat.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: selectedTab === stat.id ? `0 0 20px ${stat.color}40` : 'none',
                                transform: selectedTab === stat.id ? 'translateY(-5px)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <span className="fs-1 fw-bold text-white">{stat.value}</span>
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                            </div>
                            <span className="text-muted small fw-medium text-uppercase tracking-wider">{stat.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Secure Management Section */}
            <motion.div variants={itemVariants} className="card border-0 glass-card overflow-hidden">
                <div className="card-header border-bottom border-white border-opacity-10 bg-transparent p-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="h5 mb-0 d-flex align-items-center gap-2 text-white text-capitalize">
                            {selectedTab === 'users' && <FiUsers className="text-primary" />}
                            {selectedTab === 'brands' && <FiBriefcase className="text-primary" />}
                            {selectedTab === 'influencers' && <FiActivity className="text-primary" />}
                            {selectedTab === 'campaigns' && <FiTrendingUp className="text-primary" />}
                            {selectedTab === 'verifications' && <FiShield className="text-primary" />}
                            {selectedTab} Repository
                        </h3>
                        {!isVerified && (
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2">
                                <FiLock className="me-1" /> Encrypted Access
                            </span>
                        )}
                    </div>
                </div>

                <div className="card-body p-0">
                    {!isVerified ? (
                        <div className="p-5 text-center">
                            <div className="p-4 rounded-circle bg-white bg-opacity-5 d-inline-flex mb-4">
                                <FiLock size={48} className="text-muted" />
                            </div>
                            <h4 className="fw-bold mb-3">Secondary Authentication Required</h4>
                            <p className="text-muted mb-4 max-w-md mx-auto small">
                                For your security, please enter your admin password again to reveal sensitive user credentials and platform data.
                            </p>
                            <form onSubmit={handleVerify} className="max-w-xs mx-auto d-flex flex-column gap-3 align-items-center">
                                <input
                                    type="password"
                                    className="auth-input-small w-100 text-center"
                                    placeholder="Admin Password"
                                    value={verifyPassword}
                                    onChange={(e) => setVerifyPassword(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">Verify Access</button>
                            </form>
                            {verifyError && <p className="text-danger small mt-3 mb-0">{verifyError}</p>}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-dark table-hover mb-0 align-middle">
                                <thead className="text-white" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                    {selectedTab === 'campaigns' ? (
                                        <tr>
                                            <th className="px-4 py-3 border-0">Campaign Title</th>
                                            <th className="py-3 border-0">Brand Entity</th>
                                            <th className="py-3 border-0">Budget</th>
                                            <th className="py-3 border-0">Status</th>
                                        </tr>
                                    ) : selectedTab === 'verifications' ? (
                                        <tr>
                                            <th className="px-4 py-3 border-0">Influencer Profile</th>
                                            <th className="py-3 border-0">Status</th>
                                            <th className="py-3 border-0">Fraud Risk (AI)</th>
                                            <th className="py-3 border-0">Action</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="px-4 py-3 border-0">User info</th>
                                            <th className="py-3 border-0">Role</th>
                                            <th className="py-3 border-0">Credentials</th>
                                            <th className="py-3 border-0">Joined</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {(selectedTab === 'campaigns' ? campaigns : selectedTab === 'verifications' ? verifications : users.filter(u => selectedTab === 'users' || u.role === (selectedTab === 'brands' ? 'brand' : 'influencer'))).map((item) => (
                                            <motion.tr
                                                key={`${selectedTab}-${item.id}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {selectedTab === 'campaigns' ? (
                                                    <>
                                                        <td className="px-4 py-3 border-white border-opacity-5">
                                                            <div className="fw-bold">{item.title}</div>
                                                            <div className="text-muted small d-flex align-items-center gap-1">
                                                                <FiTrendingUp size={12} /> {item.target_platform}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5">
                                                            <div className="fw-medium text-white">{item.company_name}</div>
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5 text-success fw-bold">
                                                            ${parseFloat(item.budget).toLocaleString()}
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5">
                                                            <span className={`badge rounded-pill px-3 py-1 fw-medium ${item.status === 'active' ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </>
                                                ) : selectedTab === 'verifications' ? (
                                                    <>
                                                        <td className="px-4 py-3 border-white border-opacity-5">
                                                            <div className="fw-bold">{item.username}</div>
                                                            <div className="text-muted small">{item.niche}</div>
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5">
                                                            <span className={`badge rounded-pill px-3 py-1 fw-medium ${item.verification_status === 'verified' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                                                {item.verification_status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5">
                                                            <div className={`d-inline-flex align-items-center gap-1 ${item.fraud_risk === 'High' ? 'text-danger fw-bold' : 'text-success'}`}>
                                                                <FiShield size={12} /> {item.fraud_risk}
                                                                {item.fraud_risk === 'High' && <span className="small text-muted ms-2 d-block">({item.fraud_reason})</span>}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5">
                                                            {item.verification_status === 'unverified' && (
                                                                <button onClick={() => handleVerifyInfluencer(item.id, 'verified')} className="btn btn-sm btn-success fw-bold">Approve</button>
                                                            )}
                                                            {item.verification_status === 'verified' && (
                                                                <button onClick={() => handleVerifyInfluencer(item.id, 'unverified')} className="btn btn-sm btn-outline-warning fw-bold">Revoke</button>
                                                            )}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3 border-white border-opacity-5">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="p-2 rounded bg-primary bg-opacity-20 text-primary small fw-bold">
                                                                    {item.username.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold">{item.username}</div>
                                                                    <div className="text-muted small">{item.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5">
                                                            <span className={`badge rounded-pill px-3 py-1 fw-medium ${item.role === 'admin' ? 'bg-danger text-white' :
                                                                item.role === 'brand' ? 'bg-primary text-white' : 'bg-info text-dark'
                                                                }`}>
                                                                {item.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <code className="text-info bg-info bg-opacity-10 px-2 py-1 rounded">
                                                                    {showPasswords[item.id] ? item.password_hash : '••••••••••••'}
                                                                </code>
                                                                <button
                                                                    onClick={() => togglePassword(item.id)}
                                                                    className="btn btn-sm btn-link text-muted p-0"
                                                                >
                                                                    {showPasswords[item.id] ? <FiEyeOff /> : <FiEye />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 border-white border-opacity-5 text-muted small">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </td>
                                                    </>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>

            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: 20px;
                }
                .logo-small { width: 32px; height: 32px; }
                .tracking-wider { letter-spacing: 0.1em; }
                .max-w-md { max-width: 450px; }
                .max-w-xs { max-width: 320px; }
                
                .auth-input-small {
                    background: rgba(40, 40, 40, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    padding: 8px 16px;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .auth-input-small:focus {
                    border-color: #6366f1;
                }
                .table-dark {
                    --bs-table-bg: transparent;
                }
                .badge { font-size: 0.75rem; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
