import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInstagram, FiTwitter, FiYoutube, FiMapPin, FiTrendingUp, FiCheckCircle, FiMoreHorizontal, FiMail, FiZap, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';
import ReviewList from './Reviews/ReviewList';
import { API_URL } from '../config';

const platformIcons = {
    'Instagram': <FiInstagram />,
    'TikTok': <FaTiktok />,
    'YouTube': <FiYoutube />,
    'Twitter': <FiTwitter />
};

const InfluencerCard = ({ influencer, isCenter = true, onClick }) => {
    const navigate = useNavigate();
    const [showReviews, setShowReviews] = useState(false);

    const handleHire = (e) => {
        e.stopPropagation();
        // Redirect to inbox and pass influencer as recipient
        navigate('/inbox', { 
            state: { 
                recipient: {
                    id: influencer.user_id,
                    username: influencer.username,
                    profile_pic_url: influencer.profile_pic_url,
                    role: 'influencer'
                } 
            } 
        });
    };

    // Mock data for missing fields to ensure premium look
    const followers = influencer.followers || Math.floor(Math.random() * 500000) + 10000;
    const engagement = influencer.engagement || (Math.random() * 5 + 1).toFixed(1);
    const location = influencer.location || 'New York, USA';
    const price = influencer.price || '$500 - $1,200';
    const platforms = influencer.platforms || ['Instagram', 'TikTok'];

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    const avgRating = influencer.average_rating ? Number(influencer.average_rating).toFixed(1) : 'New';
    const numReviews = influencer.review_count || 0;

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -10, scale: 1.02 }}
            animate={{
                scale: isCenter ? 1 : 0.9,
                opacity: isCenter ? 1 : 0.6,
                filter: isCenter ? 'blur(0px)' : 'blur(2px)'
            }}
            transition={{ duration: 0.4 }}
            className="influencer-card-wrapper h-100"
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="influencer-card h-100 p-4">
                {/* Header: Profile & Status */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="profile-img-container">
                        <img
                            src={influencer.profile_pic_url ? `${API_URL}${influencer.profile_pic_url}` : `https://ui-avatars.com/api/?name=${influencer.username}&background=random`}
                            alt={influencer.username}
                            className="profile-img shadow-lg"
                        />
                        <div className="status-dot"></div>
                    </div>
                    <div className="platforms-row d-flex gap-2">
                        {platforms.map(p => (
                            <div key={p} className="platform-pill" title={p}>
                                {platformIcons[p] || <FiMoreHorizontal />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Name & Niche */}
                <div className="mb-4">
                    <div className="d-flex align-items-center gap-2">
                        <h4 className="text-white fw-bold mb-0">{influencer.username}</h4>
                        <FiCheckCircle className="text-primary" size={16} />
                    </div>
                    <p className="text-white-50 small mb-0 mt-1">{influencer.niche || 'Lifestyle & Fashion'}</p>
                </div>

                {/* Metrics Grid */}
                <div className="metrics-grid mb-4">
                    <div className="metric-item">
                        <span className="metric-label">Followers</span>
                        <div className="metric-value">{formatNumber(followers)}</div>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Rating</span>
                        <div className="metric-value d-flex align-items-center gap-1">
                            <FiStar className={avgRating !== 'New' ? "text-warning" : "text-white-50"} size={14} fill={avgRating !== 'New' ? "#f59e0b" : "transparent"} />
                            {avgRating} <span className="text-white-50 small ms-1">({numReviews})</span>
                        </div>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Engagement</span>
                        <div className="metric-value d-flex align-items-center gap-1">
                            {engagement}% <FiTrendingUp className="text-success" size={12} />
                        </div>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Location</span>
                        <div className="metric-value d-flex align-items-center gap-1">
                            <FiMapPin size={12} /> {location.split(',')[0]}
                        </div>
                    </div>
                </div>

                {/* Collaboration Details */}
                <div className="collab-info mb-4">
                    <div className="p-3 rounded-3 bg-white-05 border border-white-05">
                        <span className="text-white-50 xx-small text-uppercase fw-bold letter-spacing-1 d-block mb-1">Collaboration Start</span>
                        <div className="text-primary fw-bold">{price}</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-auto">
                    <button 
                        onClick={handleHire}
                        className="btn btn-indigo flex-grow-1 py-12 px-0 d-flex align-items-center justify-content-center gap-2"
                    >
                        <FiZap size={14} /> Hire Now
                    </button>
                    <button className="btn btn-dark-soft p-2" onClick={(e) => { e.stopPropagation(); setShowReviews(!showReviews); }} title="View Reviews">
                        {showReviews ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>
                </div>

                <AnimatePresence>
                    {showReviews && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3"
                        >
                            <ReviewList influencerId={influencer.id} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .influencer-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 28px;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    width: 320px;
                }
                .profile-img-container {
                    position: relative;
                }
                .profile-img {
                    width: 72px;
                    height: 72px;
                    border-radius: 22px;
                    object-fit: cover;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }
                .status-dot {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 14px;
                    height: 14px;
                    background: #34d399;
                    border: 3px solid #0f0f10;
                    border-radius: 50%;
                }
                .platform-pill {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 16px;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                .metric-label {
                    display: block;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 4px;
                }
                .metric-value {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: white;
                }
                .bg-white-05 { background: rgba(255, 255, 255, 0.05); }
                .btn-indigo {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    border-radius: 14px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: none;
                    transition: all 0.3s ease;
                }
                .btn-indigo:hover {
                    box-shadow: 0 8px 20px -5px rgba(99, 102, 241, 0.5);
                    transform: translateY(-2px);
                }
                .btn-dark-soft {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .btn-dark-soft:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .py-12 { padding-top: 12px; padding-bottom: 12px; }
            `}</style>
        </motion.div>
    );
};

export default InfluencerCard;
