import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { API_URL } from '../config';

const Billing = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchInvoices();
        }
    }, [user]);

    const fetchInvoices = async () => {
        try {
            const res = await fetch(`${API_URL}/api/invoices?user_id=${user.id}&role=${user.role}`);
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (invoiceId) => {
        try {
            const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/pay`, { method: 'PUT' });
            if (res.ok) {
                alert('Payment Successful!');
                fetchInvoices();
            }
        } catch (err) {
            alert('Failed to process payment');
        }
    };

    if (!user) return <div className="container mt-5 pt-5 text-white">Please login to view billing.</div>;

    const isBrand = user.role === 'brand';

    return (
        <div className="container mt-5 pt-5 pb-5">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="display-5 fw-bold text-white mb-4"
            >
                {isBrand ? 'Financials & Invoices' : 'Earnings Dashboard'}
            </motion.h1>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card glass-card border-0 p-4"
            >
                {loading ? (
                    <div className="text-center text-white p-5"><div className="spinner-border"></div></div>
                ) : invoices.length === 0 ? (
                    <div className="text-center text-white-50 p-5">
                        <FiDollarSign size={48} className="mb-3 opacity-50" />
                        <h5>No financial records found.</h5>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Campaign</th>
                                    <th>{isBrand ? 'Influencer' : 'Brand'}</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>{isBrand && 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(inv => (
                                    <tr key={inv.id}>
                                        <td>#{inv.id}</td>
                                        <td>{inv.campaign_title}</td>
                                        <td>{isBrand ? inv.influencer_name : inv.brand_name}</td>
                                        <td className="fw-bold text-success">${inv.amount}</td>
                                        <td>
                                            {inv.status === 'paid' ? (
                                                <span className="badge bg-success"><FiCheckCircle /> Paid</span>
                                            ) : (
                                                <span className="badge bg-warning text-dark"><FiClock /> Pending</span>
                                            )}
                                        </td>
                                        <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td>
                                            {isBrand && inv.status === 'pending' && (
                                                <button onClick={() => handlePay(inv.id)} className="btn btn-sm btn-primary">
                                                    Pay Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Billing;
