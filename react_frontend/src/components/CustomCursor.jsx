import React, { useState, useEffect, useRef } from 'react';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const moveMouse = (e) => {
            if (cursorRef.current) {
                cursorRef.current.style.setProperty('--x', `${e.clientX}px`);
                cursorRef.current.style.setProperty('--y', `${e.clientY}px`);
            }
            if (dotRef.current) {
                dotRef.current.style.setProperty('--x', `${e.clientX}px`);
                dotRef.current.style.setProperty('--y', `${e.clientY}px`);
            }
            if (!isVisible) setIsVisible(true);
        };

        const handleHover = (e) => {
            const target = e.target;
            const isClickable =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                (target.style && target.style.cursor === 'pointer') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovering(isClickable);
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mouseover', handleHover);

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mouseover', handleHover);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <>
            <div
                ref={cursorRef}
                className={`cursor-ring ${isHovering ? 'is-hovering' : ''}`}
            />

            <div
                ref={dotRef}
                className="cursor-dot"
            />

            <style>{`
                :root {
                    --x: 0px;
                    --y: 0px;
                }
                .cursor-ring {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 32px;
                    height: 32px;
                    border: 1.5px solid rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    transform: translate3d(calc(var(--x) - 16px), calc(var(--y) - 16px), 0);
                    transition: width 0.25s cubic-bezier(0.23, 1, 0.32, 1), 
                                height 0.25s cubic-bezier(0.23, 1, 0.32, 1), 
                                background 0.25s ease, 
                                border-color 0.25s ease,
                                border-width 0.25s ease;
                    will-change: transform;
                }
                .cursor-ring.is-hovering {
                    width: 56px;
                    height: 56px;
                    transform: translate3d(calc(var(--x) - 28px), calc(var(--y) - 28px), 0);
                    background: rgba(99, 102, 241, 0.1);
                    border-color: #6366f1;
                    border-width: 2px;
                }
                .cursor-dot {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 6px;
                    height: 6px;
                    background: #6366f1;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    transform: translate3d(calc(var(--x) - 3px), calc(var(--y) - 3px), 0);
                    transition: transform 0.05s linear; /* Minimal transition for maximum snappiness */
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
                    will-change: transform;
                }
                @media (max-width: 991px) {
                    .cursor-ring, .cursor-dot {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
};

export default CustomCursor;
