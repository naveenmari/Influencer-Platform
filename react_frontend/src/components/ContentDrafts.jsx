import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const ContentDrafts = ({ campaignId, user, isBrand }) => {
    const [drafts, setDrafts] = useState([]);
    const [draftUrl, setDraftUrl] = useState('');
    const [draftText, setDraftText] = useState('');

    useEffect(() => {
        if(campaignId) {
            fetchDrafts();
        }
    }, [campaignId]);

    const fetchDrafts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/drafts`);
            if (res.ok) {
                const data = await res.json();
                setDrafts(data);
            }
        } catch (err) { console.error('Error fetching drafts', err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/drafts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_id: campaignId,
                    user_id: user.id,
                    draft_url: draftUrl,
                    draft_text: draftText
                })
            });
            if (res.ok) {
                setDraftUrl('');
                setDraftText('');
                fetchDrafts();
                alert('Draft submitted successfully!');
            } else {
                alert('Failed to submit draft.');
            }
        } catch (err) { alert('Error submitting draft'); }
    };

    const handleStatusUpdate = async (draftId, status) => {
        try {
            const res = await fetch(`${API_URL}/api/drafts/${draftId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, feedback: '' })
            });
            if (res.ok) {
                fetchDrafts();
            }
        } catch (err) { alert('Error updating status'); }
    };

    return (
        <div className="mt-5 border-top pt-4">
            <h3 className="fw-bold mb-4">Content Drafts</h3>
            
            {user?.role === 'influencer' && (
                <div className="card bg-dark bg-opacity-50 text-white border-0 shadow-sm mb-4 p-4 rounded-4">
                    <h5 className="mb-3">Submit New Draft</h5>
                    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                        <input 
                            type="url" 
                            className="form-control bg-dark text-white border-secondary" 
                            placeholder="Link to Draft (Google Drive, unlisted YouTube...)"
                            value={draftUrl}
                            onChange={(e) => setDraftUrl(e.target.value)}
                            required 
                        />
                        <textarea 
                            className="form-control bg-dark text-white border-secondary" 
                            placeholder="Additional context or caption text..."
                            value={draftText}
                            onChange={(e) => setDraftText(e.target.value)}
                            rows="3"
                        ></textarea>
                        <button type="submit" className="btn btn-primary align-self-start fw-bold px-4">Submit Draft</button>
                    </form>
                </div>
            )}

            <div className="d-flex flex-column gap-3">
                {drafts.length === 0 ? (
                    <p className="text-muted">No drafts submitted yet.</p>
                ) : drafts.map(draft => (
                    <motion.div key={draft.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-dark bg-opacity-25 text-white border border-white border-opacity-10 p-4 rounded-4">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 className="fw-bold text-info">{draft.username}</h6>
                                <p className="mb-1"><strong>Link:</strong> <a href={draft.draft_url} target="_blank" rel="noreferrer" className="text-info">{draft.draft_url}</a></p>
                                <p className="mb-3 small opacity-75">{draft.draft_text}</p>
                                <span className={`badge rounded-pill px-3 py-2 ${draft.status === 'approved' ? 'bg-success' : draft.status === 'rejected' ? 'bg-danger' : draft.status === 'revision_requested' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                    Status: {draft.status}
                                </span>
                            </div>
                            {isBrand && draft.status === 'pending' && (
                                <div className="d-flex flex-column gap-2">
                                    <button onClick={() => handleStatusUpdate(draft.id, 'approved')} className="btn btn-sm btn-success">Approve</button>
                                    <button onClick={() => handleStatusUpdate(draft.id, 'revision_requested')} className="btn btn-sm btn-warning">Request Revision</button>
                                    <button onClick={() => handleStatusUpdate(draft.id, 'rejected')} className="btn btn-sm btn-danger">Reject</button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ContentDrafts;
