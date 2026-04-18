import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000); // Check every 10s
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_URL}/api/notifications?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAsRead = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PUT' });
            if (res.ok) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            }
        } catch (err) {
            console.error('Failed to mark notification as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="position-relative mx-2 d-flex align-items-center">
            <div 
                className="text-white position-relative"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', display: 'inline-block' }}
            >
                <FiBell size={22} />
                {unreadCount > 0 && (
                    <span 
                        className="position-absolute badge rounded-circle bg-danger d-flex align-items-center justify-content-center" 
                        style={{ 
                            fontSize: '0.65rem', 
                            top: '-4px', 
                            right: '-6px',
                            minWidth: '16px',
                            height: '16px',
                            padding: '0'
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="position-absolute shadow-lg border-0"
                        style={{ 
                            width: '320px', 
                            zIndex: 1050, 
                            top: 'calc(100% + 12px)',
                            right: '-10px',
                            background: 'rgba(15,15,16,0.98)', 
                            backdropFilter: 'blur(25px)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px'
                        }}
                    >
                        <div className="card-header border-bottom border-white border-opacity-10 px-4 py-3 bg-transparent">
                            <h6 className="mb-0 text-white fw-bold d-flex justify-content-between align-items-center">
                                Notifications {unreadCount > 0 && <span className="badge bg-primary text-white">{unreadCount} New</span>}
                            </h6>
                        </div>
                        <div className="card-body p-0 overflow-auto" style={{ maxHeight: '350px' }}>
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-white-50">No notifications yet.</div>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {notifications.map(n => (
                                        <li key={n.id} className={`list-group-item bg-transparent border-bottom border-white border-opacity-10 py-3 ${!n.is_read ? 'bg-primary bg-opacity-10' : ''}`}>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className={`mb-1 small ${!n.is_read ? 'text-white fw-bold' : 'text-white-50'}`}>{n.title}</h6>
                                                    <p className="mb-1 text-white-50" style={{ fontSize: '0.8rem' }}>{n.message}</p>
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(n.created_at).toLocaleString()}</small>
                                                </div>
                                                {!n.is_read && (
                                                    <button onClick={() => markAsRead(n.id)} className="btn btn-sm btn-link text-primary p-0" title="Mark as read">
                                                        <FiCheck />
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1040 }} onClick={() => setIsOpen(false)}></div>}
        </div>
    );
};

export default NotificationDropdown;
