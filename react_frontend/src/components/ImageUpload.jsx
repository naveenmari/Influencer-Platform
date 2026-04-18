import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCamera } from 'react-icons/fi';
import CropAvatarModal from './CropAvatarModal';
import { API_URL } from '../config';

const ImageUpload = ({ onUploadSuccess, initialImage, userId }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(initialImage && initialImage !== '' ? initialImage : null);
    const [imageError, setImageError] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImage(reader.result);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        multiple: false
    });

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/webp');
        });
    };

    const handleSave = async (croppedAreaPixels) => {
        setLoading(true);
        try {
            const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
            const formData = new FormData();
            formData.append('file', croppedImageBlob, 'profile.webp');
            formData.append('user_id', userId);

            const response = await fetch(`${API_URL}/api/upload_profile_pic`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setPreview(data.profile_pic_url);
                setIsCropping(false);
                if (onUploadSuccess) onUploadSuccess(data.profile_pic_url);
            } else {
                alert('Upload failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error cropping/uploading image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="avatar-upload-section w-100 d-flex flex-column align-items-center">
            <div className="avatar-container position-relative">
                <div
                    {...getRootProps()}
                    className={`avatar-preview-box shadow-sm ${isDragActive ? 'drag-active' : ''}`}
                >
                    <input {...getInputProps()} />
                    {preview && !imageError ? (
                        <img
                            src={preview.startsWith('/') ? `${API_URL}${preview}` : preview}
                            alt="Profile"
                            className="avatar-image"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="avatar-placeholder">
                            <FiUpload />
                            <span className="small mt-1">Upload</span>
                        </div>
                    )}

                    <div className="avatar-edit-icon">
                        <FiCamera size={14} />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isCropping && (
                    <CropAvatarModal
                        image={image}
                        loading={loading}
                        onCancel={() => setIsCropping(false)}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>

            <style>{`
                .avatar-upload-section {
                    margin-bottom: 2rem;
                }
                .avatar-container {
                    padding: 6px;
                    border: 1px dashed rgba(93, 95, 239, 0.3);
                    border-radius: 50%;
                    display: inline-flex;
                    transition: all 0.3s ease;
                }
                .avatar-container:hover {
                    border-color: rgba(99, 102, 241, 0.6);
                    background: rgba(99, 102, 241, 0.05);
                }
                .avatar-preview-box {
                    width: 130px;
                    height: 130px;
                    border-radius: 50%;
                    overflow: hidden;
                    cursor: pointer;
                    background: #0a0a0a;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid #1a1a1a;
                }
                @media (max-width: 576px) {
                    .avatar-preview-box {
                        width: 110px;
                        height: 110px;
                    }
                }
                .avatar-preview-box:hover {
                    border-color: #6366f1;
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
                }
                .avatar-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .avatar-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.3);
                    gap: 4px;
                }
                .avatar-placeholder svg {
                    font-size: 24px;
                }
                .avatar-edit-icon {
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    background: #6366f1;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid #0a0a0a;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                    z-index: 2;
                    transition: all 0.2s ease;
                }
                .avatar-preview-box:hover .avatar-edit-icon {
                    transform: scale(1.1);
                    background: #4f46e5;
                }
            `}</style>
        </div>
    );
};

export default ImageUpload;
