import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiCopy, FiCheck } from 'react-icons/fi';
import { API_URL } from '../config';

const AiCaptionWidget = () => {
    const [niche, setNiche] = useState('');
    const [product, setProduct] = useState('');
    const [tone, setTone] = useState('casual');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const generateCaption = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/ai/caption-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ niche, product, tone })
            });
            if (res.ok) {
                const data = await res.json();
                setResult(data);
                setCopied(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(`${result.caption}\n\n${result.hashtags}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="card glass-card border-0 mb-4 p-4 rounded-4" style={{ background: 'rgba(15, 15, 16, 0.6)', backdropFilter: 'blur(10px)' }}>
            <h5 className="text-white d-flex align-items-center gap-2 mb-3">
                <FiCpu className="text-primary" /> AI Idea Generator
            </h5>
            <form onSubmit={generateCaption} className="d-flex flex-column gap-3">
                <div className="row g-2">
                    <div className="col-6">
                        <input type="text" className="form-control bg-dark text-white border-white border-opacity-10" placeholder="Niche (e.g. Fashion)" value={niche} onChange={e => setNiche(e.target.value)} required />
                    </div>
                    <div className="col-6">
                        <input type="text" className="form-control bg-dark text-white border-white border-opacity-10" placeholder="Product" value={product} onChange={e => setProduct(e.target.value)} required />
                    </div>
                    <div className="col-12">
                        <select className="form-select bg-dark text-white border-white border-opacity-10" value={tone} onChange={e => setTone(e.target.value)}>
                            <option value="casual">Casual Tone</option>
                            <option value="professional">Professional Tone</option>
                            <option value="enthusiastic">Enthusiastic Tone</option>
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : <><FiCpu /> Generate AI Caption</>}
                </button>
            </form>

            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded bg-dark border border-white border-opacity-10 position-relative">
                    <button 
                        onClick={handleCopy} 
                        className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2"
                        title="Copy to clipboard"
                    >
                        {copied ? <FiCheck className="text-success" /> : <FiCopy />}
                    </button>
                    <p className="text-white mb-2 fs-6">{result.caption}</p>
                    <small className="text-primary">{result.hashtags}</small>
                </motion.div>
            )}
        </div>
    );
};

export default AiCaptionWidget;
