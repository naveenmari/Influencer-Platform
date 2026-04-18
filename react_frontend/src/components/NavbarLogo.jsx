import React from 'react';
import { Link } from 'react-router-dom';
import './NavbarLogo.css';

const NavbarLogo = () => {
    return (
        <Link to="/" className="navbar-logo-container">
            <div className="logo-ring">
                <div className="logo-frame">
                    <img
                        src="/logo.png"
                        alt="Influencer Connect Logo"
                        className="logo-img"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            </div>
            <span className="brand-text-modern">Influencer Connect</span>
        </Link>
    );
};

export default NavbarLogo;
