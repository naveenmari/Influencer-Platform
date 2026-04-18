import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { user, login } = useAuth(); // Get user and login function
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            // Default to dashboard if profile_completed is undefined (backward compatibility)
            if (user.profile_completed === true || user.profile_completed === undefined) {
                navigate('/dashboard');
            } else {
                navigate('/create-profile');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login({ email, password });

        if (!result.success) {
            setError(result.error || 'Login failed');
            setLoading(false);
        }
        // If success, the useEffect will handle navigation when 'user' state updates
    };

    return (
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <motion.div
                className="card border-0 shadow-lg"
                style={{ widt: '100%', maxWidth: '400px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="card-body p-5">
                    <h2 className="text-center mb-4 fw-bold">Welcome Back</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control form-control-lg"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label mb-0">Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.85rem' }} className="text-decoration-none text-primary">
                                    Forgot Password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                className="form-control form-control-lg"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn btn-primary btn-lg w-100 mb-3"
                        >
                            Sign In
                        </motion.button>
                        <div className="text-center">
                            <Link to="/register" className="text-decoration-none text-muted small">
                                Don't have an account? Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
