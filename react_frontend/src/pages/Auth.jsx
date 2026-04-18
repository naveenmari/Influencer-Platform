import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const Auth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(location.pathname === '/login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register State
    const [regData, setRegData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'brand'
    });

    useEffect(() => {
        setIsLogin(location.pathname === '/login');
        setError('');
    }, [location.pathname]);

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.profile_completed === true || user.profile_completed === undefined) {
                navigate('/dashboard');
            } else {
                navigate('/create-profile');
            }
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login({ email: email.trim(), password });
        if (!result.success) {
            setError(result.error || 'Login failed');
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register({ ...regData, email: regData.email.trim() });
        if (result.success) {
            const loginResult = await login({
                email: regData.email.trim(),
                password: regData.password
            });
            if (!loginResult.success) {
                setError('Registration successful, please login manually.');
                setIsLogin(true);
            }
        } else {
            setError(result.error || 'Registration failed');
        }
        setLoading(false);
    };

    const formVariants = {
        initial: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        animate: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        exit: (direction) => ({
            x: direction > 0 ? -100 : 100,
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2
            }
        })
    };

    return (
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
            <div className="auth-card-container position-relative" style={{ width: '100%', maxWidth: '450px' }}>

                {/* Background Glow */}
                <div className="position-absolute top-50 start-50 translate-middle" style={{
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                    zIndex: -1,
                    filter: 'blur(40px)'
                }} />

                <motion.div
                    className="card border-0 shadow-2xl overflow-hidden"
                    style={{
                        background: 'rgba(20, 20, 20, 0.7)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    layout
                >
                    <div className="card-body p-4 p-md-5">
                        <div className="text-center mb-5">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="d-inline-flex p-3 rounded-circle mb-3"
                                style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))' }}
                            >
                                <span className="fs-2">✨</span>
                            </motion.div>
                            <h2 className="fw-bold mb-2">
                                {isLogin ? 'Welcome Back' : 'Join the Elite'}
                            </h2>
                            <p className="text-muted small">
                                {isLogin ? 'Enter your details to continue' : 'Start your journey with us today'}
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="alert bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger small mb-4 text-center rounded-xl"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="position-relative" style={{ minHeight: isLogin ? '260px' : '360px' }}>
                            <AnimatePresence mode="wait" custom={isLogin ? -1 : 1}>
                                {isLogin ? (
                                    <motion.form
                                        key="login"
                                        custom={-1}
                                        variants={formVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        onSubmit={handleLogin}
                                        className="w-100"
                                    >
                                        <div className="mb-4">
                                            <div className="auth-input-group">
                                                <input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    className="auth-input"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                                <FiMail className="input-icon" />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="auth-input-group">
                                                <input
                                                    type="password"
                                                    placeholder="Password"
                                                    className="auth-input"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <FiLock className="input-icon" />
                                            </div>
                                            <div className="text-end mt-2">
                                                <Link to="/forgot-password" style={{ fontSize: '0.8rem' }} className="text-primary hover-glow">
                                                    Forgot Password?
                                                </Link>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary w-100 py-3 rounded-xl fw-bold d-flex align-items-center justify-content-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
                                        >
                                            {loading ? 'Authenticating...' : <>Sign In <FiArrowRight /></>}
                                        </motion.button>
                                    </motion.form>
                                ) : (
                                    <motion.form
                                        key="register"
                                        custom={1}
                                        variants={formVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        onSubmit={handleRegister}
                                        className="w-100"
                                    >
                                        <div className="mb-3">
                                            <div className="auth-input-group">
                                                <input
                                                    type="text"
                                                    placeholder="Username"
                                                    className="auth-input"
                                                    value={regData.username}
                                                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                                                    required
                                                />
                                                <FiUser className="input-icon" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="auth-input-group">
                                                <input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    className="auth-input"
                                                    value={regData.email}
                                                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                                                    required
                                                />
                                                <FiMail className="input-icon" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="auth-input-group">
                                                <input
                                                    type="password"
                                                    placeholder="Create Password"
                                                    className="auth-input"
                                                    value={regData.password}
                                                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                                                    required
                                                />
                                                <FiLock className="input-icon" />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="text-muted small mb-2 d-block px-1">I am a...</label>
                                            <div className="d-flex gap-2">
                                                {['brand', 'influencer'].map((role) => (
                                                    <div
                                                        key={role}
                                                        onClick={() => setRegData({ ...regData, role })}
                                                        className={`flex-fill p-2 rounded-lg text-center cursor-pointer transition-all border d-flex align-items-center justify-content-center gap-1 ${regData.role === role ? 'border-primary bg-primary bg-opacity-10 text-primary' : 'border-white border-opacity-10 text-muted'}`}
                                                        style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                                                    >
                                                        {regData.role === role && <FiCheckCircle size={14} />} {role}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary w-100 py-3 rounded-xl fw-bold d-flex align-items-center justify-content-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
                                        >
                                            {loading ? 'Creating Account...' : <>Create Account <FiArrowRight /></>}
                                        </motion.button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="text-center mt-3 pt-3 border-top border-white border-opacity-5">
                            <p className="text-muted small">
                                {isLogin ? "Don't have an account?" : "Already a member?"}
                                <Link
                                    to={isLogin ? "/register" : "/login"}
                                    className="ms-2 text-primary fw-bold text-decoration-none hover-glow"
                                >
                                    {isLogin ? "Join Now" : "Sign In"}
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .rounded-xl { border-radius: 16px; }
                .rounded-lg { border-radius: 12px; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                
                .auth-input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: rgba(255, 255, 255, 0.4);
                    transition: color 0.3s ease;
                    pointer-events: none;
                    z-index: 2;
                }
                
                .auth-input {
                    width: 100%;
                    padding: 14px 16px 14px 44px;
                    background: rgba(40, 40, 40, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    color: white;
                    outline: none;
                    transition: all 0.3s ease;
                }
                
                /* Override browser autofill background */
                .auth-input:-webkit-autofill,
                .auth-input:-webkit-autofill:hover, 
                .auth-input:-webkit-autofill:focus, 
                .auth-input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px #2a2a2a inset !important;
                    -webkit-text-fill-color: white !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                
                .auth-input:focus {
                    background: rgba(50, 50, 50, 0.6);
                    border-color: rgba(99, 102, 241, 0.5);
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
                }
                
                .auth-input:focus + .input-icon,
                .auth-input:-webkit-autofill + .input-icon {
                    color: #6366f1;
                }
                
                .hover-glow:hover {
                    text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
                    opacity: 0.9;
                }
                
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default Auth;
