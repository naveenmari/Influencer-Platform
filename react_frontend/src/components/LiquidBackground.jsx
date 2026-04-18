import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import './LiquidBackground.css';

const LiquidBackground = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    // Large organic blobs matching the reference colors
    const blobs = [
        { color: '#A60707', size: '100vw', duration: 30, x: [-20, 30], y: [-10, 20] }, // Deep Red
        { color: '#FFFFFF', size: '70vw', duration: 25, x: [50, 20], y: [10, 60] },   // White
        { color: '#000000', size: '120vw', duration: 35, x: [10, 80], y: [40, -10] }, // Black/Negative space
        { color: '#5C0101', size: '110vw', duration: 40, x: [-40, 10], y: [30, 70] }, // Darker Red
    ];

    return (
        <div className={`liquid-container fixed-top ${!isHome ? 'is-blurry' : ''}`} style={{ position: 'fixed', zIndex: -1 }}>
            <div className="blobs-group">
                {blobs.map((blob, i) => (
                    <motion.div
                        key={i}
                        className="liquid-blob"
                        animate={{
                            x: blob.x.map(v => `${v}vw`),
                            y: blob.y.map(v => `${v}vh`),
                            scale: [1, 1.2, 0.9, 1.1, 1],
                        }}
                        transition={{
                            duration: blob.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{
                            backgroundColor: blob.color,
                            width: blob.size,
                            height: blob.size,
                            opacity: blob.color === '#FFFFFF' ? 0.2 : 0.6,
                        }}
                    />
                ))}
            </div>

            <div className="liquid-blur-overlay"></div>
            <div className="liquid-noise"></div>

            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -18"
                            result="sharp"
                        />
                        <feComposite in="SourceGraphic" in2="sharp" operator="atop" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
};

export default LiquidBackground;
