import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const Leaderboard = () => {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${API_URL}/api/leaderboard`);
                if (response.ok) {
                    const data = await response.json();
                    setInfluencers(data);
                } else {
                    setError('Failed to load leaderboard');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="container py-5 text-center">Loading rankings...</div>;
    if (error) return <div className="container py-5 text-center text-danger">{error}</div>;

    return (
        <div className="container py-4 py-md-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5"
            >
                <h1 className="fw-bold mb-3">Influencer Rankings</h1>
                <p className="text-muted">Top performing influencers based on successful campaigns and audience reach.</p>
            </motion.div>

            <div className="card border-0 shadow-lg overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-4 ps-4">Rank</th>
                                <th className="py-4">Influencer</th>
                                <th className="py-4">Category</th>
                                <th className="py-4 text-center">Campaigns Completed</th>
                                <th className="py-4 text-end pe-4">Total Followers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {influencers.map((influencer, index) => {
                                let rankBadge;
                                if (index === 0) rankBadge = <span className="badge bg-warning text-dark rounded-pill px-3">🥇 1st</span>;
                                else if (index === 1) rankBadge = <span className="badge bg-secondary text-white rounded-pill px-3">🥈 2nd</span>;
                                else if (index === 2) rankBadge = <span className="badge" style={{ backgroundColor: '#CD7F32', color: '#fff' }}>🥉 3rd</span>;
                                else rankBadge = <span className="fw-bold text-muted">#{index + 1}</span>;

                                return (
                                    <tr key={influencer.id}>
                                        <td className="ps-4">{rankBadge}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold overflow-hidden"
                                                    style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', flexShrink: 0 }}>
                                                    {influencer.profile_pic_url ? (
                                                        <img
                                                            src={`${API_URL}${influencer.profile_pic_url}?t=${new Date().getTime()}`}
                                                            alt={influencer.username}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = influencer.username.charAt(0).toUpperCase();
                                                            }}
                                                        />
                                                    ) : (
                                                        influencer.username.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold">{influencer.username}</h6>
                                                    <small className="text-muted">{influencer.niche}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-light text-dark border">{influencer.category}</span></td>
                                        <td className="text-center">
                                            <span className="fw-bold fs-5">{influencer.campaigns_completed}</span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <span className="fw-bold fs-5">{influencer.total_followers.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
