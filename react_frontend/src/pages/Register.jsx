import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth(); // Get register function
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'brand'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register(formData); // Use register from context

        if (result.success) {
            // Auto-login after successful registration
            const loginResult = await login({
                email: formData.email,
                password: formData.password
            });

            if (loginResult.success) {
                // Redirect to create profile page as new users won't have a profile yet
                navigate('/create-profile');
            } else {
                // Fallback to login page if auto-login fails for some reason
                setError('Registration successful, but auto-login failed. Please log in manually.');
                setTimeout(() => navigate('/login'), 2000);
            }
        } else {
            setError(result.error || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <motion.div
                className="card border-0 shadow-lg"
                style={{ width: '100%', maxWidth: '500px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="card-body p-5">
                    <h2 className="text-center mb-4 fw-bold">Create Account</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-12 mb-3">
                                <label className="form-label">I am a...</label>
                                <select
                                    name="role"
                                    className="form-select"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="brand">Brand (I want to hire)</option>
                                    <option value="influencer">Influencer (I want to work)</option>
                                </select>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn btn-primary w-100 mb-3"
                        >
                            Get Started
                        </motion.button>
                        <div className="text-center">
                            <Link to="/login" className="text-decoration-none text-muted small">
                                Already have an account? Log in
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
