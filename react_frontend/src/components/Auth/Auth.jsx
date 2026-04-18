import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Auth.module.css';
import InputField from './InputField';
import AuthButton from './AuthButton';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
    });

    const toggleAuth = () => setIsLogin(!isLogin);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(isLogin ? 'Logging in...' : 'Signing up...', formData);
    };

    return (
        <div className={styles.authContainer}>
            {/* Background Animated Shapes */}
            <div className={styles.backgroundShapes}>
                <motion.div
                    className={styles.shape}
                    style={{ width: 400, height: 400, top: '-10%', left: '-5%' }}
                    animate={{
                        rotate: [0, 90, 0],
                        scale: [1, 1.2, 1],
                        skew: [0, 10, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className={styles.shape}
                    style={{ width: 300, height: 300, bottom: '10%', right: '5%' }}
                    animate={{
                        rotate: [0, -90, 0],
                        scale: [1.2, 1, 1.2],
                        skew: [0, -10, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <motion.div
                className={styles.authWrapper}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <motion.div
                            key="login"
                            className={styles.panel + ' ' + styles.formPanel}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <h1 className={styles.title}>Welcome Back</h1>
                            <p className={styles.subtitle}>Enter your details to access your account</p>

                            <form onSubmit={handleSubmit}>
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    delay={0.1}
                                />
                                <InputField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    delay={0.2}
                                />
                                <AuthButton type="submit" delay={0.3}>Sign In</AuthButton>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="signup"
                            className={styles.panel + ' ' + styles.formPanel}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <h1 className={styles.title}>Join The Future</h1>
                            <p className={styles.subtitle}>Create an account to get started</p>

                            <form onSubmit={handleSubmit}>
                                <InputField
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    delay={0.1}
                                />
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    delay={0.2}
                                />
                                <InputField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    delay={0.3}
                                />
                                <AuthButton type="submit" delay={0.4}>Sign Up</AuthButton>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div className={styles.panel + ' ' + styles.welcomePanel}>
                    <h2 className={styles.title}>{isLogin ? "New Here?" : "Coming Back?"}</h2>
                    <p className={styles.subtitle}>
                        {isLogin
                            ? "Join us today and explore the futuristic experience."
                            : "Login now to continue your journey where you left off."}
                    </p>
                    <button className={styles.toggleBtn} onClick={toggleAuth}>
                        {isLogin ? "Create Account" : "Sign In"}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Auth;
