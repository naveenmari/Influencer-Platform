import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const CreateCampaign = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        start_date: '',
        end_date: '',
        target_platform: 'Instagram',
        deliverables: '',
        deadline: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, user_id: user.id }) // Send user_id 
            });

            if (response.ok) {
                navigate('/dashboard');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create campaign');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <motion.div
                className="card border-0 shadow-sm mx-auto"
                style={{ maxWidth: '600px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-body p-4">
                    <h2 className="mb-4">Create New Campaign</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Campaign Title</label>
                            <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Target Platform</label>
                            <select className="form-select" name="target_platform" value={formData.target_platform} onChange={handleChange}>
                                <option value="Instagram">Instagram</option>
                                <option value="YouTube">YouTube</option>
                                <option value="TikTok">TikTok</option>
                                <option value="Twitter">Twitter</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} required></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Budget</label>
                            <input type="text" className="form-control" name="budget" placeholder="$1,000" value={formData.budget} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Deliverables (e.g. 2 TikToks, 1 Story)</label>
                            <input type="text" className="form-control" name="deliverables" value={formData.deliverables} onChange={handleChange} placeholder="Optional" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Application Deadline</label>
                            <input type="date" className="form-control" name="deadline" value={formData.deadline} onChange={handleChange} />
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Start Date</label>
                                <input type="date" className="form-control" name="start_date" value={formData.start_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">End Date</label>
                                <input type="date" className="form-control" name="end_date" value={formData.end_date} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={() => navigate('/dashboard')}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Campaign'}</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateCampaign;
