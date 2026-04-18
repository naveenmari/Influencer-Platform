import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import InfluencerCard from './InfluencerCard';

const InfluencerSlider = ({ influencers }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);

    if (!influencers || influencers.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % influencers.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + influencers.length) % influencers.length);
    };

    return (
        <div className="influencer-slider-container position-relative py-5">
            <div className="slider-header d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h3 className="text-white fw-bold mb-0">Top Creators</h3>
                    <p className="text-white-50 small">Recommended influencers for your campaign</p>
                </div>
                <div className="slider-controls d-flex gap-2">
                    <button onClick={prevSlide} className="btn-nav">
                        <FiChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="btn-nav">
                        <FiChevronRight size={24} />
                    </button>
                </div>
            </div>

            <div className="slider-viewport" ref={containerRef}>
                <motion.div
                    className="slider-track"
                    animate={{ x: `calc(50% - ${currentIndex * 340 + 160}px)` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {influencers.map((inf, index) => (
                        <InfluencerCard
                            key={inf.id}
                            influencer={inf}
                            isCenter={index === currentIndex}
                        />
                    ))}
                </motion.div>
            </div>

            <style>{`
                .influencer-slider-container {
                    overflow: hidden;
                    width: 100%;
                }
                .slider-viewport {
                    overflow: visible;
                    width: 100%;
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }
                .slider-track {
                    display: flex;
                    gap: 20px;
                    padding: 20px 0;
                }
                .btn-nav {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .btn-nav:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #6366f1;
                    color: #6366f1;
                    transform: scale(1.1);
                }
                @media (max-width: 768px) {
                    .slider-track {
                        gap: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default InfluencerSlider;
