import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { FiArrowLeft, FiSave, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const EditProfile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        profile_pic_url: user?.profile_pic_url && user.profile_pic_url !== '' ? user.profile_pic_url : null,
        category: '',
        niche: '',
        language: '',
        country: '',
        portfolio_url: '',
        bio: '',
        company_name: '',
        industry: ''
    });

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/profile?user_id=${user.id}&role=${user.role}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfileData(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setPageLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleImageSuccess = (url) => {
        setProfileData({ ...profileData, profile_pic_url: url });
        updateUser({ profile_pic_url: url }); // Update global user context immediately for instant UI reaction
    };

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profileData, user_id: user.id, role: user.role })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update profile');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container py-5 min-vh-100 d-flex align-items-center justify-content-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="edit-profile-card shadow-2xl overflow-hidden"
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '1.5rem 1rem'
                }}
            >
                <div className="d-flex flex-column flex-md-row align-items-center mb-4 mb-md-5 gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-sm text-white-50 p-0 hover-light"
                        style={{ background: 'transparent', border: 'none' }}
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <h4 className="text-white fw-bold mb-0">Edit Profile (Settings)</h4>
                </div>

                <div className="profile-upload-area mb-5">
                    <ImageUpload
                        userId={user.id}
                        onUploadSuccess={handleImageSuccess}
                        initialImage={profileData.profile_pic_url}
                    />
                    <div className="text-center mt-3">
                        <span className="text-white-50 small opacity-75">Click icon to change photo</span>
                    </div>
                </div>

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="alert border-0 text-center mb-4 py-2"
                        style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', fontSize: '0.85rem' }}
                    >
                        Profile updated successfully!
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="alert border-0 text-center mb-4 py-2"
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.85rem' }}
                    >
                        {error}
                    </motion.div>
                )}

                {pageLoading ? (
                    <div className="text-center py-4">
                        <span className="spinner-border text-primary"></span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group mb-4">
                            <label className="text-white-50 small text-uppercase fw-bold mb-2 d-block letter-spacing-1" style={{ fontSize: '0.65rem' }}>Username</label>
                            <div className="custom-input-group">
                                <FiUser className="input-icon text-muted" />
                                <input
                                    type="text"
                                    className="custom-input"
                                    value={profileData.username}
                                    disabled
                                />
                            </div>
                            <span className="text-muted xx-small mt-1 d-block opacity-50">Username is unique and cannot be changed</span>
                        </div>

                        {user.role === 'influencer' && (
                            <>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6 form-group">
                                        <label className="text-white-50 small text-uppercase fw-bold mb-2 d-block letter-spacing-1" style={{ fontSize: '0.65rem' }}>Category</label>
                                        <input type="text" className="custom-input" name="category" value={profileData.category || ''} onChange={handleChange} placeholder="e.g. Lifestyle" />
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label className="text-white-50 small text-uppercase fw-bold mb-2 d-block letter-spacing-1" style={{ fontSize: '0.65rem' }}>Niche</label>
                                        <input type="text" className="custom-input" name="niche" value={profileData.niche || ''} onChange={handleChange} placeholder="e.g. Streetwear" />
                                    </div>
                                </div>
                                <div className="row g-3 mb-4">
                                     <div className="col-md-6 form-group">
                                        <label className="text-white-50 small text-uppercase fw-bold mb-2 d-block letter-spacing-1" style={{ fontSize: '0.65rem' }}>Country</label>
                                        <input type="text" className="custom-input" name="country" value={profileData.country || ''} onChange={handleChange} placeholder="e.g. United States" />
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label className="text-white-50 small text-uppercase fw-bold mb-2 d-block letter-spacing-1" style={{ fontSize: '0.65rem' }}>Language</label>
                                        <input type="text" className="custom-input" name="language" value={profileData.language || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group mb-4">
                                    <label className="text-white-50 small text-uppercase fw-bold mb-2 d-block letter-spacing-1" style={{ fontSize: '0.65rem' }}>Portfolio URL</label>
                                    <input type="url" className="custom-input" name="portfolio_url" value={profileData.portfolio_url || ''} onChange={handleChange} />
                                </div>
                                <div className="form-group mb-5">
                                    <label className="text-white-50 small text-uppercase fw-bold mb-2 d-block letter-spacing-1" style={{ fontSize: '0.65rem' }}>Bio</label>
                                    <textarea className="custom-input" name="bio" rows="3" value={profileData.bio || ''} onChange={handleChange} placeholder="Tell brands about yourself..."></textarea>
                                </div>
                            </>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="save-btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : <FiSave />}
                            {loading ? 'Processing...' : 'Save Settings'}
                        </motion.button>
                    </form>
                )}

                <style>{`
                    .letter-spacing-1 { letter-spacing: 1.5px; }
                    .xx-small { font-size: 0.7rem; }
                    
                    .custom-input-group {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    .input-icon {
                        position: absolute;
                        left: 16px;
                        font-size: 18px;
                    }
                    .custom-input {
                        width: 100%;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        padding: 14px 16px;
                        color: white !important;
                        font-size: 0.95rem;
                        transition: all 0.3s ease;
                        opacity: 0.7;
                    }
                    .custom-input-group > .custom-input {
                        padding-left: 44px;
                    }
                    .custom-input:focus {
                        border-color: rgba(99, 102, 241, 0.5);
                        background: rgba(255, 255, 255, 0.08);
                        outline: none;
                    }
                    .custom-input:disabled {
                        cursor: not-allowed;
                        background: rgba(255, 255, 255, 0.02);
                        color: rgba(255, 255, 255, 0.3) !important;
                    }
                    .save-btn {
                        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        font-size: 1rem;
                        box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
                        transition: all 0.3s ease;
                    }
                    .save-btn:disabled {
                        opacity: 0.6;
                        cursor: wait;
                    }
                    .hover-light:hover {
                        color: white !important;
                        opacity: 1;
                    }
                    @media (min-width: 768px) {
                        .edit-profile-card {
                            padding: 2.5rem !important;
                        }
                    }
                `}</style>
            </motion.div>
        </div>
    );
};

export default EditProfile;
