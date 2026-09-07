import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HubSpotLayout from '../components/HubSpotLayout';
import FormGuide from '../components/FormGuide';
import '../css/ClientCreation.css';

const ClientCreation = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({

        clientName: '',
        clientReg: '',
        clientAddress: '',
        contactPerson: '',
        contactPosition: '',
        contactPhone: '',
        contactEmail: '',
        seta: '',
        service: '',
        sdlNumber: '',
        moderator: '',
        retainer: '',
        paymentTerms: '30',
        qualificationType: '',
        qualificationLevel: '',
        dg: '',
        wspSubmitted: '',
        wspReason: '',

        services: []
    });

    const [qualificationLevels, setQualificationLevels] = useState([]);
    const [slaFile, setSlaFile] = useState(null);
    const [slaFileName, setSlaFileName] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(25);
    const [showGuide, setShowGuide] = useState(false);
    const [showServicesDropdown, setShowServicesDropdown] = useState(false);

    // Calculate form completion progress
    useEffect(() => {
        const requiredFields = {
            basic: ['clientName', 'clientReg', 'clientAddress'],
            contact: ['contactPerson', 'contactPosition', 'contactPhone', 'contactEmail'],
            business: ['seta', 'service', 'sdlNumber', 'moderator', 'qualificationType', 'qualificationLevel', 'dg'],
            financial: ['retainer', 'costPerLearner']
        };

        let completedFields = 0;
        let totalFields = 0;

        Object.keys(requiredFields).forEach(tab => {
            requiredFields[tab].forEach(field => {
                totalFields++;
                const value = formData[field];
                if (value && value.toString().trim() !== '') {
                    // Additional validation for specific field types
                    let isValid = true;
                    
                    if (field === 'contactEmail') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        isValid = emailRegex.test(value);
                    } else if (field === 'contactPhone') {
                        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                        isValid = phoneRegex.test(value.replace(/\s/g, ''));
                    } else if (field === 'retainer') {
                        isValid = !isNaN(value) && parseFloat(value) > 0;
                    }
                    
                    if (isValid) {
                        completedFields++;
                    }
                }
            });
        });

        const newProgress = Math.round((completedFields / totalFields) * 100);
        setProgress(newProgress);
    }, [formData]);

    // Handle click outside services dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showServicesDropdown && !event.target.closest('.services-dropdown-container')) {
                setShowServicesDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showServicesDropdown]);

    // Restore form data from sessionStorage when component mounts
    useEffect(() => {
        const savedData = sessionStorage.getItem('slaPreviewData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                
                // Clean up old services structure if it exists
                if (parsedData.services && Array.isArray(parsedData.services)) {
                    // If services contains objects, convert to string array
                    if (parsedData.services.length > 0 && typeof parsedData.services[0] === 'object') {
                        parsedData.services = [];
                    }
                } else {
                    parsedData.services = [];
                }
                
                setFormData(parsedData);
                
                // Restore SLA file information if it exists
                if (parsedData.slaFileName) {
                    setSlaFileName(parsedData.slaFileName);
                }
                if (parsedData.slaFile) {
                    setSlaFile(parsedData.slaFile);
                }
                
                // Also restore qualification levels if qualification type exists
                if (parsedData.qualificationType) {
                    updateQualificationLevels(parsedData.qualificationType);
                }
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }
    }, []);

    const validateField = (name, value) => {
        const errors = {};
        
        switch (name) {
            case 'contactEmail':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    errors[name] = 'Please enter a valid email address';
                }
                break;
            case 'contactPhone':
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
                    errors[name] = 'Please enter a valid phone number';
                }
                break;
            case 'retainer':
                if (value && (isNaN(value) || parseFloat(value) < 0)) {
                    errors[name] = 'Please enter a valid amount';
                }
                break;
            default:
                if (value && value.trim() === '') {
                    errors[name] = 'This field is required';
                }
        }
        
        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }

        if (name === 'qualificationType') {
            updateQualificationLevels(value);
        }
    };

    const updateQualificationLevels = (qualificationType) => {
        let levels = [];
        switch(qualificationType) {
            case 'ncv':
                for(let i = 1; i <= 4; i++) {
                    levels.push({ value: `level${i}`, text: `Level ${i}` });
                }
                break;
            case 'tvet_18_1':
            case 'skills_18_1':
                for(let i = 2; i <= 5; i++) {
                    levels.push({ value: `nqf${i}`, text: `NQF Level ${i}` });
                }
                break;
            case 'tvet_18_2':
            case 'skills_18_2':
                for(let i = 2; i <= 5; i++) {
                    levels.push({ value: `nqf${i}`, text: `NQF Level ${i}` });
                }
                break;
            case 'diploma':
                levels.push({ value: `level7`, text: `Level 6` });
                break;
            case 'unemployed_learnership':
            case 'employed_learnership':
                for(let i = 1; i <= 8; i++) {
                    levels.push({ value: `nqf${i}`, text: `NQF Level ${i}` });
                }
                break;
            case 'graduate':
                for(let i = 5; i <= 10; i++) {
                    levels.push({ value: `nqf${i}`, text: `NQF Level ${i}` });
                }
                break;
            case 'degree':
                for(let i = 7; i <= 9; i++) {
                    levels.push({ value: `nqf${i}`, text: `NQF Level ${i}` });
                }
                break;
            case 'oc_18_1':
            case 'oc_18_2':
           
                for(let i = 1; i <= 8; i++) {
                    levels.push({ value: `nqf${i}`, text: `NQF Level ${i}` });
                }
                break;
            default:
                levels = [];
        }
        setQualificationLevels(levels);
        // Only reset qualificationLevel if it's not a restoration from sessionStorage
        if (!sessionStorage.getItem('slaPreviewData')) {
            setFormData(prev => ({ ...prev, qualificationLevel: '' }));
        }
    };

    const handleServiceChange = (index, field, value) => {
        const updatedServices = [...formData.services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        setFormData(prev => ({ ...prev, services: updatedServices }));
    };

    const handleServiceRadioChange = (service) => {
        setFormData(prev => {
            const currentServices = prev.services || [];
            let updatedServices;
            
            if (currentServices.includes(service)) {
                // Remove service if already selected
                updatedServices = currentServices.filter(s => s !== service);
            } else {
                // Add service if not selected
                updatedServices = [...currentServices, service];
            }
            
            return { ...prev, services: updatedServices };
        });
    };

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, { type: 'trench1', recurring: false }]
        }));
    };

    const handleSLAFileSelect = () => {
        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.txt'; // Accept common document formats
        fileInput.style.display = 'none';
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setSlaFile(file);
                setSlaFileName(file.name);
            }
        };
        
        // Trigger file selection
        fileInput.click();
    };

    const removeService = (index) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index)
        }));
    };

    const handleFileSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '*/*';
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            const currentDocumentType = getDocumentType();
            
            const newAttachments = files.map(file => ({
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file,
                documentType: currentDocumentType
            }));
            setAttachments(prev => [...prev, ...newAttachments]);
        };
        
        input.click();
    };

    const getDocumentType = () => {
        // Get the selected service type from the first service
        if (formData.services && formData.services.length > 0) {
            const serviceType = formData.services[0].type;
            switch(serviceType) {
                case 'trench1':
                    return 'Award Letter';
                case 'trench2':
                    return 'Seta Contract';
                case 'trench3':
                    return 'SLA';
                default:
                    return 'Document';
            }
        }
        return 'Document';
    };

    const removeAttachment = (attachmentId) => {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    };

    const validateForm = () => {
        const errors = {};
        const requiredFields = {
            clientName: 'Company Name',
            clientReg: 'Registration Number',
            clientAddress: 'Registered Address',
            contactPerson: 'Contact Person',
            contactPosition: 'Position',
            contactPhone: 'Phone Number',
            contactEmail: 'Email Address',
            seta: 'SETA',
            sdlNumber: 'SDL Number',
            moderator: 'Project Manager',
            retainer: 'Monthly Retainer',
            qualificationType: 'Qualification Type',
            qualificationLevel: 'Qualification Level',

        };

        // Check for services array
        if (!formData.services || formData.services.length === 0) {
            errors.service = 'Services are required';
        }

        Object.keys(requiredFields).forEach(field => {
            const value = formData[field];
            if (!value || value.toString().trim() === '') {
                errors[field] = `${requiredFields[field]} is required`;
            } else {
                const fieldErrors = validateField(field, value);
                Object.assign(errors, fieldErrors);
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        
        try {
            // Create new client data for the Clients.js table with ALL form fields
            const newClient = {
                id: Date.now(),
                // Basic Information

                clientName: formData.clientName.trim(),
                clientReg: formData.clientReg.trim(),
                clientAddress: formData.clientAddress.trim(),
                
                // Contact Information
                contactPerson: formData.contactPerson.trim(),
                contactPosition: formData.contactPosition.trim(),
                contactPhone: formData.contactPhone.trim(),
                contactEmail: formData.contactEmail.trim(),
                
                // Business Details
                seta: formData.seta?.toUpperCase() || '',
                service: formData.services ? formData.services.join(', ') : '',
                sdlNumber: formData.sdlNumber.trim(),
                moderator: formData.moderator.trim(),
                qualificationType: formData.qualificationType || '',
                qualificationLevel: formData.qualificationLevel || '',
                dg: formData.dg || '',
                wspSubmitted: formData.wspSubmitted || '',
                wspReason: formData.wspReason || '',
                
                // Financial Information
                monthlyRetainer: parseFloat(formData.retainer) || 0,
                paymentTerms: `${formData.paymentTerms || '30'} Days`,

                totalValue: (parseFloat(formData.retainer) || 0) * 12, // Annual value
                
                // Additional Services with precise learner count
                services: formData.services || [],
                
                // Metadata
                createdFrom: 'regular',
                lastContact: new Date().toISOString().split('T')[0],
                nextFollowUp: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),

                
                // Files and Attachments
                slaFile: slaFileName || null,
                attachments: attachments || [],
                
                // System Fields
                status: 'Active',
                lastContact: new Date().toISOString().split('T')[0],
                nextFollowUp: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
                createdAt: new Date().toISOString()
            };

            // Save to localStorage for Clients.js table
            const existingClients = JSON.parse(localStorage.getItem('clientsData') || '[]');
            const updatedClients = [...existingClients, newClient];
            localStorage.setItem('clientsData', JSON.stringify(updatedClients));

            // Clear sessionStorage after successful submission
            sessionStorage.removeItem('slaPreviewData');
            
            console.log('Client saved successfully:', newClient);
            
            // Show success message and navigate to Clients page
            alert('Client created successfully!');
            navigate('/clients');
            
        } catch (error) {
            console.error('Error creating client:', error);
            alert('Error creating client. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewSLA = () => {
        // Store form data in sessionStorage for preview, including SLA file info
        const dataToStore = {
            ...formData,
            slaFileName: slaFileName,
            slaFile: slaFile
        };
        sessionStorage.setItem('slaPreviewData', JSON.stringify(dataToStore));
        // Navigate to preview page
        navigate('/sla-preview');
    };

    const getTabStatus = (tabName) => {
        const requiredFields = {
            basic: ['clientName', 'clientReg', 'clientAddress'],
            contact: ['contactPerson', 'contactPosition', 'contactPhone', 'contactEmail'],
            business: ['seta', 'sdlNumber', 'moderator', 'qualificationType', 'qualificationLevel', 'dg'],
            financial: ['retainer']
        };

        // Special handling for services array
        if (tabName === 'business') {
            const businessFields = ['seta', 'sdlNumber', 'moderator', 'qualificationType', 'qualificationLevel'];
            const businessCompleted = businessFields.every(field => formData[field] && formData[field].toString().trim() !== '');
            const servicesCompleted = formData.services && formData.services.length > 0;
            return businessCompleted && servicesCompleted ? 'completed' : 'incomplete';
        }

        const fields = requiredFields[tabName] || [];
        const completed = fields.every(field => formData[field] && formData[field].toString().trim() !== '');
        return completed ? 'completed' : 'incomplete';
    };

    const handleGuideComplete = () => {
        setShowGuide(false);
    };

    const handleGuideSkip = () => {
        setShowGuide(false);
    };

    const startGuide = () => {
        setShowGuide(true);
        // Reset to first tab when starting guide
        setActiveTab('basic');
    };

    // Handle tab changes from the guide
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    // (move all code from return into a variable)
    const pageContent = (
        <>


            {/* Progress Indicator */}
            <div className="hubspot-content">
                <div className="progress-indicator">
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        Form Completion: {progress}%
                    </span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Top Bar with Back and Guide Buttons */}
            <div className="top-bar">
                <div className="top-bar-left">
                    <button 
                        className="back-btn"
                        onClick={() => navigate('/clients')}
                        title="Back to Clients"
                    >
                        <i className="fas fa-arrow-left"></i>
                        <span>Back to Clients</span>
                    </button>
                </div>
                <div className="top-bar-actions">
                    <button 
                        className="guide-trigger-btn"
                        onClick={startGuide}
                        title="Start comprehensive guide"
                    >
                        <i className="fas fa-question-circle"></i>
                        <span>Start Guide</span>
                    </button>
                </div>
            </div>

            {/* HubSpot-style Form Content */}
            <div className="hubspot-content">
                <form onSubmit={handleSubmit} className="hubspot-form">
                    
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>Basic Information</h2>
                                <p>Enter the fundamental details about this client organization</p>
                            </div>
                            
                            <div className="form-section">

                                
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.clientName ? 'error' : ''}`}>
                                        <label htmlFor="clientName">Company Name</label>
                                        <input 
                                            type="text" 
                                            id="clientName" 
                                            name="clientName" 
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            placeholder="Enter the full company name"
                                            required 
                                        />
                                        {formErrors.clientName && (
                                            <div className="error-message">{formErrors.clientName}</div>
                                        )}
                                    </div>
                                    <div className={`form-group ${formErrors.clientReg ? 'error' : ''}`}>
                                        <label htmlFor="clientReg">Registration Number</label>
                                        <input 
                                            type="text" 
                                            id="clientReg" 
                                            name="clientReg" 
                                            value={formData.clientReg}
                                            onChange={handleInputChange}
                                            placeholder="Enter company registration number"
                                            required 
                                        />
                                        {formErrors.clientReg && (
                                            <div className="error-message">{formErrors.clientReg}</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className={`form-group ${formErrors.clientAddress ? 'error' : ''}`}>
                                    <label htmlFor="clientAddress">Registered Address</label>
                                    <textarea 
                                        id="clientAddress" 
                                        name="clientAddress" 
                                        value={formData.clientAddress}
                                        onChange={handleInputChange}
                                        placeholder="Enter the complete registered business address"
                                        rows="3"
                                        required 
                                    ></textarea>
                                    {formErrors.clientAddress && (
                                        <div className="error-message">{formErrors.clientAddress}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Details Tab */}
                    {activeTab === 'contact' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>Contact Information</h2>
                                <p>Primary contact details for this client organization</p>
                            </div>
                            
                            <div className="form-section">
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.contactPerson ? 'error' : ''}`}>
                                        <label htmlFor="contactPerson">Contact Person</label>
                                        <input 
                                            type="text" 
                                            id="contactPerson" 
                                            name="contactPerson" 
                                            value={formData.contactPerson}
                                            onChange={handleInputChange}
                                            placeholder="Enter the primary contact person's name"
                                            required 
                                        />
                                        {formErrors.contactPerson && (
                                            <div className="error-message">{formErrors.contactPerson}</div>
                                        )}
                                    </div>
                                    <div className={`form-group ${formErrors.contactPosition ? 'error' : ''}`}>
                                        <label htmlFor="contactPosition">Position</label>
                                        <input 
                                            type="text" 
                                            id="contactPosition" 
                                            name="contactPosition" 
                                            value={formData.contactPosition}
                                            onChange={handleInputChange}
                                            placeholder="Enter their job title or position"
                                            required 
                                        />
                                        {formErrors.contactPosition && (
                                            <div className="error-message">{formErrors.contactPosition}</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.contactPhone ? 'error' : ''}`}>
                                        <label htmlFor="contactPhone">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            id="contactPhone" 
                                            name="contactPhone" 
                                            value={formData.contactPhone}
                                            onChange={handleInputChange}
                                            placeholder="Enter contact phone number"
                                            required 
                                        />
                                        {formErrors.contactPhone && (
                                            <div className="error-message">{formErrors.contactPhone}</div>
                                        )}
                                    </div>
                                    <div className={`form-group ${formErrors.contactEmail ? 'error' : ''}`}>
                                        <label htmlFor="contactEmail">Email Address</label>
                                        <input 
                                            type="email" 
                                            id="contactEmail" 
                                            name="contactEmail" 
                                            value={formData.contactEmail}
                                            onChange={handleInputChange}
                                            placeholder="Enter contact email address"
                                            required 
                                        />
                                        {formErrors.contactEmail && (
                                            <div className="error-message">{formErrors.contactEmail}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Business Details Tab */}
                    {activeTab === 'business' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>Business Details</h2>
                                <p>SETA and service information for this client</p>
                            </div>
                            
                            <div className="form-section">
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.seta ? 'error' : ''}`}>
                                        <label htmlFor="seta">SETA</label>
                                        <select 
                                            id="seta" 
                                            name="seta" 
                                            value={formData.seta}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" disabled>Select SETA</option>
                                            <option value="wrseta">WRSETA</option>
                                            <option value="chieta">CHIETA</option>
                                            <option value="bankseta">BANKSETA</option>
                                            <option value="fasset">FASSET</option>
                                            <option value="cftl">CFTL</option>
                                            <option value="ceta">CETA</option>
                                            <option value="ctfl">CTFL</option>
                                            <option value="eseta">ESETA</option>
                                            <option value="hwseta">HWSETA</option>
                                            <option value="isett">MICT SETA</option>
                                            <option value="inseta">INSETA</option>
                                            <option value="lgseta">LGSETA</option>
                                            <option value="merseta">MERSETA</option>
                                            <option value="sassetta">SASSETA</option>
                                            <option value="agriseta">AGRISETA</option>
                                            <option value="dseta">DSETA</option>
                                            <option value="theta">FP&M SETA</option>
                                            <option value="teta">TETA</option>
                                        </select>
                                        {formErrors.seta && (
                                            <div className="error-message">{formErrors.seta}</div>
                                        )}
                                    </div>
                                    <div className={`form-group ${formErrors.service ? 'error' : ''}`}>
                                        <label>Services *</label>
                                        <div className="services-dropdown-container">
                                            <div 
                                                className="services-dropdown-trigger"
                                                onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                                            >
                                                <span className="services-placeholder">
                                                    {formData.services && formData.services.length > 0 
                                                        ? formData.services.join(', ') 
                                                        : 'Select Services'
                                                    }
                                                </span>
                                                <i className={`fas fa-chevron-down ${showServicesDropdown ? 'rotated' : ''}`}></i>
                                            </div>
                                            {showServicesDropdown && (
                                                <div className="services-dropdown-options">
                                                    {['BBBEE', 'Employment Equity', 'HR', 'WSP'].map((service) => (
                                                        <label key={service} className="service-option">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.services?.includes(service) || false}
                                                                onChange={() => handleServiceRadioChange(service)}
                                                            />
                                                            <span className="option-label">{service}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {formErrors.service && (
                                            <div className="error-message">{formErrors.service}</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.sdlNumber ? 'error' : ''}`}>
                                        <label htmlFor="sdlNumber">SDL Number</label>
                                        <input 
                                            type="text" 
                                            id="sdlNumber" 
                                            name="sdlNumber" 
                                            value={formData.sdlNumber}
                                            onChange={handleInputChange}
                                            placeholder="Enter SDL number"
                                            required 
                                        />
                                        {formErrors.sdlNumber && (
                                            <div className="error-message">{formErrors.sdlNumber}</div>
                                        )}
                                    </div>
                                    <div className={`form-group ${formErrors.moderator ? 'error' : ''}`}>
                                        <label htmlFor="moderator">Project Manager</label>
                                        <input 
                                            type="text" 
                                            id="moderator" 
                                            name="moderator" 
                                            value={formData.moderator}
                                            onChange={handleInputChange}
                                            placeholder="Enter project manager name"
                                            required 
                                        />
                                        {formErrors.moderator && (
                                            <div className="error-message">{formErrors.moderator}</div>
                                        )}
                                    </div>
                                </div>

                                                                <div className="section-header">
                                    <h3>Qualification Details</h3>
                                </div>
                                
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.qualificationType ? 'error' : ''}`}>
                                        <label htmlFor="qualificationType">Qualification Type</label>
                                        <select 
                                            id="qualificationType" 
                                            name="qualificationType" 
                                            value={formData.qualificationType}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" disabled>Select Qualification</option>
                                            <option value="diploma">Diploma (Graduate)</option>
                                            <option value="degree">Degree (Graduate)</option>
                                            <option value="ncv">NC(Vocational)</option>
                                            <option value="tvet_18_1">Learnership Programme (18.1)</option>
                                            <option value="tvet_18_2">Learnership Programme (18.2)</option>
                                            <option value="skills_18_1">Skills Programme (18.1)</option>
                                            <option value="skills_18_2">Skills Programme (18.2)</option>
                                            <option value="oc_18_1">Occupational Certificate (18.1)</option>
                                            <option value="oc_18_2">Occupational Certificate (18.2)</option>
                                            <option value="bursary">Bursary</option>
                                        </select>
                                        {formErrors.qualificationType && (
                                            <div className="error-message">{formErrors.qualificationType}</div>
                                        )}
                                    </div>
                                    <div className={`form-group ${formErrors.qualificationLevel ? 'error' : ''}`}>
                                        <label htmlFor="qualificationLevel">Qualification Level</label>
                                        <select 
                                            id="qualificationLevel" 
                                            name="qualificationLevel" 
                                            value={formData.qualificationLevel}
                                            onChange={handleInputChange}
                                      
                                            required
                                        >
                                            <option value="" disabled>Select Level</option>
                                            {qualificationLevels.map((level, index) => (
                                                <option key={index} value={level.value}>
                                                    {level.text}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.qualificationLevel && (
                                            <div className="error-message">{formErrors.qualificationLevel}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="section-header">
                                    <h3>DG & WSP Information</h3>
                                </div>
                                
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.dg ? 'error' : ''}`}>
                                        <label htmlFor="dg">DG (Designated Group)</label>
                                        <select 
                                            id="dg" 
                                            name="dg" 
                                            value={formData.dg}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select DG</option>
                                            <option value="23-24">23-24</option>
                                            <option value="25-26">25-26</option>
                                            <option value="27-28">27-28</option>
                                            <option value="29-30">29-30</option>
                                            <option value="31-32">31-32</option>
                                            <option value="33-34">33-34</option>
                                            <option value="35-36">35-36</option>
                                            <option value="37-38">37-38</option>
                                            <option value="39-40">39-40</option>
                                            <option value="41-42">41-42</option>
                                            <option value="43-44">43-44</option>
                                            <option value="45-46">45-46</option>
                                            <option value="47-48">47-48</option>
                                            <option value="49-50">49-50</option>
                                            <option value="51-52">51-52</option>
                                            <option value="53-54">53-54</option>
                                            <option value="55-56">55-56</option>
                                            <option value="57-58">57-58</option>
                                            <option value="59-60">59-60</option>
                                            <option value="61-62">61-62</option>
                                            <option value="63-64">63-64</option>
                                            <option value="65-66">65-66</option>
                                            <option value="67-68">67-68</option>
                                            <option value="69-70">69-70</option>
                                            <option value="71-72">71-72</option>
                                            <option value="73-74">73-74</option>
                                            <option value="75-76">75-76</option>
                                            <option value="77-78">77-78</option>
                                            <option value="79-80">79-80</option>
                                            <option value="81-82">81-82</option>
                                            <option value="83-84">83-84</option>
                                            <option value="85-86">85-86</option>
                                            <option value="87-88">87-88</option>
                                            <option value="89-90">89-90</option>
                                            <option value="91-92">91-92</option>
                                            <option value="93-94">93-94</option>
                                            <option value="95-96">95-96</option>
                                            <option value="97-98">97-98</option>
                                            <option value="99-100">99-100</option>
                                        </select>
                                        {formErrors.dg && (
                                            <div className="error-message">{formErrors.dg}</div>
                                        )}
                                    </div>
                                    <div className={`form-group ${formErrors.wspSubmitted ? 'error' : ''}`}>
                                        <label htmlFor="wspSubmitted">WSP Submitted</label>
                                        <select 
                                            id="wspSubmitted" 
                                            name="wspSubmitted" 
                                            value={formData.wspSubmitted}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                        {formErrors.wspSubmitted && (
                                            <div className="error-message">{formErrors.wspSubmitted}</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.wspReason ? 'error' : ''}`}>
                                        <label htmlFor="wspReason">WSP Reason</label>
                                        <textarea 
                                            id="wspReason" 
                                            name="wspReason" 
                                            value={formData.wspReason}
                                            onChange={handleInputChange}
                                            placeholder="Enter reason for WSP status"
                                            rows="3"
                                        />
                                        {formErrors.wspReason && (
                                            <div className="error-message">{formErrors.wspReason}</div>
                                        )}
                                    </div>
                                </div>
 
                            </div>
                        </div>
                    )}

                    {/* Financial Information Tab */}
                    {activeTab === 'financial' && (
                        <div className="tab-content">
                            <div className="section-header">
                                <h2>Financial Information</h2>
                                <p>Pricing and payment details for this client</p>
                            </div>
                            
                            <div className="form-section">
                                <div className="form-row">
                                    <div className={`form-group ${formErrors.retainer ? 'error' : ''}`}>
                                        <label htmlFor="retainer">Monthly Retainer (R)</label>
                                        <input 
                                            type="number" 
                                            id="retainer" 
                                            name="retainer" 
                                            step="0.01" 
                                            value={formData.retainer}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            required 
                                        />
                                        {formErrors.retainer && (
                                            <div className="error-message">{formErrors.retainer}</div>
                                        )}
                                    </div>

                                </div>

                                <div className="section-header">
                                    <h3>Additional Services</h3>
                                </div>
                                
                                <div className="services-section">
                                    {formData.services.map((service, index) => (
                                        <div key={index} className="service-item">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Document Type</label>
                                                    <select 
                                                        value={service.type}
                                                        onChange={(e) => handleServiceChange(index, 'type', e.target.value)}
                                                    >
                                                        <option value="trench1">Award Letter</option>
                                                        <option value="trench2">Seta Contract</option>
                                                        <option value="trench3">SLA</option>
                                                    </select>
                                                </div>

                                                {formData.services.length > 1 && (
                                                    <div className="form-group">
                                                        <button 
                                                            type="button" 
                                                            className="remove-service-btn" 
                                                            onClick={() => removeService(index)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button type="button" className="add-service-btn" onClick={handleFileSelect}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 1L8 15M1 8L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        Upload attachment
                                    </button>
                                </div>

                                {/* Attachments Section */}
                                
                                <div className="form-section">
                                    {attachments.length > 0 && (
                                        <div className="attachments-list">
                                            {attachments
                                                .filter(attachment => attachment.documentType === getDocumentType())
                                                .map((attachment) => (
                                                <div key={attachment.id} className="attachment-item">
                                                    <div className="attachment-info">
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M8 1L15 8L8 15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        <span className="attachment-name">{attachment.name}</span>
                                                        <span className="attachment-type">({attachment.documentType})</span>
                                                        <span className="attachment-size">
                                                            ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        className="remove-attachment-btn" 
                                                        onClick={() => removeAttachment(attachment.id)}
                                                        title="Remove attachment"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>

                                {/* Create Client Button */}
                                <div className="form-section" style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <button 
                                        type="button"
                                        className="button" 
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        style={{ 
                                            padding: '12px 32px', 
                                            fontSize: '16px', 
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: '#006400',
                                            color: 'white'
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px' }}>
                                                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="32"/>
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            'Create client'
                                        )}
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* HubSpot-style Navigation Tabs */}
            <div className="hubspot-tabs">
                <div className="tab-container">
                    <button 
                        className={`tab ${activeTab === 'basic' ? 'active' : ''} ${getTabStatus('basic') === 'completed' ? 'completed' : ''}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="currentColor"/>
                        </svg>
                        Basic Information
                        {getTabStatus('basic') === 'completed' && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '8px' }}>
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#10b981"/>
                            </svg>
                        )}
                    </button>
                    <button 
                        className={`tab ${activeTab === 'contact' ? 'active' : ''} ${getTabStatus('contact') === 'completed' ? 'completed' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M14 2H2C1.45 2 1 2.45 1 3V13C1 13.55 1.45 14 2 14H14C14.55 14 15 13.55 15 13V3C15 2.45 14.55 2 14 2ZM14 4L8 8.5L2 4V3L8 7.5L14 3V4Z" fill="currentColor"/>
                        </svg>
                        Contact Details
                        {getTabStatus('contact') === 'completed' && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '8px' }}>
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#10b981"/>
                            </svg>
                        )}
                    </button>
                    <button 
                        className={`tab ${activeTab === 'business' ? 'active' : ''} ${getTabStatus('business') === 'completed' ? 'completed' : ''}`}
                        onClick={() => setActiveTab('business')}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 2H4C2.9 2 2 2.9 2 4V12C2 13.1 2.9 14 4 14H12C13.1 14 14 13.1 14 12V4C14 2.9 13.1 2 12 2ZM12 12H4V4H12V12Z" fill="currentColor"/>
                        </svg>
                        Business Details
                        {getTabStatus('business') === 'completed' && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '8px' }}>
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#10b981"/>
                            </svg>
                        )}
                    </button>
                    <button 
                        className={`tab ${activeTab === 'financial' ? 'active' : ''} ${getTabStatus('financial') === 'completed' ? 'completed' : ''}`}
                        onClick={() => setActiveTab('financial')}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14ZM7 4H9V8H13V10H9V14H7V10H3V8H7V4Z" fill="currentColor"/>
                        </svg>
                        Financial Information
                        {getTabStatus('financial') === 'completed' && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '8px' }}>
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#10b981"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <HubSpotLayout 
            title="Create Client" 
            description="Create a new client record"
        >
            {pageContent}
            <FormGuide
                isActive={showGuide}
                onComplete={handleGuideComplete}
                onSkip={handleGuideSkip}
                onTabChange={handleTabChange}
                currentTab={activeTab}
                steps={[
                    {
                        target: '.progress-indicator',
                        title: 'Welcome to Client Creation',
                        description: 'This progress bar shows your completion percentage. Let\'s start with the basic information section.',
                        position: 'bottom'
                    },

                    {
                        target: 'input[name="clientName"]',
                        title: 'Company Name',
                        description: 'Enter the official company name exactly as it appears on business registration documents. This is used for legal compliance and official records.',
                        position: 'bottom'
                    },
                    {
                        target: 'input[name="clientReg"]',
                        title: 'Registration Number',
                        description: 'Enter the company registration number. This is crucial for legal compliance, tax purposes, and official documentation.',
                        position: 'bottom'
                    },
                    {
                        target: 'textarea[name="clientAddress"]',
                        title: 'Business Address',
                        description: 'Provide the complete registered business address including street address, city, province, and postal code.',
                        position: 'bottom'
                    },
                    {
                        target: 'input[name="contactPerson"]',
                        title: 'Moving to Contact Details',
                        description: 'Great! Basic information is complete. Now let\'s add the primary contact person details. I\'ll automatically switch to the Contact tab for you.',
                        position: 'bottom',
                        switchToTab: 'contact'
                    },
                    {
                        target: 'input[name="contactPerson"]',
                        title: 'Primary Contact',
                        description: 'Enter the full name of the person who will be our main point of communication for all training matters.',
                        position: 'bottom'
                    },
                    {
                        target: 'input[name="contactPosition"]',
                        title: 'Contact Position',
                        description: 'Enter their job title or position (e.g., HR Manager, Training Director, Operations Manager).',
                        position: 'bottom'
                    },
                    {
                        target: 'input[name="contactPhone"]',
                        title: 'Phone Number',
                        description: 'Enter their phone number. Include country code if international (e.g., +27 11 123 4567).',
                        position: 'bottom'
                    },
                    {
                        target: 'input[name="contactEmail"]',
                        title: 'Email Address',
                        description: 'Enter their email address. This will be used for all official communications, updates, and training materials.',
                        position: 'bottom'
                    },
                    {
                        target: 'select[name="seta"]',
                        title: 'Moving to Business Details',
                        description: 'Excellent! Contact details are set. Now let\'s configure the business and training requirements. I\'ll automatically switch to the Business tab.',
                        position: 'bottom',
                        switchToTab: 'business'
                    },
                    {
                        target: 'select[name="seta"]',
                        title: 'SETA Selection',
                        description: 'Select the appropriate SETA (Sector Education and Training Authority) that governs this client\'s industry and training requirements.',
                        position: 'bottom'
                    },
                    {
                        target: 'select[name="service"]',
                        title: 'Training Service',
                        description: 'Choose the primary training service this client needs. This helps us tailor the program structure to their specific requirements.',
                        position: 'bottom'
                    },
                    {
                        target: 'input[name="sdlNumber"]',
                        title: 'SDL Number',
                        description: 'Enter the Skills Development Levy (SDL) number. This is mandatory for SETA compliance and determines funding eligibility.',
                        position: 'bottom'
                    },
                    {
                        target: 'input[name="moderator"]',
                        title: 'Assigned Moderator',
                        description: 'Enter the name of the moderator who will oversee, assess, and ensure quality standards for the training programs.',
                        position: 'bottom'
                    },
                    {
                        target: 'select[name="qualificationType"]',
                        title: 'Qualification Type',
                        description: 'Select the type of qualification. This determines the training program structure, duration, and assessment methods.',
                        position: 'bottom'
                    },
                    {
                        target: 'select[name="qualificationLevel"]',
                        title: 'Qualification Level',
                        description: 'Choose the specific qualification level. Available options will update based on your qualification type selection.',
                        position: 'bottom'
                    },
                    {
                        target: 'input[name="retainer"]',
                        title: 'Moving to Financial Information',
                        description: 'Perfect! Business details are configured. Now let\'s set up the financial terms and pricing. I\'ll automatically switch to the Financial tab.',
                        position: 'bottom',
                        switchToTab: 'financial'
                    },
                    {
                        target: 'input[name="retainer"]',
                        title: 'Monthly Retainer',
                        description: 'Enter the monthly retainer amount. This is the ongoing fee for our training services, support, and program management.',
                        position: 'bottom'
                    },

                    {
                        target: 'select[name="paymentTerms"]',
                        title: 'Payment Terms',
                        description: 'Select payment terms (e.g., 30 days). This determines when payments are due after invoicing.',
                        position: 'bottom'
                    },
                    {
                        target: '.services-section',
                        title: 'Additional Services',
                        description: 'Here you can add additional training services. Each service can have different document types and learner counts.',
                        position: 'bottom'
                    },
                    {
                        target: 'select[value="trench1"]',
                        title: 'Document Type',
                        description: 'Select the type of document for this service: Award Letter, SETA Contract, or SLA (Service Level Agreement).',
                        position: 'bottom'
                    },

                    {
                        target: '.add-service-btn',
                        title: 'Add More Services',
                        description: 'Click "Upload attachment" to add additional services with different document types and learner counts.',
                        position: 'bottom'
                    },
                    {
                        target: '.attachments-list',
                        title: 'Document Attachments',
                        description: 'Here you can see uploaded documents. You can remove attachments by clicking the X button.',
                        position: 'bottom'
                    },
                    {
                        target: 'button[type="submit"]',
                        title: 'Create Client',
                        description: 'Excellent! All sections are complete. Click "Create Client" to save this client record to your system.',
                        position: 'top'
                    },
                    {
                        target: '.btn-secondary',
                        title: 'Preview SLA',
                        description: 'Alternatively, you can preview the Service Level Agreement (SLA) to review all terms before creating the client.',
                        position: 'top'
                    }
                ]}
            />
        </HubSpotLayout>
    );
};

export default ClientCreation; 
