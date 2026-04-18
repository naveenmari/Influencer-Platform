import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';

const CropAvatarModal = ({ image, onCancel, onSave, loading }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = () => {
        onSave(croppedAreaPixels);
    };

    return (
        <div className="crop-avatar-fixed-overlay">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="crop-backdrop"
                onClick={onCancel}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: "-40%", x: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, y: "-40%", x: "-50%" }}
                className="crop-modal-container bg-dark rounded-4 shadow-lg"
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10001
                }}
            >
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-white-05">
                    <div>
                        <h5 className="text-white fw-bold mb-0">Adjust Profile Picture</h5>
                        <p className="text-white-50 small mb-0 mt-1">Drag and zoom to perfectly frame your photo</p>
                    </div>
                    <button className="btn btn-dark-soft rounded-circle p-2" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="cropper-viewport-container position-relative bg-black">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="modal-controls p-4">
                    <div className="zoom-slider-container mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <FiMinus size={14} className="text-white-50" />
                            <span className="text-white-50 xx-small text-uppercase fw-bold letter-spacing-1">Zoom Intensity</span>
                            <FiPlus size={14} className="text-white-50" />
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="form-range custom-indigo-range"
                        />
                    </div>

                    <div className="d-flex gap-3">
                        <button
                            className="btn btn-outline-light w-100 py-2 border-white-10 hover-bg-white-05"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-indigo flex-grow-1 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <FiCheck size={18} />
                            )}
                            {loading ? 'Processing...' : 'Save Photo'}
                        </button>
                    </div>
                </div>

                <style>{`
                    .crop-avatar-fixed-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        z-index: 10000;
                    }
                    .crop-backdrop {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.85);
                        backdrop-filter: blur(12px);
                    }
                    .crop-modal-container {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 95vw;
                        max-width: 420px;
                        max-height: 95vh;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        background: #0f172a !important;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                        margin: 10px 0;
                    }
                    .cropper-viewport-container {
                        height: 240px;
                        width: 100%;
                    }
                    @media (max-width: 576px) {
                        .cropper-viewport-container {
                            height: 180px;
                        }
                    }
                    .border-white-05 { border-color: rgba(255, 255, 255, 0.05) !important; }
                    .border-white-10 { border-color: rgba(255, 255, 255, 0.1) !important; }
                    .text-white-50 { color: rgba(255, 255, 255, 0.5) !important; }
                    .xx-small { font-size: 0.65rem; }
                    .letter-spacing-1 { letter-spacing: 1.5px; }
                    .hover-bg-white-05:hover { background: rgba(255, 255, 255, 0.05); }
                    .btn-dark-soft { 
                        background: rgba(255, 255, 255, 0.05); 
                        border: none;
                        color: white-50;
                    }
                    .btn-indigo {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        border: none;
                        color: white;
                        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
                    }
                    .custom-indigo-range::-webkit-slider-runnable-track {
                        background: rgba(255, 255, 255, 0.1);
                        height: 4px;
                        border-radius: 2px;
                    }
                    .custom-indigo-range::-webkit-slider-thumb {
                        background: #6366f1;
                        margin-top: -6px;
                    }
                `}</style>
            </motion.div>
        </div>
    );
};

export default CropAvatarModal;
