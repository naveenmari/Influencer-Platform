import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import NavbarLogo from '../components/NavbarLogo';
import NotificationDropdown from '../components/NotificationDropdown';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close nav on route change
    useEffect(() => {
        setIsNavOpen(false);
    }, [location]);

    return (
        <nav className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <div className="d-flex align-items-center gap-3">
                    {location.pathname !== '/' && (
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-link text-white text-decoration-none p-0 d-flex align-items-center border-0 shadow-none"
                            aria-label="Go Back"
                        >
                            <FiArrowLeft size={22} />
                        </button>
                    )}
                    <NavbarLogo />
                </div>
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/rankings' ? 'active' : ''}`} to="/rankings">Rankings</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`} to="/search">Discover</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/matches' ? 'active' : ''}`} to="/matches">AI Match</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/trends' ? 'active' : ''}`} to="/trends">Trends</Link>
                        </li>
                        {user && user.role === 'admin' && (
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} to="/admin">Admin</Link>
                            </li>
                        )}
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">Dashboard</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/inbox' ? 'active' : ''}`} to="/inbox">Inbox</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/billing' ? 'active' : ''}`} to="/billing">Billing</Link>
                                </li>
                                <li className="nav-item d-flex align-items-center justify-content-center">
                                    <NotificationDropdown />
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link bg-transparent border-0" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`} to="/register">Join</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
