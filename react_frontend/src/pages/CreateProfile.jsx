import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { API_URL } from '../config';

const CreateProfile = () => {
    const { user, login } = useAuth(); // We might need to update user state after profile creation
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        company_name: '',
        industry: '',
        description: '',
        category: '',
        niche: '',
        country: '',
        language: 'English',
        portfolio_url: '',
        profile_pic_url: '',
        platforms: [{ platform_name: 'Instagram', follower_count: '', username: '', url: '' }]
    });

    const handleImageUpload = (url) => {
        setFormData({ ...formData, profile_pic_url: url });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlatformChange = (index, e) => {
        const newPlatforms = [...formData.platforms];
        newPlatforms[index][e.target.name] = e.target.value;
        setFormData({ ...formData, platforms: newPlatforms });
    };

    const addPlatform = () => {
        setFormData({
            ...formData,
            platforms: [...formData.platforms, { platform_name: 'Instagram', follower_count: '', username: '', url: '' }]
        });
    };

    const removePlatform = (index) => {
        const newPlatforms = formData.platforms.filter((_, i) => i !== index);
        setFormData({ ...formData, platforms: newPlatforms });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/create_profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, user_id: user.id, role: user.role })
            });

            if (response.ok) {
                // Ideally, we should update the user context to reflect profile_completed = true
                // For now, let's just force a re-login or manual update if possible, 
                // or just redirect and assume the next check will pass (e.g. if we refresh).
                // But Login.jsx logic only runs on login. 
                // We should probably update the local user object.
                const updatedUser = { ...user, profile_completed: true };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // We can't easily update context user without a setUser function exposed or calling login again.
                // But passing basic login might work if we just redirect.

                navigate('/dashboard');
                window.location.reload(); // Force reload to update context from localStorage
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create profile');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Should be protected route

    return (
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <motion.div
                className="card border-0 shadow-lg"
                style={{ width: '100%', maxWidth: '600px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Complete Your Profile</h2>
                        <p className="text-secondary">Tell us more about yourself to get started.</p>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="d-flex justify-content-center mb-4">
                        <ImageUpload
                            userId={user.id}
                            onUploadSuccess={handleImageUpload}
                            initialImage={formData.profile_pic_url}
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        {user.role === 'brand' && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Company Name</label>
                                    <input type="text" className="form-control" name="company_name" value={formData.company_name} onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Industry</label>
                                    <input type="text" className="form-control" name="industry" placeholder="e.g. Technology, Fashion" value={formData.industry} onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" name="description" rows="4" placeholder="Tell us about your brand..." value={formData.description} onChange={handleChange} required></textarea>
                                </div>
                            </>
                        )}

                        {user.role === 'influencer' && (
                            <>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Category</label>
                                        <input type="text" className="form-control" name="category" placeholder="e.g. Lifestyle" value={formData.category} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Niche</label>
                                        <input type="text" className="form-control" name="niche" placeholder="e.g. Streetwear" value={formData.niche} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Primary Language</label>
                                        <input type="text" className="form-control" name="language" placeholder="e.g. English" value={formData.language} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Country</label>
                                        <input type="text" className="form-control" name="country" placeholder="e.g. United States" value={formData.country} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label">Portfolio URL</label>
                                        <input type="url" className="form-control" name="portfolio_url" placeholder="https://..." value={formData.portfolio_url} onChange={handleChange} />
                                    </div>
                                </div>

                                <label className="form-label mb-2 fw-bold">Social Platforms</label>
                                {formData.platforms.map((platform, index) => (
                                    <div key={index} className="card mb-3 border-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <div className="card-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted">Platform</label>
                                                    <select className="form-select" name="platform_name" value={platform.platform_name} onChange={(e) => handlePlatformChange(index, e)}>
                                                        <option value="Instagram">Instagram</option>
                                                        <option value="YouTube">YouTube</option>
                                                        <option value="TikTok">TikTok</option>
                                                        <option value="Twitter">Twitter</option>
                                                        <option value="LinkedIn">LinkedIn</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted">Followers</label>
                                                    <input type="number" className="form-control" name="follower_count" placeholder="0" value={platform.follower_count} onChange={(e) => handlePlatformChange(index, e)} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted">Username (Optional)</label>
                                                    <input type="text" className="form-control" name="username" placeholder="@username" value={platform.username} onChange={(e) => handlePlatformChange(index, e)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted">Profile URL (Optional)</label>
                                                    <input type="url" className="form-control" name="url" placeholder="https://..." value={platform.url} onChange={(e) => handlePlatformChange(index, e)} />
                                                </div>
                                            </div>
                                            {formData.platforms.length > 1 && (
                                                <div className="mt-2 text-end">
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removePlatform(index)}>Remove</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={addPlatform}>
                                    + Add Another Platform
                                </button>
                            </>
                        )}

                        <div className="d-grid mt-4">
                            <button type="submit" className="btn btn-primary py-2" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateProfile;
