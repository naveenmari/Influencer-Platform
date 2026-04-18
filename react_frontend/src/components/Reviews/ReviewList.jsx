import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { API_URL } from '../../config';

const ReviewList = ({ influencerId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${API_URL}/api/influencers/${influencerId}/reviews`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                } else {
                    setError('Failed to fetch reviews');
                }
            } catch (err) {
                setError('Network error getting reviews');
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [influencerId]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-4">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-danger p-3 text-center">{error}</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="p-4 text-center mt-3 empty-state-box">
                <p className="text-white-50 mb-0">No reviews yet for this influencer.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 pb-2">
            <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                <FiStar className="text-warning" /> 
                Brand Reviews ({reviews.length})
            </h5>
            
            <div className="d-flex flex-column gap-3">
                <AnimatePresence>
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="review-item p-3"
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="brand-logo shadow-sm d-flex align-items-center justify-content-center fw-bold bg-gradient-primary">
                                       {review.company_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="fw-bold text-white small">{review.company_name}</div>
                                        <div className="text-white-50 xx-small">{new Date(review.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="d-flex text-warning">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <FiStar key={i} size={14} fill={i < review.rating ? '#f59e0b' : 'transparent'} color={i < review.rating ? '#f59e0b' : 'rgba(255,255,255,0.2)'} />
                                    ))}
                                </div>
                            </div>
                            
                            {review.feedback && (
                                <p className="review-feedback text-white-75 mb-0 small lh-base">
                                    "{review.feedback}"
                                </p>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <style>{`
                .review-item {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                .review-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .brand-logo {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    color: white;
                }
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
                }
                .xx-small {
                    font-size: 0.65rem;
                }
                .review-feedback {
                    margin-top: 10px;
                    padding-left: 40px;
                    font-style: italic;
                }
                .empty-state-box {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                }
            `}</style>
        </div>
    );
};

export default ReviewList;
