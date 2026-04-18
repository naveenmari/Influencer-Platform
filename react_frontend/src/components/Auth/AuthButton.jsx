import React from 'react';
import { motion } from 'framer-motion';
import styles from './Auth.module.css';

const AuthButton = ({ children, onClick, type = 'button', delay = 0 }) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            className={styles.submitBtn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.button>
    );
};

export default AuthButton;
