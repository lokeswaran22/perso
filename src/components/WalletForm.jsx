import { useState, useEffect, useRef } from 'react';
import { getAllCategories, getCategoryById } from '../utils/categories';
import { formatTags, parseTags, getAllTags } from '../utils/enhancedCategories';
import PasswordGenerator from './PasswordGenerator';
import { FaTimes, FaUpload, FaFile, FaTrash, FaMagic, FaStar, FaRegStar } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import './WalletForm.css';

const WalletForm = ({ item, onSave, onCancel, allTags = [] }) => {
    const [category, setCategory] = useState(item?.category || '');
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [tags, setTags] = useState(item?.tags || []);
    const [isFavorite, setIsFavorite] = useState(item?.isFavorite || false);
    const [showPasswordGen, setShowPasswordGen] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState(item?.files || []);

    // Auto-save draft ref
    const draftTimeoutRef = useRef(null);

    const categories = getAllCategories();
    const selectedCategory = getCategoryById(category);

    useEffect(() => {
        if (item) {
            setCategory(item.category);
            setFormData(item);
            setTags(typeof item.tags === 'string' ? parseTags(item.tags) : (item.tags || []));
            setIsFavorite(item.isFavorite || false);
        }
    }, [item]);

    // Cleanup timeout
    useEffect(() => {
        return () => {
            if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);
        };
    }, []);

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        // Don't clear all data when switching categories, just mismatched fields if needed
        // For now, keeping original behavior but preserving common fields like title
        const commonFields = ['title', 'notes'];
        const newFormData = {};
        commonFields.forEach(field => {
            if (formData[field]) newFormData[field] = formData[field];
        });
        setFormData(newFormData);
        setErrors({});
    };

    const handleFieldChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: null }));
        }

        // Auto-save draft logic could go here
    };

    const handleUsePassword = (password) => {
        if (activeField) {
            handleFieldChange(activeField, password);
            setShowPasswordGen(false);
            setActiveField(null);
        } else {
            // Try to find a password field
            const passwordField = selectedCategory?.fields.find(f => f.type === 'password' || f.name.includes('password') || f.name.includes('pin'));
            if (passwordField) {
                handleFieldChange(passwordField.name, password);
                setShowPasswordGen(false);
            } else {
                navigator.clipboard.writeText(password);
                toast.success('Password copied to clipboard (no password field found)');
            }
        }
    };

    const handleTagsChange = (e) => {
        // Simple comma separated input for now
        const tagsList = parseTags(e.target.value);
        setTags(tagsList);
    };

    // File Dropzone
    const onDrop = async (acceptedFiles) => {
        const newFiles = await Promise.all(acceptedFiles.map(async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target.result;
                    // Check if image and needs compression
                    if (file.type.startsWith('image/') && file.size > 500 * 1024) { // > 500KB
                        const img = new Image();
                        img.src = result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            // Resizing logic (max 1280px width)
                            const scale = Math.min(1, 1280 / img.width);
                            canvas.width = img.width * scale;
                            canvas.height = img.height * scale;
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            // Compress to JPEG 0.7
                            resolve({
                                name: file.name,
                                size: file.size, // Original size (approx)
                                type: 'image/jpeg', // Converted type
                                preview: canvas.toDataURL('image/jpeg', 0.7)
                            });
                        };
                    } else {
                        // Small file or non-image, store as is (Base64)
                        resolve({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            preview: result
                        });
                    }
                };
                reader.readAsDataURL(file);
            });
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);
        toast.info(`${acceptedFiles.length} files attached (saved to DB)`);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'video/*': [],
            'text/plain': [],
            'application/pdf': [],
            'application/msword': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
        }
    });

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!category) {
            newErrors.category = 'Please select a category';
            return newErrors;
        }

        selectedCategory.fields.forEach(field => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} is required`;
            }
        });

        return newErrors;
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        const itemData = {
            ...formData,
            category,
            tags,
            isFavorite,
            files: uploadedFiles,
            updatedAt: new Date()
        };

        if (item?.id) {
            itemData.id = item.id;
        }

        try {
            await onSave(itemData);
            // Success - the parent component will close the modal via setModalState
            // Don't reset isSubmitting here since the component will unmount
        } catch (error) {
            console.error(error);
            toast.error(`Save Failed: ${error.message || 'Unknown error'}`);
            setIsSubmitting(false); // Reset state on error so user can retry
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal wallet-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wallet-form-header">
                    <h2>{item ? 'Edit Item' : 'Add New Item'}</h2>
                    <div className="header-actions">
                        <button
                            className={`btn-icon favorite-btn ${isFavorite ? 'active' : ''}`}
                            onClick={() => setIsFavorite(!isFavorite)}
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isFavorite ? <FaStar /> : <FaRegStar />}
                        </button>
                        <button className="btn-icon" onClick={onCancel}>
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div className="wallet-form-content-wrapper">
                    <form onSubmit={handleSubmit} className="wallet-form">
                        <div className="form-group">
                            <label htmlFor="category" className="form-label">
                                Category *
                            </label>
                            <select
                                id="category"
                                className="select"
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                disabled={!!item}
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <span className="error-message">{errors.category}</span>}
                        </div>

                        {selectedCategory && (
                            <div className="wallet-form-fields">
                                {selectedCategory.fields.map(field => (
                                    <div key={field.name} className="form-group">
                                        <div className="label-row">
                                            <label htmlFor={field.name} className="form-label">
                                                {field.label} {field.required && '*'}
                                                {field.sensitive && <span className="sensitive-badge">Sensitive</span>}
                                                {field.type === 'textarea' && <span className="markdown-badge" title="Markdown supported">Markdown</span>}
                                            </label>
                                            {field.type === 'password' && (
                                                <button
                                                    type="button"
                                                    className="generate-pass-btn"
                                                    onClick={() => {
                                                        setActiveField(field.name);
                                                        setShowPasswordGen(true);
                                                    }}
                                                >
                                                    <FaMagic /> Generate
                                                </button>
                                            )}
                                        </div>

                                        {field.type === 'textarea' ? (
                                            <textarea
                                                id={field.name}
                                                className="textarea"
                                                placeholder={field.placeholder}
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                required={field.required}
                                                rows={4}
                                            />
                                        ) : (
                                            <input
                                                id={field.name}
                                                type={field.type}
                                                className="input"
                                                placeholder={field.placeholder}
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                required={field.required}
                                            />
                                        )}

                                        {errors[field.name] && (
                                            <span className="error-message">{errors[field.name]}</span>
                                        )}
                                    </div>
                                ))}

                                {/* Tags Section */}
                                <div className="form-group">
                                    <label className="form-label">Tags</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., work, personal, finance (comma separated)"
                                        value={Array.isArray(tags) ? tags.join(', ') : tags}
                                        onChange={handleTagsChange}
                                    />
                                    <div className="tags-preview">
                                        {Array.isArray(tags) && tags.map((tag, idx) => (
                                            <span key={idx} className="tag-pill">{tag.trim()}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* File Attachment Section */}
                                <div className="form-group">
                                    <label className="form-label">Attachments</label>
                                    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                                        <input {...getInputProps()} />
                                        <FaUpload className="upload-icon" />
                                        <p>Drag & drop files here, or click to select files</p>
                                        <span className="upload-hint">Max 10MB per file. Encrypted before upload.</span>
                                    </div>

                                    {uploadedFiles.length > 0 && (
                                        <div className="file-list">
                                            {uploadedFiles.map((file, idx) => (
                                                <div key={idx} className="file-item">
                                                    <FaFile className="file-icon" />
                                                    <span className="file-name">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        className="remove-file-btn"
                                                        onClick={() => removeFile(idx)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="wallet-form-actions">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (item ? 'Update Item' : 'Save Item')}
                            </button>
                        </div>
                    </form>

                    {/* Side Panel for Password Generator */}
                    {showPasswordGen && (
                        <div className="password-gen-sidebar">
                            <div className="sidebar-header">
                                <h3>Password Generator</h3>
                                <button className="btn-icon" onClick={() => setShowPasswordGen(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <PasswordGenerator onUsePassword={handleUsePassword} embedded={true} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletForm;
