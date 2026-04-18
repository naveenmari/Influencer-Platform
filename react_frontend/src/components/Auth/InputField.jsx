import React from 'react';
import { motion } from 'framer-motion';
import styles from './Auth.module.css';

const InputField = ({ label, type = 'text', value, onChange, name, delay = 0 }) => {
    return (
        <motion.div
            className={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={styles.input}
                placeholder=" "
                required
            />
            <label className={styles.label}>{label}</label>
            <div className={styles.underline}></div>
        </motion.div>
    );
};

export default InputField;
