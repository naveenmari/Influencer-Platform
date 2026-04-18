import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import InfluencerSlider from '../components/InfluencerSlider';
import AiCaptionWidget from '../components/AiCaptionWidget';
import { API_URL } from '../config';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState({ stats: [], campaigns: [], influencers: [], applications: [] });

    // Redirect if profile is not completed
    useEffect(() => {
        if (user && !user.profile_completed) {
            navigate('/create-profile');
        }
    }, [user, navigate]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('campaigns');

    // For demo purposes, we will use the role from the context, 
    // but allow toggling if we want to preview both sides (though API limits to user_id's real role usually)
    // The backend API strictly uses user_id, so we can only see what the logged in user is allowed to see.
    // So we will stick to user.role.

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${API_URL}/api/dashboard?user_id=${user.id}&role=${user.role}`);
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const [editingPlatform, setEditingPlatform] = useState(null);
    const [editValues, setEditValues] = useState({ follower_count: '', username: '', url: '' });

    const handleEditStart = (platform) => {
        setEditingPlatform(platform.id);
        setEditValues({
            follower_count: platform.follower_count,
            username: platform.username || '',
            url: platform.url || ''
        });
    };

    const handleEditCancel = () => {
        setEditingPlatform(null);
        setEditValues({ follower_count: '', username: '', url: '' });
    };

    const handleEditSave = async (platformId) => {
        try {
            const response = await fetch(`${API_URL}/api/update_platform_details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: platformId,
                    follower_count: editValues.follower_count,
                    username: editValues.username,
                    url: editValues.url
                })
            });

            if (response.ok) {
                // Update local state
                const updatedPlatforms = data.platforms.map(p =>
                    p.id === platformId ? {
                        ...p,
                        follower_count: editValues.follower_count,
                        username: editValues.username,
                        url: editValues.url
                    } : p
                );
                setData({ ...data, platforms: updatedPlatforms });
                setEditingPlatform(null);
            } else {
                alert('Failed to update. Please try again.');
            }
        } catch (error) {
            console.error('Error updating stats:', error);
            alert('Error updating stats.');
        }
    };

    if (loading) return <div className="container py-5 text-center">Loading...</div>;

    const isBrand = user?.role === 'brand';

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-circle bg-dark border border-white-10"
                        style={{ width: '48px', height: '48px', overflow: 'hidden', position: 'relative' }}
                    >
                        {user?.profile_pic_url ? (
                            <img
                                src={user.profile_pic_url.startsWith('/') ? `${API_URL}${user.profile_pic_url}?t=${new Date().getTime()}` : user.profile_pic_url}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="w-100 h-100 d-flex align-items-center justify-content-center text-white-50"><i class="bi bi-person-fill fs-4"></i></div>';
                                }}
                            />
                        ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white-50">
                                <i className="bi bi-person-fill fs-4"></i>
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="h2 fw-bold mb-0">Dashboard</h1>
                        <div className="d-flex align-items-center gap-2">
                            <p className="text-muted mb-0">Welcome back, {user?.username}</p>
                            <Link to="/edit-profile" className="text-primary small text-decoration-none">Edit Profile</Link>
                        </div>
                    </div>
                </div>
                {isBrand && (
                    <Link to="/campaigns/create" className="btn btn-primary">
                        + Create Campaign
                    </Link>
                )}
            </div>

            {/* Stats Overview */}
            <div className="row g-4 mb-5">
                {data.stats && data.stats.map((stat, i) => (
                    <div className="col-md-4" key={i}>
                        <motion.div
                            className="card dashboard-stat-card h-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="dashboard-stat-value">{stat.value}</div>
                            <div className="dashboard-stat-label">{stat.label}</div>
                        </motion.div>
                    </div>
                ))}

                {!isBrand && (
                    <div className="col-12">
                        <AiCaptionWidget />
                    </div>
                )}
            </div>

            {!isBrand && data.platforms && data.platforms.length > 0 && (
                <div className="mb-5">
                    <h4 className="fw-bold mb-3">Social Reach</h4>
                    <div className="row g-3">
                        {data.platforms.map((platform, i) => (
                            <div className="col-md-3" key={i}>
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body text-center position-relative">
                                        <h6 className="text-muted text-uppercase small letter-spacing-1">{platform.platform_name}</h6>

                                        {editingPlatform === platform.id ? (
                                            <div className="mt-2">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm mb-2 text-center"
                                                    placeholder="Followers"
                                                    value={editValues.follower_count}
                                                    onChange={(e) => setEditValues({ ...editValues, follower_count: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm mb-2 text-center"
                                                    placeholder="@username"
                                                    value={editValues.username}
                                                    onChange={(e) => setEditValues({ ...editValues, username: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm mb-2 text-center"
                                                    placeholder="URL"
                                                    value={editValues.url}
                                                    onChange={(e) => setEditValues({ ...editValues, url: e.target.value })}
                                                />
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-xs btn-success py-0 px-2" onClick={() => handleEditSave(platform.id)}>Save</button>
                                                    <button className="btn btn-xs btn-outline-secondary py-0 px-2" onClick={handleEditCancel}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="fw-bold mb-0">{parseInt(platform.follower_count).toLocaleString()}</h3>
                                                <small className="text-muted d-block mb-2">Followers</small>

                                                {platform.username && <div className="small text-dark fw-bold mb-1">{platform.username}</div>}

                                                {platform.url ? (
                                                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="btn btn-link btn-sm p-0 text-decoration-none">
                                                        Visit Profile <i className="bi bi-box-arrow-up-right small"></i>
                                                    </a>
                                                ) : (
                                                    <span className="text-muted small fst-italic">No link</span>
                                                )}

                                                <div>
                                                    <button
                                                        className="btn btn-link btn-sm text-muted p-0 mt-2"
                                                        style={{ fontSize: '0.8rem', textDecoration: 'none' }}
                                                        onClick={() => handleEditStart(platform)}
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'campaigns' ? 'active' : ''}`}
                        onClick={() => setActiveTab('campaigns')}
                    >
                        {isBrand ? 'My Campaigns' : 'Find Campaigns'}
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'network' ? 'active' : ''}`}
                        onClick={() => setActiveTab('network')}
                    >
                        {isBrand ? 'Find Influencers' : 'My Applications'}
                    </button>
                </li>
            </ul>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 10 }}
                >
                    {activeTab === 'campaigns' ? (
                        <div className="row g-4">
                            {/* Brand: My Campaigns, Influencer: Available Campaigns */}
                            {(data.campaigns || []).map((campaign) => (
                                <motion.div className="col-md-12" key={campaign.id} variants={itemVariants}>
                                    <div className="card">
                                        <div className="card-body d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="card-title mb-1">{campaign.title}</h5>
                                                <p className="text-muted small mb-0">
                                                    {campaign.company_name && <span className="text-primary fw-bold">{campaign.company_name}</span>}
                                                    {campaign.company_name && <> • </>}
                                                    Budget: {campaign.budget}
                                                    {isBrand && <> • <span className="badge bg-light text-dark border">{campaign.status}</span></>}
                                                </p>
                                            </div>
                                            <Link to={`/campaigns/${campaign.id}`} className="btn btn-outline-primary btn-sm">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {(!data.campaigns || data.campaigns.length === 0) && <p className="text-center text-muted col-12">No campaigns found.</p>}
                        </div>
                    ) : (
                        <div className="row g-4">
                            {isBrand ? (
                                // Brand: Find Influencers (Modern Slider)
                                <div className="col-12">
                                    <InfluencerSlider influencers={data.influencers} />
                                </div>
                            ) : (
                                // Influencer: My Applications
                                (data.applications || []).map((app) => (
                                    <motion.div className="col-md-12" key={app.id} variants={itemVariants}>
                                        <Link to={`/campaigns/${app.campaign_id}`} className="text-decoration-none">
                                            <div className="card hover-shadow transition-all border-white-10 bg-dark-soft">
                                                <div className="card-body d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h5 className="card-title mb-1 text-white">{app.campaign_title}</h5>
                                                        <p className="text-muted small mb-0">
                                                            Brand: <span className="text-info">{app.company_name}</span> • Status: <span className="badge bg-info">{app.status}</span>
                                                        </p>
                                                    </div>
                                                    <div className="btn btn-xs btn-outline-light opacity-50">View Details</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
