import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const EditCampaign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        start_date: '',
        end_date: '',
        status: 'active',
        deliverables: '',
        deadline: ''
    });

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`${API_URL}/api/campaigns/${id}`);
                if (response.ok) {
                    const data = await response.json();

                    // Simple check if user is the owner (optional but good practice)
                    // Since backend returns brand_id, and we have user.id. 
                    // But wait, key is brand_id in campaign, and user is a user, which has a brand associated.
                    // We don't have brand_id in user object easily unless we store it.
                    // For now, let's just proceed.

                    setFormData({
                        title: data.title,
                        description: data.description,
                        budget: data.budget,
                        start_date: data.start_date, // stored as YYYY-MM-DD string hopefully
                        end_date: data.end_date,
                        status: data.status,
                        deliverables: data.deliverables || '',
                        deadline: data.deadline || ''
                    });
                } else {
                    setError('Failed to fetch campaign details');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate(`/campaigns/${id}`);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update campaign');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-5">Loading...</div>;
    if (error) return <div className="alert alert-danger m-5">{error}</div>;

    return (
        <div className="container py-5">
            <motion.div
                className="card border-0 shadow-sm mx-auto"
                style={{ maxWidth: '600px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-body p-4">
                    <h2 className="mb-4">Edit Campaign</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Campaign Title</label>
                            <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} required></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Budget</label>
                            <input type="number" className="form-control" name="budget" value={formData.budget} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Deliverables</label>
                            <input type="text" className="form-control" name="deliverables" value={formData.deliverables} onChange={handleChange} />
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
                        <div className="mb-4">
                            <label className="form-label">Status</label>
                            <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={() => navigate(`/campaigns/${id}`)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default EditCampaign;
