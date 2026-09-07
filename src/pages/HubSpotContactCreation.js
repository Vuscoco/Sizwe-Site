import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HubSpotLayout from '../components/HubSpotLayout';
import '../css/HubSpotContactCreation.css';

const HubSpotContactCreation = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        website: '',
        jobTitle: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        lifecycleStage: '',
        leadStatus: '',
        source: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            alert('Contact created successfully!');
            navigate('/contacts');
        }, 1500);
    };

    // (move all code from return into a variable)
    const pageContent = (
        <div className="hubspot-contact-container">
            {/* HubSpot Top Navigation Bar */}
            <div className="hubspot-top-nav">
                <div className="top-nav-content">
                    <div className="breadcrumb">
                        <span className="breadcrumb-item">Contacts</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item active">Create contact</span>
                    </div>
                    <div className="top-nav-actions">
                        <button className="btn-secondary">Cancel</button>
                        <button 
                            className="btn-primary" 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create contact'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="hubspot-main-content">
                <div className="content-wrapper">
                    {/* Left Sidebar - Contact Properties */}
                    <div className="left-sidebar">
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2>Contact properties</h2>
                                <p>Add information about this contact</p>
                            </div>

                            {/* Email - HubSpot's primary field */}
                            <div className="form-group primary-field">
                                <label htmlFor="email">Email address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    required
                                    className="primary-input"
                                />
                                <div className="field-help">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4H7V6h2v2z" fill="currentColor"/>
                                    </svg>
                                    This is the primary identifier for this contact
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            {/* Company */}
                            <div className="form-group">
                                <label htmlFor="company">Company</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="Enter company name"
                                />
                            </div>

                            {/* Phone */}
                            <div className="form-group">
                                <label htmlFor="phone">Phone number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {/* Website */}
                            <div className="form-group">
                                <label htmlFor="website">Website</label>
                                <input
                                    type="url"
                                    id="website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    placeholder="Enter website URL"
                                />
                            </div>

                            {/* Job Title */}
                            <div className="form-group">
                                <label htmlFor="jobTitle">Job title</label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleInputChange}
                                    placeholder="Enter job title"
                                />
                            </div>

                            {/* Address Section */}
                            <div className="address-section">
                                <h3>Address information</h3>
                                
                                <div className="form-group">
                                    <label htmlFor="address">Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter street address"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">City</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="state">State/Province</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="Enter state"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="zipCode">ZIP/Postal code</label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            placeholder="Enter ZIP code"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="country">Country</label>
                                        <select
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                        >
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Germany">Germany</option>
                                            <option value="France">France</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Marketing Information */}
                            <div className="marketing-section">
                                <h3>Marketing information</h3>
                                
                                <div className="form-group">
                                    <label htmlFor="lifecycleStage">Lifecycle stage</label>
                                    <select
                                        id="lifecycleStage"
                                        name="lifecycleStage"
                                        value={formData.lifecycleStage}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select lifecycle stage</option>
                                        <option value="subscriber">Subscriber</option>
                                        <option value="lead">Lead</option>
                                        <option value="marketing_qualified_lead">Marketing Qualified Lead</option>
                                        <option value="sales_qualified_lead">Sales Qualified Lead</option>
                                        <option value="opportunity">Opportunity</option>
                                        <option value="customer">Customer</option>
                                        <option value="evangelist">Evangelist</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="leadStatus">Lead status</label>
                                    <select
                                        id="leadStatus"
                                        name="leadStatus"
                                        value={formData.leadStatus}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select lead status</option>
                                        <option value="new">New</option>
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="presentation_scheduled">Presentation Scheduled</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="unqualified">Unqualified</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="source">Lead source</label>
                                    <select
                                        id="source"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select lead source</option>
                                        <option value="website">Website</option>
                                        <option value="blog">Blog</option>
                                        <option value="social_media">Social Media</option>
                                        <option value="email">Email</option>
                                        <option value="referral">Referral</option>
                                        <option value="trade_show">Trade Show</option>
                                        <option value="advertising">Advertising</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="form-group">
                                <label htmlFor="notes">Notes</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Add notes about this contact..."
                                    rows="4"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - HubSpot's Activity Feed */}
                    <div className="right-sidebar">
                        <div className="activity-feed">
                            <div className="feed-header">
                                <h3>Activity feed</h3>
                                <button className="btn-link">View all</button>
                            </div>
                            
                            <div className="feed-content">
                                <div className="feed-item">
                                    <div className="feed-icon">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4H7V6h2v2z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div className="feed-text">
                                        <p>Contact created</p>
                                        <span className="feed-time">Just now</span>
                                    </div>
                                </div>
                                
                                <div className="feed-placeholder">
                                    <div className="placeholder-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <p>No activity yet</p>
                                    <span>Activity will appear here once the contact is created</span>
                                </div>
                            </div>
                        </div>

                        {/* HubSpot's Related Records */}
                        <div className="related-records">
                            <div className="records-header">
                                <h3>Related records</h3>
                            </div>
                            
                            <div className="records-content">
                                <div className="record-item">
                                    <div className="record-icon">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M12 2H4C2.9 2 2 2.9 2 4V12C2 13.1 2.9 14 4 14H12C13.1 14 14 13.1 14 12V4C14 2.9 13.1 2 12 2ZM12 12H4V4H12V12Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div className="record-text">
                                        <p>Companies</p>
                                        <span>0 associated</span>
                                    </div>
                                </div>
                                
                                <div className="record-item">
                                    <div className="record-icon">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14ZM7 4H9V8H13V10H9V14H7V10H3V8H7V4Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div className="record-text">
                                        <p>Deals</p>
                                        <span>0 associated</span>
                                    </div>
                                </div>
                                
                                <div className="record-item">
                                    <div className="record-icon">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M14 2H2C1.45 2 1 2.45 1 3V13C1 13.55 1.45 14 2 14H14C14.55 14 15 13.55 15 13V3C15 2.45 14.55 2 14 2ZM14 4L8 8.5L2 4V3L8 7.5L14 3V4Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div className="record-text">
                                        <p>Emails</p>
                                        <span>0 sent</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <HubSpotLayout 
            title="Create HubSpot Contact" 
            description="Create a new HubSpot contact"
        >
            {pageContent}
        </HubSpotLayout>
    );
};

export default HubSpotContactCreation; 