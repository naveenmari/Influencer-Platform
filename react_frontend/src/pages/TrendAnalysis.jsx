import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiHash, FiClock, FiStar, FiFilter, FiBookmark, FiSearch, FiActivity, FiVideo, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

const TrendAnalysis = () => {
    const { user } = useAuth();
    const [trends, setTrends] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        platform: 'all',
        time_range: '7d',
        industry: 'all'
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [savedMessage, setSavedMessage] = useState('');

    useEffect(() => {
        fetchTrendData();
        if (user) fetchBookmarks();
    }, [filters, user]);

    const fetchTrendData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            // Fetch trends
            const trendsRes = await fetch(`${API_URL}/api/trends?${queryParams}`);
            if (trendsRes.ok) setTrends(await trendsRes.json());

            // Fetch AI predictions
            const predRes = await fetch(`${API_URL}/api/trends/predict`);
            if (predRes.ok) setPredictions(await predRes.json());

        } catch (error) {
            console.error("Error fetching trend data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookmarks = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/trends/bookmarks?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setBookmarks(data.map(b => b.keyword));
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        }
    };

    const handleSaveTrend = async (keyword) => {
        if (!user) {
            alert('Please login to bookmark trends.');
            return;
        }
        try {
            const isBookmarked = bookmarks.includes(keyword);

            if (isBookmarked) {
                // Find ID to delete
                const resList = await fetch(`${API_URL}/api/trends/bookmarks?user_id=${user.id}`);
                const listData = await resList.json();
                const b = listData.find(item => item.keyword === keyword);
                if (b) {
                    const delRes = await fetch(`${API_URL}/api/trends/bookmarks?id=${b.id}`, { method: 'DELETE' });
                    if (delRes.ok) fetchBookmarks();
                }
            } else {
                const res = await fetch(`${API_URL}/api/trends/bookmarks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id, keyword, platform: filters.platform })
                });
                if (res.ok) {
                    setSavedMessage(`Saved "${keyword}" successfully!`);
                    setTimeout(() => setSavedMessage(''), 3000);
                    fetchBookmarks();
                }
            }

        } catch (error) {
            console.error("Error saving/removing trend:", error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    // Filter hashtags by search query locally
    const filteredHashtags = trends?.top_hashtags.filter(h =>
        h.tag.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="container py-5 mt-5">
            {/* Header & Filters */}
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mb-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                            <FiTrendingUp size={32} />
                        </div>
                        <div>
                            <h1 className="fw-bold mb-0 text-white">Trend Analysis</h1>
                            <p className="text-muted mb-0">Real-time social media insights and AI predictions</p>
                        </div>
                    </div>
                </div>

                <div className="card glass-card p-3 border-0">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0 border-white border-opacity-10 text-muted">
                                    <FiSearch />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-transparent border-start-0 border-white border-opacity-10 text-white shadow-none"
                                    placeholder="Search keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                                <select
                                    className="form-select bg-dark text-white border-white border-opacity-10 shadow-none w-auto"
                                    value={filters.platform}
                                    onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                                >
                                    <option value="all">All Platforms</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="twitter">Twitter / X</option>
                                </select>
                                <select
                                    className="form-select bg-dark text-white border-white border-opacity-10 shadow-none w-auto"
                                    value={filters.industry}
                                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                                >
                                    <option value="all">All Industries</option>
                                    <option value="tech">Tech</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="fitness">Fitness</option>
                                    <option value="food">Food</option>
                                </select>
                                <select
                                    className="form-select bg-dark text-white border-white border-opacity-10 shadow-none w-auto"
                                    value={filters.time_range}
                                    onChange={(e) => setFilters({ ...filters, time_range: e.target.value })}
                                >
                                    <option value="24h">Last 24 Hours</option>
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {savedMessage && (
                <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success fw-medium">
                    {savedMessage}
                </div>
            )}

            {/* Main Content Grid */}
            <div className="row g-4 mb-5">
                {/* Left Column: Trending Lists & AI */}
                <div className="col-lg-4 d-flex flex-column gap-4">
                    {/* Top Hashtags */}
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card glass-card border-0 h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 text-white d-flex align-items-center gap-2">
                                <FiHash className="text-primary" /> Trending Hashtags
                            </h5>
                            <div className="d-flex flex-column gap-3">
                                {filteredHashtags.length > 0 ? filteredHashtags.map((item, idx) => (
                                    <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded hover-bg-light transition-all">
                                        <div>
                                            <span className="fw-medium text-white">{item.tag}</span>
                                            <div className="text-muted small">{item.volume} posts</div>
                                        </div>
                                        <button
                                            onClick={() => handleSaveTrend(item.tag)}
                                            className={`btn btn-sm btn-icon ${bookmarks.includes(item.tag) ? 'text-primary' : 'text-muted hover-text-primary'}`}
                                            title={bookmarks.includes(item.tag) ? "Unsave" : "Save Trend"}
                                            style={{ background: 'transparent', border: 'none' }}
                                        >
                                            <FiBookmark fill={bookmarks.includes(item.tag) ? 'currentColor' : 'none'} size={18} />
                                        </button>
                                    </div>
                                )) : <div className="text-muted">No hashtags match your search.</div>}
                            </div>
                        </div>
                    </motion.div>

                    {/* Viral Topics */}
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card glass-card border-0 h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 text-white d-flex align-items-center gap-2">
                                <FiVideo className="text-secondary" /> Viral Content Topics
                            </h5>
                            <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                                {trends?.viral_topics.map((topic, idx) => (
                                    <li key={idx} className="text-muted d-flex align-items-start gap-2">
                                        <div className="mt-1 badge bg-secondary bg-opacity-10 text-secondary rounded-pill">
                                            #{idx + 1}
                                        </div>
                                        <span className="text-white-50">{topic}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* AI Predictions */}
                    {predictions && (
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card glass-card border-0 pattern-bg position-relative overflow-hidden">
                            <div className="position-absolute top-0 end-0 p-3 opacity-25">
                                <FiStar size={64} className="text-warning" />
                            </div>
                            <div className="card-body p-4 position-relative z-1">
                                <h5 className="fw-bold mb-4 text-warning d-flex align-items-center gap-2">
                                    <FiStar /> AI Insights
                                </h5>

                                <div className="mb-4">
                                    <h6 className="text-white-50 small text-uppercase tracking-wider mb-2">Predicted Trends</h6>
                                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                                        {predictions.upcoming_trends.map((t, idx) => (
                                            <li key={idx} className="text-white d-flex gap-2">
                                                <FiTrendingUp className="text-success mt-1 flex-shrink-0" />
                                                <span className="small">{t}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mb-4">
                                    <h6 className="text-white-50 small text-uppercase tracking-wider mb-2">Best Time to Post (<FiClock className="d-inline" />)</h6>
                                    <div className="h5 text-white fw-bold m-0">{predictions.best_time_to_post}</div>
                                </div>
                                <div>
                                    <h6 className="text-white-50 small text-uppercase tracking-wider mb-2">Content Ideas</h6>
                                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                                        {predictions.content_ideas.map((idea, idx) => (
                                            <li key={idx} className="text-white-50 small bg-white bg-opacity-5 p-2 rounded">
                                                {idea}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Charts */}
                <div className="col-lg-8">
                    {/* Growth Chart */}
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card glass-card border-0 mb-4 h-auto">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 text-white d-flex align-items-center gap-2">
                                <FiActivity className="text-info" /> Influencer Growth & Engagement
                            </h5>
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trends?.growth_trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="date" stroke="#ffffff50" />
                                        <YAxis yAxisId="left" stroke="#ffffff50" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#ffffff50" />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="followers" name="Followers (k)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line yAxisId="right" type="monotone" dataKey="engagement" name="Engagement (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    <div className="row g-4">
                        {/* Bar Chart */}
                        <div className="col-md-6">
                            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card glass-card border-0 h-100">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-4 text-white d-flex align-items-center gap-2">
                                        <FiBarChart2 className="text-primary" /> Category Flow
                                    </h5>
                                    <div style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={trends?.category_popularity} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                                                <XAxis type="number" stroke="#ffffff50" hide />
                                                <YAxis dataKey="category" type="category" stroke="#ffffff50" width={70} />
                                                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                                <Bar dataKey="value" name="Popularity" fill="#a855f7" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Pie Chart */}
                        <div className="col-md-6">
                            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card glass-card border-0 h-100">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-4 text-white d-flex align-items-center gap-2">
                                        <FiPieChart className="text-secondary" /> Audience Demographics
                                    </h5>
                                    <div style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={trends?.demographics}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                >
                                                    {trends?.demographics.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip itemStyle={{ color: '#fff' }} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                .glass-card {
                    background: rgba(40, 40, 40, 0.4);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    border-radius: 20px;
                }
                .hover-bg-light:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                .tracking-wider { letter-spacing: 0.1em; }
                .hover-text-primary:hover { color: #6366f1 !important; }
                .pattern-bg {
                    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .form-control:focus, .form-select:focus {
                    background-color: transparent;
                    color: white;
                }
                .form-select option {
                    background-color: #1a1a1a;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default TrendAnalysis;
