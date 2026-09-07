import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HubSpotLayout from '../components/HubSpotLayout';
import '../css/LeadCreation.css';

const LeadCreation = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        company_rep: '',
        contact_position: '',
        contact_phone: '',
        contact_email: '',
        source: '',
        seta: '',
        service_interest: '',
        estimated_value: '',
        notes: '',
        next_follow_up: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8000/api/leads/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                setSuccess('Lead created successfully!');
                
                // Add the new lead to localStorage for immediate display
                const existingLeads = JSON.parse(localStorage.getItem('leadsData') || '[]');
                const newLead = {
                    id: result.id || Date.now(),
                    company_name: formData.company_name,
                    contact_person: formData.contact_person,
                    company_rep: formData.company_rep,
                    contact_position: formData.contact_position,
                    contact_phone: formData.contact_phone,
                    contact_email: formData.contact_email,
                    source: formData.source,
                    seta: formData.seta,
                    service_interest: formData.service_interest,
                    estimated_value: parseFloat(formData.estimated_value) || 0,
                    notes: formData.notes,
                    next_follow_up: formData.next_follow_up,
                    status: 'new',
                    created_at: new Date().toISOString()
                };
                
                const updatedLeads = [...existingLeads, newLead];
                localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
                
                // Reset form
                setFormData({
                    company_name: '',
                    contact_person: '',
                    company_rep: '',
                    contact_position: '',
                    contact_phone: '',
                    contact_email: '',
                    source: '',
                    seta: '',
                    service_interest: '',
                    estimated_value: '',
                    notes: '',
                    next_follow_up: ''
                });
                
                // Redirect to leads page after 2 seconds
                setTimeout(() => {
                    navigate('/leads');
                }, 2000);
            } else {
                const errorData = await response.json();
                setError('Failed to create lead. Please check your input.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // (move all code from return into a variable)
    const pageContent = (
        <>
            <div className="app-container">
                <div className="main-content" style={{ marginLeft: 0, width: '100%' }}>
                    <div className="header-container" style={{ display: 'flex', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
                        <button 
                            className="btn secondary" 
                            onClick={() => navigate(-1)}
                            style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <i className="fas fa-arrow-left"></i>
                            Go Back
                        </button>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>
                                <i className="fas fa-user-plus" style={{ marginRight: '0.5rem', color: '#007bff' }}></i>
                                Create New Lead
                            </h1>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                                Capture a new lead for potential business opportunities
                            </p>
                        </div>
                    </div>
                    
                    <main className="content" style={{ padding: '2rem' }}>
                        <div className="form-container">
                            {error && (
                                <div className="alert alert-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    <i className="fas fa-check-circle"></i>
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="client-form">
                                {/* Basic Information */}
                                <section className="form-section">
                                    <h3><i className="fas fa-building"></i> Company Information</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="company_name">Company Name *</label>
                                            <input
                                                type="text"
                                                id="company_name"
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="company_rep">Company Rep</label>
                                            <input
                                                type="text"
                                                id="company_rep"
                                                name="company_rep"
                                                value={formData.company_rep}
                                                onChange={handleInputChange}
                                                placeholder="Enter company representative name"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Contact Information */}
                                <section className="form-section">
                                    <h3><i className="fas fa-user"></i> Contact Information</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="contact_person">Contact Person *</label>
                                            <input
                                                type="text"
                                                id="contact_person"
                                                name="contact_person"
                                                value={formData.contact_person}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="contact_position">Position</label>
                                            <input
                                                type="text"
                                                id="contact_position"
                                                name="contact_position"
                                                value={formData.contact_position}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="contact_phone">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="contact_phone"
                                                name="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="contact_email">Email Address *</label>
                                            <input
                                                type="email"
                                                id="contact_email"
                                                name="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Lead Details */}
                                <section className="form-section">
                                    <h3><i className="fas fa-info-circle"></i> Lead Details</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="source">Lead Source *</label>
                                            <select
                                                id="source"
                                                name="source"
                                                value={formData.source}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Source</option>
                                                <option value="website">Website</option>
                                                <option value="referral">Referral</option>
                                                <option value="cold_call">Cold Call</option>
                                                <option value="social_media">Social Media</option>
                                                <option value="email">Email Campaign</option>
                                                <option value="event">Event/Conference</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="seta">SETA</label>
                                            <select
                                                id="seta"
                                                name="seta"
                                                value={formData.seta}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select SETA</option>
                                                <option value="wrseta">WRSETA</option>
                                                <option value="chieta">CHIETA</option>
                                                <option value="bankseta">BANKSETA</option>
                                                <option value="fasset">FASSET</option>
                                                <option value="cftl">CFTL</option>
                                                <option value="ceta">CETA</option>
                                                <option value="ctfl">CTFL</option>
                                                <option value="eseta">ESETA</option>
                                                <option value="hwseta">HWSETA</option>
                                                <option value="isett">ISETT</option>
                                                <option value="inseta">INSETA</option>
                                                <option value="lgseta">LGSETA</option>
                                                <option value="merseta">MERSETA</option>
                                                <option value="sassetta">SASSETA</option>
                                                <option value="agriseta">AGRISETA</option>
                                                <option value="dseta">DSETA</option>
                                                <option value="theta">THETA</option>
                                                <option value="teta">TETA</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="service_interest">Service Interest</label>
                                            <select
                                                id="service_interest"
                                                name="service_interest"
                                                value={formData.service_interest}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Service</option>
                                                <option value="wsp">WSP</option>
                                                <option value="hr">HR</option>
                                                <option value="both">Both WSP & HR</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="estimated_value">Estimated Value (R)</label>
                                            <input
                                                type="number"
                                                id="estimated_value"
                                                name="estimated_value"
                                                step="0.01"
                                                value={formData.estimated_value}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="next_follow_up">Next Follow-up</label>
                                            <input
                                                type="datetime-local"
                                                id="next_follow_up"
                                                name="next_follow_up"
                                                value={formData.next_follow_up}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Additional Information */}
                                <section className="form-section">
                                    <h3><i className="fas fa-sticky-note"></i> Additional Information</h3>
                                    <div className="form-group">
                                        <label htmlFor="notes">Notes</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            rows="4"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Add any additional notes about this lead..."
                                        ></textarea>
                                    </div>
                                </section>

                                {/* Form Actions */}
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn secondary"
                                        onClick={() => navigate('/leads')}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-times"></i> Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Creating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i> Create Lead
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </main>

                    <footer>
                        <p>&copy; 2025 CRM. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </>
    );

    return (
        <HubSpotLayout 
            title="Create Lead" 
            description="Create a new sales lead"
        >
            {pageContent}
        </HubSpotLayout>
    );
};

export default LeadCreation; 