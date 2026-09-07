import React, { useState, useEffect } from 'react';
import '../css/accreditationmodal.css';

const AccreditationModal = ({ isOpen, onClose, accreditationData, mode = 'view', onSave, onDelete }) => {
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (accreditationData) {
            setFormData({
                id: accreditationData.id,
                accreditingBody: accreditationData.accreditingBody || '',
                accreditationNumber: accreditationData.accreditationNumber || '',
                qualifications: accreditationData.qualifications || '',
                nqfLevel: accreditationData.nqfLevel || '',
                ofoNumber: accreditationData.ofoNumber || '',
                issuedBy: accreditationData.issuedBy || '',
                expires: accreditationData.expires || '',
                duration: accreditationData.duration || ''
            });
        }
    }, [accreditationData]);

    useEffect(() => {
        setIsEditing(mode === 'edit');
    }, [mode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (onSave) {
            onSave(formData);
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this accreditation record?\n\n' +
            'This action cannot be undone and will permanently remove all accreditation data.'
        );
        
        if (confirmDelete) {
            if (onDelete) {
                onDelete(accreditationData.id);
            }
            onClose();
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (isEditing) {
            setIsEditing(false);
            // Reset to original data
            if (accreditationData) {
                setFormData({
                    id: accreditationData.id,
                    accreditingBody: accreditationData.accreditingBody || '',
                    accreditationNumber: accreditationData.accreditationNumber || '',
                    qualifications: accreditationData.qualifications || '',
                    nqfLevel: accreditationData.nqfLevel || '',
                    ofoNumber: accreditationData.ofoNumber || '',
                    issuedBy: accreditationData.issuedBy || '',
                    expires: accreditationData.expires || '',
                    duration: accreditationData.duration || ''
                });
            }
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="accreditation-modal-overlay">
            <div className="accreditation-modal">
                <div className="accreditation-modal-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <i className="fas fa-certificate"></i>
                        </div>
                        <div className="header-text">
                            <h2>{isEditing ? 'Edit Accreditation' : 'Accreditation Details'}</h2>
                            <p className="subtitle">
                                {isEditing ? 'Modify accreditation information' : 'View complete accreditation record'}
                            </p>
                        </div>
                    </div>
                    <div className="accreditation-modal-actions">
                        {!isEditing && mode === 'view' && (
                            <button className="action-btn edit-btn" onClick={handleEdit} title="Edit">
                                <i className="fas fa-edit"></i>
                            </button>
                        )}
                        {!isEditing && (
                            <button className="action-btn delete-btn" onClick={handleDelete} title="Delete">
                                <i className="fas fa-trash"></i>
                            </button>
                        )}
                        <button className="action-btn close-btn" onClick={handleCancel} title="Close">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div className="accreditation-modal-body">
                    <div className="accreditation-sections">
                        {/* Basic Information Section */}
                        <section className="accreditation-section">
                            <div className="section-header">
                                <i className="fas fa-info-circle"></i>
                                <h3>Basic Information</h3>
                            </div>
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Accrediting Body</label>
                                        {isEditing ? (
                                            <select 
                                                name="accreditingBody" 
                                                value={formData.accreditingBody}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Body</option>
                                                <option value="QCTO">QCTO</option>
                                                <option value="SAQA">SAQA</option>
                                                <option value="Umalusi">Umalusi</option>
                                            </select>
                                        ) : (
                                            <div className="display-value">
                                                <span className="value-text">{formData.accreditingBody}</span>
                                                <span className="value-badge">{formData.accreditingBody}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Accreditation Number</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                name="accreditationNumber" 
                                                value={formData.accreditationNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter accreditation number"
                                                required
                                            />
                                        ) : (
                                            <div className="display-value">
                                                <span className="value-text">{formData.accreditationNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label>Qualifications</label>
                                        {isEditing ? (
                                            <textarea 
                                                name="qualifications" 
                                                value={formData.qualifications}
                                                onChange={handleInputChange}
                                                placeholder="Enter qualifications"
                                                required
                                            />
                                        ) : (
                                            <div className="display-value">
                                                <span className="value-text">{formData.qualifications}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Level and Classification Section */}
                        <section className="accreditation-section">
                            <div className="section-header">
                                <i className="fas fa-layer-group"></i>
                                <h3>Level & Classification</h3>
                            </div>
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>NQF Level</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                name="nqfLevel" 
                                                value={formData.nqfLevel}
                                                onChange={handleInputChange}
                                                placeholder="e.g., NQF 5"
                                                required
                                            />
                                        ) : (
                                            <div className="display-value">
                                                <span className="value-text">{formData.nqfLevel}</span>
                                                <span className="level-badge">{formData.nqfLevel}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>OFO Number</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                name="ofoNumber" 
                                                value={formData.ofoNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter OFO number"
                                                required
                                            />
                                        ) : (
                                            <div className="display-value">
                                                <span className="value-text">{formData.ofoNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Validity Period Section */}
                        <section className="accreditation-section">
                            <div className="section-header">
                                <i className="fas fa-calendar-alt"></i>
                                <h3>Validity Period</h3>
                            </div>
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Issued Date</label>
                                        {isEditing ? (
                                            <input 
                                                type="date" 
                                                name="issuedBy" 
                                                value={formData.issuedBy}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        ) : (
                                            <div className="display-value">
                                                <span className="value-text">{formData.issuedBy}</span>
                                                <span className="date-badge">
                                                    <i className="fas fa-calendar"></i>
                                                    {formData.issuedBy}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Period</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                name="expires" 
                                                value={formData.expires}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 48 months"
                                                required
                                            />
                                        ) : (
                                            <div className="display-value">
                                                <span className="value-text">{formData.expires}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Duration</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                name="duration" 
                                                value={formData.duration}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 5 years"
                                                required
                                            />
                                        ) : (
                                            <div className="display-value">
                                                <span className="value-text">{formData.duration}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="accreditation-modal-footer">
                    {isEditing ? (
                        <div className="footer-actions">
                            <button className="btn-secondary" onClick={handleCancel}>
                                <i className="fas fa-times"></i>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSave}>
                                <i className="fas fa-save"></i>
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="footer-actions">
                            <button className="btn-secondary" onClick={onClose}>
                                <i className="fas fa-times"></i>
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccreditationModal; 