import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/Reviews/ReviewForm';
import BrandReviewForm from '../components/Reviews/BrandReviewForm';
import ContentDrafts from '../components/ContentDrafts';
import { API_URL } from '../config';

const CampaignDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requests, setRequests] = useState([]);
    const [reviewingInfluencer, setReviewingInfluencer] = useState(null);
    const [reviewingBrand, setReviewingBrand] = useState(false);
    const [messagingUser, setMessagingUser] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceAmount, setInvoiceAmount] = useState('');

    const handleGenerateInvoice = async (e) => {
        e.preventDefault();
        try {
             const res = await fetch(`${API_URL}/api/invoices', {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({
                     campaign_id: id,
                     brand_id: campaign.brand_user_id,
                     influencer_id: user.id,
                     amount: parseFloat(invoiceAmount)
                 })
             });
             if (res.ok) {
                 alert('Invoice generated and sent to the brand!');
                 setShowInvoiceModal(false);
                 setInvoiceAmount('');
             } else {
                 alert('Failed to generate invoice.');
             }
        } catch(err) {
            alert('Network Error');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sender_id: user.id, 
                    receiver_id: messagingUser.id, 
                    content: messageContent 
                })
            });
            if (res.ok) {
                alert('Message sent successfully! Check your Inbox to continue the conversation.');
                setMessagingUser(null);
                setMessageContent('');
            } else {
                alert('Failed to send message.');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`${API_URL}/api/campaigns/${id}${user ? `?user_id=${user.id}` : ''}`);
                const data = await response.json();

                if (response.ok) {
                    setCampaign(data);

                    // If user is the brand owner, fetch requests
                    if (user && user.id === data.brand_user_id) {
                        const reqResponse = await fetch(`${API_URL}/api/campaigns/${id}/requests`);
                        if (reqResponse.ok) {
                            const reqData = await reqResponse.json();
                            setRequests(reqData);
                        }
                    }
                } else {
                    setError(data.error || 'Failed to load campaign');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    navigate('/dashboard');
                } else {
                    alert('Failed to delete campaign');
                }
            } catch (err) {
                alert('Network error');
            }
        }
    };

    const handleApply = async () => {
        try {
            const response = await fetch(`${API_URL}/api/ad_requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_id: id,
                    user_id: user.id
                })
            });

            if (response.ok) {
                alert('Application submitted successfully!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to apply');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            const response = await fetch(`${API_URL}/api/ad_requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Update local state
                setRequests(requests.map(req =>
                    req.id === requestId ? { ...req, status } : req
                ));
            } else {
                alert('Failed to update request');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    if (loading) return <div className="container py-5 text-center">Loading...</div>;
    if (error) return <div className="container py-5 text-center text-danger">Error: {error}</div>;
    if (!campaign) return <div className="container py-5 text-center">Campaign not found</div>;

    const isInfluencer = user?.role === 'influencer';

    return (
        <div className="container py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-0 shadow-sm"
            >
                <div className="card-body p-5">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">{campaign.company_name} • {campaign.industry}</h6>
                            <h1 className="display-5 fw-bold mb-0">{campaign.title}</h1>
                        </div>
                        <span className="badge bg-success fs-6 px-3 py-2">{campaign.status}</span>
                    </div>

                    <div className="row mb-5">
                        <div className="col-md-8">
                            <h5 className="fw-bold">Description</h5>
                            <p className="lead fs-6 text-secondary">{campaign.description}</p>
                        </div>
                        <div className="col-md-4">
                            <div className="bg-light p-4 rounded-3">
                                <h5 className="fw-bold mb-3">Campaign Info</h5>
                                <ul className="list-unstyled mb-0">
                                    <li className="mb-2"><strong>Budget:</strong> {campaign.budget}</li>
                                    <li className="mb-2"><strong>Target Platform:</strong> {campaign.target_platform}</li>
                                    <li className="mb-2"><strong>Start Date:</strong> {campaign.start_date}</li>
                                    <li className="mb-2"><strong>End Date:</strong> {campaign.end_date}</li>
                                    <li><strong>Visibility:</strong> {campaign.visibility}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-3 border-top pt-4">
                        <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/dashboard')}>
                            &larr; Back to Dashboard
                        </button>
                        {user?.role === 'influencer' && (
                            <>
                                <button className="btn btn-primary px-4" onClick={handleApply}>
                                    Apply Now
                                </button>
                                <button className="btn btn-outline-info px-4" onClick={() => setReviewingBrand(true)}>
                                    Rate Brand
                                </button>
                                <button className="btn btn-outline-primary px-4" onClick={() => setMessagingUser({ id: campaign.brand_user_id, name: campaign.company_name })}>
                                    Message Brand
                                </button>
                                {campaign.application_status === 'accepted' && (
                                    campaign.payment_status === 'paid' ? (
                                        <button className="btn btn-secondary px-4" disabled>
                                            Paid
                                        </button>
                                    ) : (
                                        <button className="btn btn-success px-4" onClick={() => setShowInvoiceModal(true)}>
                                            Bill Brand
                                        </button>
                                    )
                                )}
                            </>
                        )}
                        {user?.id === campaign.brand_user_id && (
                            <div className="d-flex gap-2">
                                <Link to={`/campaigns/edit/${id}`} className="btn btn-warning px-4">
                                    Edit
                                </Link>
                                <button className="btn btn-danger px-4" onClick={handleDelete}>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                    {user?.id === campaign.brand_user_id && (
                        <div className="mt-5">
                            <h3 className="fw-bold mb-4">Ad Requests ({requests.length})</h3>
                            {requests.length === 0 ? (
                                <p className="text-muted">No requests yet.</p>
                            ) : (
                                <div className="list-group">
                                    {requests.map(req => (
                                        <div key={req.id} className="list-group-item p-4 d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="mb-1">{req.username} <small className="text-muted">({req.category})</small></h5>
                                                <p className="mb-1">Platform: {req.platform_name} • Followers: {req.platform_followers}</p>
                                                <small className="text-muted">Status: <span className={`badge ${req.status === 'accepted' ? 'bg-success' : req.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>{req.status}</span></small>
                                            </div>
                                            {req.status === 'pending' && (
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-success btn-sm" onClick={() => handleRequestAction(req.id, 'accepted')}>Accept</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleRequestAction(req.id, 'rejected')}>Reject</button>
                                                </div>
                                            )}
                                            {req.status === 'accepted' && (
                                                 <div className="d-flex gap-2">
                                                     <button className="btn btn-outline-warning btn-sm" onClick={() => setReviewingInfluencer(req.influencer_id)}>
                                                         Rate Influencer
                                                     </button>
                                                     <button className="btn btn-outline-primary btn-sm" onClick={() => setMessagingUser({ id: req.user_id, name: req.username })}>
                                                         Message
                                                     </button>
                                                 </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Drafts Workflows */}
                {(user?.role === 'influencer' || user?.id === campaign.brand_user_id) && (
                    <div className="card-body p-5 pt-0 mt-0">
                        <ContentDrafts campaignId={id} user={user} isBrand={user?.id === campaign.brand_user_id} />
                    </div>
                )}
            </motion.div>

            {/* Review Modal */}
            {reviewingInfluencer && (
                <>
                    <div className="modal-backdrop bg-dark" style={{ opacity: 0.8, zIndex: 1040 }} onClick={() => setReviewingInfluencer(null)}></div>
                    <div className="position-fixed top-50 start-50 translate-middle w-100 px-3" style={{ maxWidth: '500px', zIndex: 1050 }}>
                        <ReviewForm 
                            influencerId={reviewingInfluencer}
                            brandId={campaign.brand_id}
                            campaignId={campaign.id}
                            onClose={() => setReviewingInfluencer(null)}
                            onSubmitSuccess={() => {
                                alert('Review submitted successfully!');
                                setReviewingInfluencer(null);
                            }}
                        />
                    </div>
                </>
            )}
            {/* Brand Review Modal */}
            {reviewingBrand && (
                <>
                    <div className="modal-backdrop bg-dark" style={{ opacity: 0.8, zIndex: 1040 }} onClick={() => setReviewingBrand(false)}></div>
                    <div className="position-fixed top-50 start-50 translate-middle w-100 px-3" style={{ maxWidth: '500px', zIndex: 1050 }}>
                        <BrandReviewForm 
                            userId={user.id}
                            brandId={campaign.brand_id}
                            campaignId={campaign.id}
                            onClose={() => setReviewingBrand(false)}
                            onSubmitSuccess={() => {
                                alert('Brand Review submitted successfully!');
                                setReviewingBrand(false);
                            }}
                        />
                    </div>
                </>
            )}

            {/* Message Modal */}
            {messagingUser && (
                <>
                    <div className="modal-backdrop bg-dark" style={{ opacity: 0.8, zIndex: 1040 }} onClick={() => setMessagingUser(null)}></div>
                    <div className="position-fixed top-50 start-50 translate-middle w-100 px-3" style={{ maxWidth: '500px', zIndex: 1050 }}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card border-0 shadow-lg p-4 rounded-4" style={{ background: 'rgba(15,15,16,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h5 className="text-white fw-bold mb-3">Message {messagingUser.name}</h5>
                            <form onSubmit={handleSendMessage}>
                                <textarea 
                                    className="form-control bg-dark text-white border-secondary mb-3" 
                                    rows="4" 
                                    placeholder="Type your first message to start the conversation..."
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    required
                                ></textarea>
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-dark" onClick={() => setMessagingUser(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Send</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}

            {/* Invoice Modal */}
            {showInvoiceModal && (
                <>
                    <div className="modal-backdrop bg-dark" style={{ opacity: 0.8, zIndex: 1040 }} onClick={() => setShowInvoiceModal(false)}></div>
                    <div className="position-fixed top-50 start-50 translate-middle w-100 px-3" style={{ maxWidth: '400px', zIndex: 1050 }}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card border-0 shadow-lg p-4 rounded-4" style={{ background: 'rgba(15,15,16,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                                <span className="text-success">$</span> Generate Invoice
                            </h5>
                            <form onSubmit={handleGenerateInvoice}>
                                <div className="mb-3">
                                    <label className="text-white-50 small mb-1">Invoice Amount (USD)</label>
                                    <input 
                                        type="number" 
                                        className="form-control bg-dark text-white border-secondary" 
                                        placeholder="e.g. 500"
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(e.target.value)}
                                        min="1"
                                        required
                                    />
                                    <small className="text-muted mt-1 d-block">This action permanently records the invoice against the brand.</small>
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-dark" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success px-4">Send Invoice</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CampaignDetails;
