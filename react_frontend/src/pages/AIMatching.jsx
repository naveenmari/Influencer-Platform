import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

const AIMatching = () => {
    const [formData, setFormData] = useState({
        category: '',
        audience: '',
        budget: '',
        platform: 'Instagram',
        location: '',
        followers: ''
    });
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowResults(false);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/ai_match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('AI Analysis Failed');

            const data = await response.json();

            // Simulate "Processing" time for UX
            setTimeout(() => {
                setResults(data);
                setLoading(false);
                setShowResults(true);
            }, 2000);

        } catch (err) {
            setError('Failed to connect to AI server. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5"
            >
                <div className="d-inline-block p-2 rounded-circle bg-gradient-primary mb-3">
                    <span className="fs-1">🤖</span>
                </div>
                <h1 className="fw-bold mb-3">AI Influencer Matching</h1>
                <p className="text-muted lead">Let our AI find the perfect influencers for your campaign based on your specific criteria.</p>
            </motion.div>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <AnimatePresence mode='wait'>
                        {!showResults && !loading && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="card border-0 shadow-lg p-4"
                                style={{ backdropFilter: 'blur(20px)', background: 'rgba(30, 30, 30, 0.6)' }}
                            >
                                <form onSubmit={handleSearch}>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="form-label">Campaign Category</label>
                                            <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                                                <option value="">Select Category</option>
                                                <option value="Tech">Technology</option>
                                                <option value="Fashion">Fashion</option>
                                                <option value="Fitness">Fitness</option>
                                                <option value="Travel">Travel</option>
                                                <option value="Lifestyle">Lifestyle</option>
                                                <option value="Gaming">Gaming</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Target Audience</label>
                                            <input type="text" className="form-control" name="audience" placeholder="e.g. Gen Z, Tech Enthusiasts" value={formData.audience} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Budget Range ($)</label>
                                            <input type="number" className="form-control" name="budget" placeholder="e.g. 5000" value={formData.budget} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Platform</label>
                                            <select className="form-select" name="platform" value={formData.platform} onChange={handleChange}>
                                                <option value="Instagram">Instagram</option>
                                                <option value="YouTube">YouTube</option>
                                                <option value="TikTok">TikTok</option>
                                                <option value="LinkedIn">LinkedIn</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Location</label>
                                            <input type="text" className="form-control" name="location" placeholder="e.g. United States, Global" value={formData.location} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Min. Followers</label>
                                            <select className="form-select" name="followers" value={formData.followers} onChange={handleChange}>
                                                <option value="">Any</option>
                                                <option value="10k">10k+</option>
                                                <option value="50k">50k+</option>
                                                <option value="100k">100k+</option>
                                                <option value="1M">1M+</option>
                                            </select>
                                        </div>
                                        <div className="col-12 text-center mt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="submit"
                                                className="btn btn-primary btn-lg px-5 rounded-pill fw-bold shadow-lg"
                                                style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
                                            >
                                                ✨ Find Best Matches
                                            </motion.button>
                                        </div>
                                    </div>
                                    {error && <div className="text-danger text-center mt-3">{error}</div>}
                                </form>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-5"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 180, 360],
                                        borderRadius: ["20%", "50%", "20%"]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        margin: '0 auto',
                                        boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)'
                                    }}
                                />
                                <h3 className="mt-4 fw-bold">Analyzing Database...</h3>
                                <p className="text-muted">Our AI is scoring influencers using weighted algorithms.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {showResults && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-5"
                >
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold">Top AI Recommendations</h3>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowResults(false)}>Modify Search</button>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <h4>No perfect matches found.</h4>
                            <p>Try adjusting your criteria to be less specific.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {results.map((influencer, i) => (
                                <div className="col-md-4" key={influencer.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="card h-100 border-0 shadow-sm overflow-hidden"
                                        whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                    >
                                        <div className="position-relative overflow-hidden" style={{ height: '200px', background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
                                            <img
                                                src={influencer.image.includes('localhost') ? `${influencer.image}?t=${new Date().getTime()}` : influencer.image}
                                                alt={influencer.name}
                                                className="w-100 h-100 object-fit-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = `
                                                        <div class="w-100 h-100 d-flex align-items-center justify-content-center text-white fs-1 fw-bold" 
                                                             style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%)">
                                                            ${influencer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    `;
                                                }}
                                            />
                                            <div className="position-absolute top-0 end-0 m-3">
                                                <span className={`badge rounded-pill px-3 py-2 shadow ${influencer.matchScore > 80 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    {influencer.matchScore}% Match
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body text-center">
                                            <h5 className="fw-bold mb-1">{influencer.name}</h5>
                                            <p className="text-muted small mb-3">{influencer.handle}</p>

                                            {/* Match Score Progress Bar */}
                                            <div className="mb-3 px-3">
                                                <div className="d-flex justify-content-between small mb-1">
                                                    <span className="text-muted">AI Match Score</span>
                                                    <span className="fw-bold">{influencer.matchScore}/100</span>
                                                </div>
                                                <div className="progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                    <motion.div
                                                        className="progress-bar bg-gradient-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${influencer.matchScore}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
                                                <div className="text-center">
                                                    <div className="fw-bold">{influencer.formatted_followers}</div>
                                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>FOLLOWERS</div>
                                                </div>
                                                <div className="vr opacity-25"></div>
                                                <div className="text-center">
                                                    <div className="fw-bold">{influencer.engagement_rate}%</div>
                                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>ENGAGEMENT</div>
                                                </div>
                                                <div className="vr opacity-25"></div>
                                                <div className="text-center">
                                                    <div className="fw-bold">{influencer.location}</div>
                                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>LOCATION</div>
                                                </div>
                                            </div>

                                            <button
                                                className="btn btn-primary w-100 rounded-pill"
                                                onClick={() => {
                                                    if (influencer.url) {
                                                        window.open(influencer.url, '_blank', 'noopener,noreferrer');
                                                    } else if (influencer.platform && influencer.handle) {
                                                        const cleanHandle = influencer.handle.replace('@', '');
                                                        let baseUrl = '';
                                                        switch (influencer.platform.toLowerCase()) {
                                                            case 'instagram': baseUrl = 'https://instagram.com/'; break;
                                                            case 'twitter': baseUrl = 'https://twitter.com/'; break;
                                                            case 'tiktok': baseUrl = 'https://tiktok.com/@'; break;
                                                            case 'youtube': baseUrl = 'https://youtube.com/@'; break;
                                                            case 'linkedin': baseUrl = 'https://linkedin.com/in/'; break;
                                                            default: baseUrl = 'https://google.com/search?q='; break;
                                                        }
                                                        window.open(`${baseUrl}${cleanHandle}`, '_blank', 'noopener,noreferrer');
                                                    } else {
                                                        alert("External profile URL not provided by influencer.");
                                                    }
                                                }}
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default AIMatching;
