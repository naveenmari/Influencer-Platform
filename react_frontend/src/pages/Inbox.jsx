import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Inbox = () => {
    const { user: authUser } = useAuth();
    const location = useLocation();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const hasCheckedState = useRef(false);

    useEffect(() => {
        if (!authUser) return;
        fetchContacts();
    }, [authUser]);

    useEffect(() => {
        if (authUser && location.state?.recipient && !hasCheckedState.current) {
            const recipient = location.state.recipient;
            setContacts(prev => {
                const existing = prev.find(c => c.id === recipient.id);
                if (existing) {
                    setSelectedContact(existing);
                    return prev;
                } else {
                    setSelectedContact(recipient);
                    return [recipient, ...prev];
                }
            });
            hasCheckedState.current = true;
        }
    }, [authUser, location.state]);

    useEffect(() => {
        if (selectedContact) {
            fetchMessages();
            // Polling for demo purposes
            const idx = setInterval(fetchMessages, 3000);
            return () => clearInterval(idx);
        }
    }, [selectedContact]);

    const scrollToBottom = (behavior = 'smooth') => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior });
        }, 100);
    };

    useEffect(() => {
        if (selectedContact) {
            scrollToBottom('auto'); // Jump to bottom for new chat
        }
    }, [selectedContact]);

    const fetchContacts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/inbox?user_id=${authUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (err) { console.error(err); }
    };

    const fetchMessages = async () => {
        if (!selectedContact) return;
        try {
            const res = await fetch(`${API_URL}/api/messages/history?user_id=${authUser.id}&contact_id=${selectedContact.id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const res = await fetch(`${API_URL}/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: authUser.id,
                    receiver_id: selectedContact.id,
                    content: newMessage
                })
            });
            if (res.ok) {
                setNewMessage('');
                fetchMessages();
                scrollToBottom(); // Scroll only after user sends a message
            }
        } catch (err) { console.error(err); }
    };

    if (!authUser) return (
        <div className="container mt-5 pt-5 text-center text-white">
            <h2>Please login to view messages.</h2>
        </div>
    );

    return (
        <div className="container mt-5 pt-5 pb-5">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="row g-4"
                style={{ height: '75vh' }}
            >
                {/* Contacts List */}
                <div className="col-md-4">
                    <div className="card glass-card h-100 border-0 p-3">
                        <h4 className="text-white mb-4 d-flex align-items-center gap-2">
                            <FiMessageSquare /> Inbox
                        </h4>
                        <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
                            {contacts.length === 0 ? (
                                <div className="text-muted text-center mt-4">No recent messages. Start a conversation from a Campaign!</div>
                            ) : contacts.map(contact => (
                                <div 
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`p-3 rounded align-items-center cursor-pointer ${selectedContact?.id === contact.id ? 'bg-primary bg-opacity-25 border border-primary border-opacity-50' : 'border border-white border-opacity-10'}`}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="avatar-circle flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                            {contact.profile_pic_url ? (
                                                <img src={`${API_URL}${contact.profile_pic_url}`} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                                                    <FiUser />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-white">
                                            <div className="fw-bold">{contact.username}</div>
                                            <div className="small text-white-50 text-capitalize">{contact.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-md-8">
                    <div className="card glass-card h-100 border-0 d-flex flex-column">
                        {selectedContact ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-bottom border-white border-opacity-10">
                                    <h5 className="text-white m-0 d-flex align-items-center gap-2">
                                        Chat with {selectedContact.username}
                                    </h5>
                                </div>
                                
                                {/* Messages Area */}
                                <div className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3">
                                    {messages.map(msg => {
                                        const isSender = msg.sender_id === authUser.id;
                                        return (
                                            <motion.div 
                                                key={msg.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`d-flex flex-column ${isSender ? 'align-items-end' : 'align-items-start'}`}
                                            >
                                                <div 
                                                    className={`p-3 rounded-4 max-w-75 ${isSender ? 'bg-primary text-white' : 'bg-dark bg-opacity-50 text-white border border-white border-opacity-10'}`}
                                                    style={{ borderBottomRightRadius: isSender ? '4px' : '16px', borderBottomLeftRadius: isSender ? '16px' : '4px' }}
                                                >
                                                    {msg.content}
                                                </div>
                                                <small className="text-white-50 mt-1" style={{ fontSize: '0.7rem' }}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </small>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 border-top border-white border-opacity-10">
                                    <form onSubmit={handleSendMessage} className="d-flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="form-control bg-dark bg-opacity-50 border-white border-opacity-10 text-white shadow-none"
                                        />
                                        <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center px-4" disabled={!newMessage.trim()}>
                                            <FiSend />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex w-100 h-100 align-items-center justify-content-center text-white-50 flex-column gap-3">
                                <FiMessageSquare size={48} className="opacity-50" />
                                <p>Select a contact to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Inbox;
