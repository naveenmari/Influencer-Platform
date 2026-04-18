import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InfluencerCard from '../components/InfluencerCard';
import { API_URL } from '../config';

const SearchInfluencers = () => {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [filters, setFilters] = useState({
        platform: '',
        niche: '',
        language: '',
        location: '',
        min_followers: '',
        sort_by: 'followers'
    });

    const fetchInfluencers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            if (response.ok) {
                const data = await response.json();
                setInfluencers(data);
            } else {
                setError('Failed to fetch influencers');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchInfluencers();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInfluencers();
    };

    return (
        <div className="container-fluid py-5" style={{ background: '#0f0f13', minHeight: '100vh', marginTop: '60px' }}>
            <div className="container">
                <div className="text-center mb-5">
                    <motion.h1 
                        className="display-4 fw-bold text-white mb-3"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Discover <span className="text-primary">Talent</span>
                    </motion.h1>
                    <p className="lead text-secondary">Find the perfect influencers for your next big campaign.</p>
                </div>

                <div className="row g-4">
                    {/* Filters Sidebar */}
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-lg p-4" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', color: 'white' }}>
                            <h4 className="fw-bold mb-4">Smart Filters</h4>
                            <form onSubmit={handleSearch}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Platform</label>
                                    <select className="form-select bg-dark text-white border-secondary" name="platform" value={filters.platform} onChange={handleChange}>
                                        <option value="">All Platforms</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="YouTube">YouTube</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="Twitter">Twitter</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Niche / Category</label>
                                    <input type="text" className="form-control bg-dark text-white border-secondary" name="niche" placeholder="e.g. Fashion, Gaming" value={filters.niche} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Min Followers</label>
                                    <input type="number" className="form-control bg-dark text-white border-secondary" name="min_followers" placeholder="e.g. 5000" value={filters.min_followers} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Location</label>
                                    <input type="text" className="form-control bg-dark text-white border-secondary" name="location" placeholder="e.g. USA, Global" value={filters.location} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Language</label>
                                    <input type="text" className="form-control bg-dark text-white border-secondary" name="language" placeholder="e.g. English" value={filters.language} onChange={handleChange} />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted small">Sort By</label>
                                    <select className="form-select bg-dark text-white border-secondary" name="sort_by" value={filters.sort_by} onChange={handleChange}>
                                        <option value="followers">Highest Followers</option>
                                        <option value="rating">Top Rated</option>
                                        <option value="engagement">Highest Engagement</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow">
                                    Apply Filters
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="col-lg-9">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger mx-auto">{error}</div>
                        ) : influencers.length === 0 ? (
                            <div className="text-center py-5">
                                <h3 className="text-white">No influencers found</h3>
                                <p className="text-muted">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <motion.div 
                                className="row g-4"
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.1 }
                                    }
                                }}
                            >
                                {influencers.map((influencer) => (
                                    <motion.div 
                                        key={influencer.id} 
                                        className="col-md-6 col-xl-4"
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                    >
                                        <InfluencerCard influencer={influencer} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchInfluencers;
