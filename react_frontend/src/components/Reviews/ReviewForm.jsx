import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiX, FiCheck } from 'react-icons/fi';
import { API_URL } from '../../config';

const ReviewForm = ({ influencerId, brandId, campaignId, onClose, onSubmitSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    influencer_id: influencerId,
                    brand_id: brandId,
                    campaign_id: campaignId,
                    rating,
                    feedback
                })
            });

            const data = await response.json();
            if (response.ok) {
                if (onSubmitSuccess) onSubmitSuccess(data);
                if (onClose) onClose();
            } else {
                setError(data.error || 'Failed to submit review');
            }
        } catch (err) {
            setError('Network error. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="review-form-container p-4 rounded-4"
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="text-white fw-bold mb-0">Rate the Influencer</h4>
                    {onClose && (
                        <button onClick={onClose} className="btn btn-icon text-white-50 p-0 border-0 bg-transparent">
                            <FiX size={24} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-white-50 small text-uppercase letter-spacing-1 mb-2 d-block">Overall Experience</label>
                        <div className="d-flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.div
                                    key={star}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FiStar
                                        size={32}
                                        fill={(hoverRating || rating) >= star ? '#f59e0b' : 'transparent'}
                                        color={(hoverRating || rating) >= star ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-white-50 small text-uppercase letter-spacing-1 mb-2 d-block">Feedback (Optional)</label>
                        <textarea
                            className="form-control glass-input"
                            rows="4"
                            placeholder="Share your collaboration experience..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>

                    {error && <div className="text-danger small mb-3">{error}</div>}

                    <div className="d-flex justify-content-end gap-2">
                        {onClose && (
                            <button type="button" className="btn btn-dark-soft px-4 py-2" onClick={onClose}>
                                Cancel
                            </button>
                        )}
                        <button type="submit" disabled={isSubmitting || rating === 0} className="btn btn-indigo px-4 py-2 d-flex align-items-center gap-2">
                            {isSubmitting ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <FiCheck />
                            )}
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>

                <style>{`
                    .review-form-container {
                        background: rgba(15, 15, 16, 0.85);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                        max-width: 500px;
                        width: 100%;
                    }
                    .glass-input {
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: white;
                        border-radius: 12px;
                        padding: 12px;
                        transition: all 0.3s ease;
                    }
                    .glass-input:focus {
                        background: rgba(255, 255, 255, 0.08);
                        border-color: rgba(99, 102, 241, 0.5);
                        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                        color: white;
                        outline: none;
                    }
                    .glass-input::placeholder {
                        color: rgba(255, 255, 255, 0.3);
                    }
                    .btn-indigo {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        color: white;
                        border-radius: 12px;
                        font-weight: 600;
                        border: none;
                    }
                    .btn-dark-soft {
                        background: rgba(255, 255, 255, 0.08);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        color: white;
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReviewForm;
