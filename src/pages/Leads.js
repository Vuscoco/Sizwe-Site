import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HubSpotLayout from '../components/HubSpotLayout';
import GridCardGuide from '../components/GridCardGuide';
import '../css/Leads.css';

// Utility function for comprehensive lead-to-client conversion
const convertLeadToClientData = (leadData, additionalData = {}) => {
    // Validate that we have the minimum required data
    if (!leadData || !leadData.company_name) {
        console.error('Invalid lead data for conversion:', leadData);
        throw new Error('Invalid lead data for conversion');
    }
    
    const convertedData = {
        id: Date.now(),
        
        // Basic Information - CORRECTED mapping from lead form to client form
        clientName: leadData.company_name || '',                       // Company Name → Company Name
        clientReg: '',                                                 // Registration Number (empty - to be filled manually)
        clientAddress: leadData.business_address || '',                // Business Address → Registered Address (CORRECTED)
        
        // Contact Information - CORRECTED mapping
        contactPerson: leadData.contact_person || '',                  // Lead Manager → Contact Person
        contactPosition: '',                                           // Position (empty - to be filled manually)
        contactPhone: leadData.company_phone || '',                    // Company Phone → Phone Number (CORRECTED)
        contactEmail: leadData.contact_email || '',                    // Contact Email → Email Address
        
        // Business Details - Direct one-to-one mapping
        seta: leadData.seta || 'wrseta',                               // SETA → SETA
        service: leadData.services ? leadData.services.join(', ') : 'WSP', // Services → Services
        sdlNumber: leadData.sdl_number || '',                          // SDL Number → SDL Number
        moderator: leadData.contact_person || '',                      // Lead Manager → Project Manager
        
        // Financial Information
        monthlyRetainer: leadData.estimated_value ? parseFloat(leadData.estimated_value) / 12 : 0,
        totalValue: leadData.estimated_value || 0,
        
        // Services array for client form
        services: leadData.services || ['WSP'],
        
        // Attachments and Documents
        attachments: leadData.attachments || [],
        documentType: leadData.documentType || 'SLA',
        
        // Status and Metadata
        status: 'Active',
        lastContact: new Date().toISOString().split('T')[0],
        nextFollowUp: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        
        // Conversion tracking
        originalLeadId: leadData.id,
        convertedAt: new Date().toISOString(),
        
        // Location Information - CORRECTED MAPPING
        province: leadData.province || '',                             // Province → Province (CORRECTED)
        country: leadData.country || '',                               // Country → Country
        city: leadData.city || '',                                     // City → City (CORRECTED)
        
        // Additional fields for complete data preservation
        leadManager: leadData.contact_person || '',                    // Lead Manager → Lead Manager
        companyPhone: leadData.company_phone || '',                    // Company Phone → Company Phone (CORRECTED)
        
        // Preserve any additional custom fields
        ...(leadData.custom_fields && { customFields: leadData.custom_fields }),
        ...(additionalData.customFields && { customFields: additionalData.customFields }),
        
        // Additional data passed in
        ...additionalData
    };
    
    // Log the conversion for debugging
    console.log('Lead to Client Conversion:', {
        originalLead: leadData,
        additionalData: additionalData,
        convertedClient: convertedData
    });
    
    return convertedData;
};

const Leads = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showServicesDropdown, setShowServicesDropdown] = useState(false);
    const [showLeadManagerDropdown, setShowLeadManagerDropdown] = useState(false);
    const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);
    const [showEditServicesDropdown, setShowEditServicesDropdown] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showHistoryActionModal, setShowHistoryActionModal] = useState(false);
    const [historyFormMode, setHistoryFormMode] = useState('create'); // 'create' or 'history'
    const [showHistoryMode, setShowHistoryMode] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Helper function to abbreviate document types
    const abbreviateDocumentType = (documentType, attachments = []) => {
        if (!documentType || documentType === 'N/A') return 'N/A';
        
        const docType = documentType.toLowerCase();
        const abbreviations = [];
        
        // Check for SDF (various forms)
        if (docType.includes('sdf') || 
            docType.includes('sdf appointment letter') || 
            docType.includes('sdf appointment') ||
            docType.includes('appointment letter')) {
            abbreviations.push('SDF');
        }
        
        // Check for SLA (various forms)
        if (docType.includes('sla') || 
            docType.includes('service level agreement') || 
            docType.includes('service level') ||
            docType.includes('level agreement')) {
            abbreviations.push('SLA');
        }
        
        // If we have attachments, check for additional document types
        if (attachments && attachments.length > 0) {
            const attachmentTypes = attachments.map(att => att.documentType?.toLowerCase());
            
            if (attachmentTypes.includes('sla') || attachmentTypes.includes('service level agreement')) {
                if (!abbreviations.includes('SLA')) {
                    abbreviations.push('SLA');
                }
            }
            
            if (attachmentTypes.includes('sdf') || attachmentTypes.includes('sdf appointment letter')) {
                if (!abbreviations.includes('SDF')) {
                    abbreviations.push('SDF');
                }
            }
        }
        
        // If no abbreviations found, return original
        return abbreviations.length > 0 ? abbreviations.join(', ') : documentType;
    };

    // Helper function to format services display for table
    const formatServicesDisplay = (services) => {
        if (!services || services.length === 0) return 'N/A';
        
        if (services.length === 1) {
            return services[0];
        }
        
        // If multiple services, show first service + "etc."
        return `${services[0]} etc.`;
    };

    const handleExportLeads = () => {
        setShowExportModal(true);
    };

    const handleExportSubmit = () => {
        setIsExporting(true);
        // Simulate export process
        setTimeout(() => {
            setIsExporting(false);
            setShowExportModal(false);
            // Here you would typically trigger the actual export functionality
            console.log('Exporting leads...');
        }, 2000);
    };

    const handleExportCancel = () => {
        setShowExportModal(false);
    };

    const [showGuide, setShowGuide] = useState(false);

    // Form data for creating new lead
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        company_rep: '',
        company_phone: '',
        country: '',
        business_address: '',
        province: '',
        contact_email: '',
        city: '',
        seta: '',
        service_interest: '',
        services: [],
        documentType: '',
        attachmentType: '',
        estimated_value: ''
    });

    // Form data for converting to quotation
    const [quotationData, setQuotationData] = useState({
        title: '',
        total_value: '',
        payment_terms: '30',
        sla_sda: '',
        services: [],
        documentType: '',
        uploadedFiles: [],
        notes: ''
    });

    // Form data for history leads
    const [historyFormData, setHistoryFormData] = useState({
        clientName: '',
        clientReg: '',
        clientAddress: '',
        province: '',
        country: '',
        city: '',
        contactPerson: '',
        contactPosition: '',
        contactPhone: '',
        contactEmail: '',
        companyPhone: '',
        companyRep: '',
        leadManager: '',
        conceptionDate: new Date().toISOString().split('T')[0],
        dg: '',
        wspSubmitted: '',
        wspReason: '',
        retainer: '',
        seta: '',
        services: [],
        sdlNumber: '',
        documentType: '',
        attachments: []
    });

    useEffect(() => {
        // Initialize sample data if localStorage is empty
        const existingLeads = localStorage.getItem('leadsData');
        if (!existingLeads) {
            const sampleLeads = [
                {
                    id: 1,
                    company_name: 'TechCorp Solutions',
                    contact_person: 'John Smith',
                    business_address: '123 Tech Street, Johannesburg',
                    province: 'Gauteng',
                    contact_email: 'john@techcorp.co.za',
                    company_phone: '+27 11 123 4567',
                    city: 'Johannesburg',
                    service_interest: 'wsp',
                    seta: 'wrseta',
                    estimated_value: 50000,
                    status: 'pending',
                    created_date: '2024-01-15',
                    notes: 'Interested in WSP training programs'
                },
                {
                    id: 2,
                    company_name: 'Innovation Labs',
                    contact_person: 'Sarah Johnson',
                    business_address: '456 Innovation Drive, Cape Town',
                    province: 'Western Cape',
                    contact_email: 'sarah@innovationlabs.co.za',
                    company_phone: '+27 21 987 6543',
                    city: 'Cape Town',
                    service_interest: 'accreditation',
                    seta: 'wrseta',
                    estimated_value: 75000,
                    status: 'converted',
                    created_date: '2024-01-10',
                    notes: 'Successfully converted to quotation'
                },
                {
                    id: 3,
                    company_name: 'Future Skills Academy',
                    contact_person: 'Mike Wilson',
                    business_address: '789 Skills Avenue, Durban',
                    province: 'KwaZulu-Natal',
                    contact_email: 'mike@futureskills.co.za',
                    company_phone: '+27 31 456 7890',
                    city: 'Durban',
                    service_interest: 'skills_program',
                    seta: 'wrseta',
                    estimated_value: 120000,
                    status: 'converted',
                    created_date: '2024-01-05',
                    notes: 'Large skills development project'
                },
                {
                    id: 4,
                    company_name: 'Digital Dynamics',
                    contact_person: 'Lisa Brown',
                    business_address: '321 Digital Road, Pretoria',
                    province: 'Gauteng',
                    contact_email: 'lisa@digitaldynamics.co.za',
                    company_phone: '+27 12 345 6789',
                    city: 'Pretoria',
                    service_interest: 'wsp',
                    seta: 'wrseta',
                    estimated_value: 35000,
                    status: 'qualified',
                    created_date: '2024-01-20',
                    notes: 'Ready for quotation'
                },
                {
                    id: 5,
                    company_name: 'Smart Solutions',
                    contact_person: 'David Lee',
                    business_address: '654 Smart Boulevard, Port Elizabeth',
                    province: 'Eastern Cape',
                    contact_email: 'david@smartsolutions.co.za',
                    company_phone: '+27 27 111 2222',
                    city: 'Port Elizabeth',
                    service_interest: 'accreditation',
                    seta: 'wrseta',
                    estimated_value: 90000,
                    status: 'converted',
                    created_date: '2024-01-12',
                    notes: 'Accreditation services completed'
                }
            ];
            localStorage.setItem('leadsData', JSON.stringify(sampleLeads));
        }
        
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            setLoading(true);
            // Try API first, fallback to localStorage
            try {
                const response = await fetch('http://localhost:8000/api/leads/');
                if (response.ok) {
                    const data = await response.json();
                    // Backend now has the correct field names, no mapping needed
                    const mappedData = data.map(lead => ({
                        ...lead,
                        // Ensure documentType field is properly mapped
                        documentType: lead.document_type || ''
                    }));
                    setLeads(mappedData);
                    // Also save to localStorage for consistency
                    localStorage.setItem('leadsData', JSON.stringify(mappedData));
                } else {
                    throw new Error('API failed');
                }
            } catch (apiError) {
                // Fallback to localStorage
                const storedLeads = localStorage.getItem('leadsData');
                if (storedLeads) {
                    const parsedLeads = JSON.parse(storedLeads);
                    // Check if we need to update old 'new' status to 'pending' and ensure estimated_value is numeric
                    const updatedLeads = parsedLeads.map(lead => ({
                        ...lead,
                        status: lead.status === 'new' ? 'pending' : lead.status,
                        estimated_value: parseFloat(lead.estimated_value) || 0
                    }));
                    setLeads(updatedLeads);
                    localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
                } else {
                    // Initialize with sample data if no localStorage data exists
                    const sampleLeads = [
                        {
                            id: 1,
                            company_name: 'TechCorp Solutions',
                            contact_person: 'John Smith',
                            business_address: '123 Tech Street, Johannesburg',
                            province: 'Gauteng',
                            contact_email: 'john@techcorp.co.za',
                            company_phone: '+27 11 123 4567',
                            city: 'Johannesburg',
                            service_interest: 'wsp',
                            seta: 'wrseta',
                            estimated_value: 50000,
                            status: 'pending',
                            created_date: '2024-01-15',
                            notes: 'Interested in WSP training programs'
                        },
                        {
                            id: 2,
                            company_name: 'Innovation Labs',
                            contact_person: 'Sarah Johnson',
                            business_address: '456 Innovation Drive, Cape Town',
                            province: 'Western Cape',
                            contact_email: 'sarah@innovationlabs.co.za',
                            company_phone: '+27 21 987 6543',
                            city: 'Cape Town',
                            service_interest: 'accreditation',
                            seta: 'wrseta',
                            estimated_value: 75000,
                            status: 'converted',
                            created_date: '2024-01-10',
                            notes: 'Successfully converted to quotation'
                        },
                        {
                            id: 3,
                            company_name: 'Future Skills Academy',
                            contact_person: 'Mike Wilson',
                            business_address: '789 Skills Avenue, Durban',
                            province: 'KwaZulu-Natal',
                            contact_email: 'mike@futureskills.co.za',
                            company_phone: '+27 31 456 7890',
                            city: 'Durban',
                            service_interest: 'skills_program',
                            seta: 'wrseta',
                            estimated_value: 120000,
                            status: 'converted',
                            created_date: '2024-01-05',
                            notes: 'Large skills development project'
                        },
                        {
                            id: 4,
                            company_name: 'Digital Dynamics',
                            contact_person: 'Lisa Brown',
                            business_address: '321 Digital Road, Pretoria',
                            province: 'Gauteng',
                            contact_email: 'lisa@digitaldynamics.co.za',
                            company_phone: '+27 12 345 6789',
                            city: 'Pretoria',
                            service_interest: 'wsp',
                            seta: 'wrseta',
                            estimated_value: 35000,
                            status: 'qualified',
                            created_date: '2024-01-20',
                            notes: 'Ready for quotation'
                        },
                        {
                            id: 5,
                            company_name: 'Smart Solutions',
                            contact_person: 'David Lee',
                            business_address: '654 Smart Boulevard, Port Elizabeth',
                            province: 'Eastern Cape',
                            contact_email: 'david@smartsolutions.co.za',
                            company_phone: '+27 27 111 2222',
                            city: 'Port Elizabeth',
                            service_interest: 'accreditation',
                            seta: 'wrseta',
                            estimated_value: 90000,
                            status: 'converted',
                            created_date: '2024-01-12',
                            notes: 'Accreditation services completed'
                        }
                    ];
                    setLeads(sampleLeads);
                    localStorage.setItem('leadsData', JSON.stringify(sampleLeads));
                }
            }
        } catch (err) {
            console.error('Error loading leads:', err);
            setError('Error loading leads');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };



    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showServicesDropdown && !event.target.closest('.services-dropdown-container')) {
                setShowServicesDropdown(false);
            }
                            if (showLeadManagerDropdown && !event.target.closest('.lead-manager-dropdown-container')) {
            setShowLeadManagerDropdown(false);
        }
        if (showServicesDropdown && !event.target.closest('.services-dropdown-container')) {
            setShowServicesDropdown(false);
        }
        if (showEditServicesDropdown && !event.target.closest('.edit-services-dropdown-container')) {
            setShowEditServicesDropdown(false);
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showServicesDropdown, showLeadManagerDropdown]);

    const handleFileSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '*/*';
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            const selectedDocumentType = formData.documentType || 'Other';
            
            const newAttachments = files.map(file => ({
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file,
                documentType: selectedDocumentType
            }));
            setAttachments(prev => [...prev, ...newAttachments]);
        };
        
        input.click();
    };

    const getDocumentType = () => {
        // Get the selected services from the form
        if (formData.services && formData.services.length > 0) {
            const serviceType = formData.services[0];
            switch(serviceType) {
                case 'Employment Equity':
                    return 'SLA';
                case 'BBBEE':
                    return 'SLA';
                case 'Industry Funded':
                    return 'SLA';
                case 'SETA Funded':
                    return 'SLA';
                case 'HR':
                case 'WSP':
                    return 'SDF Appointment Letter';
                default:
                    return 'SLA';
            }
        }
        return 'SLA';
    };

    // Handle service checkbox changes
    const handleServiceRadioChange = (service) => {
        setFormData(prev => {
            const currentServices = prev.services || [];
            const isSelected = currentServices.includes(service);
            
            let newServices;
            if (isSelected) {
                // Remove service if already selected
                newServices = currentServices.filter(s => s !== service);
            } else {
                // Add service if not selected
                newServices = [...currentServices, service];
            }

            return {
                ...prev,
                services: newServices
            };
        });
    };

    const handleEditServiceRadioChange = (service) => {
        setEditFormData(prev => {
            const currentServices = prev.services || [];
            const isSelected = currentServices.includes(service);
            
            let newServices;
            if (isSelected) {
                // Remove service if already selected
                newServices = currentServices.filter(s => s !== service);
            } else {
                // Add service if not selected
                newServices = [...currentServices, service];
            }

            return {
                ...prev,
                services: newServices
            };
        });
    };

    const removeAttachment = (attachmentId) => {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    };

    // File preview functionality - simplified to open directly
    const handleFilePreview = (attachment) => {
        const file = attachment.file;
        const fileType = file.type || '';
        const fileName = file.name.toLowerCase();
        
        // Check for Office file types and open directly in corresponding applications
        const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp'];
        const isOfficeFile = officeExtensions.some(ext => fileName.endsWith(ext));
        
        if (isOfficeFile) {
            // Automatically open Office files in their corresponding applications
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = file.name;
            link.click();
            
            // Clean up the object URL after a short delay
            setTimeout(() => {
                URL.revokeObjectURL(link.href);
            }, 1000);
            
            // Show a brief notification that the file is being opened
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
            `;
            notification.textContent = `Opening ${file.name} in Office application...`;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
            
        } else if (fileType.startsWith('image/') || 
                   fileType === 'application/pdf' || 
                   fileType.startsWith('text/')) {
            
            const reader = new FileReader();
            reader.onload = (e) => {
                // Open the file directly in a new tab
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>${file.name}</title>
                                <style>
                                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
                                    .close-btn { background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
                                    .close-btn:hover { background: #c82333; }
                                    .content { max-width: 100%; }
                                    img { max-width: 100%; height: auto; }
                                    iframe { width: 100%; height: 80vh; border: none; }
                                    pre { background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; }
                                </style>
                            </head>
                            <body>
                                <div class="header">
                                    <h2>${file.name}</h2>
                                    <button class="close-btn" onclick="window.close()">Close</button>
                                </div>
                                <div class="content">
                                    ${fileType.startsWith('image/') 
                                        ? `<img src="${e.target.result}" alt="${file.name}">`
                                        : fileType === 'application/pdf'
                                        ? `<iframe src="${e.target.result}"></iframe>`
                                        : `<pre>${e.target.result}</pre>`
                                    }
                                </div>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                }
            };
            
            if (fileType.startsWith('text/')) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        } else {
            // For other file types, show a message and offer download
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${file.name}</title>
                            <style>
                                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center; }
                                .container { max-width: 600px; margin: 50px auto; padding: 40px; background: #f8f9fa; border-radius: 8px; }
                                .icon { font-size: 48px; color: #6c757d; margin-bottom: 20px; }
                                .download-btn { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; margin: 10px; }
                                .download-btn:hover { background: #0056b3; }
                                .close-btn { background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; margin: 10px; }
                                .close-btn:hover { background: #545b62; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="icon">📄</div>
                                <h2>${file.name}</h2>
                                <p>File Type: ${file.type || 'Unknown'}</p>
                                <p>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <p>This file type cannot be previewed in the browser.</p>
                                <button class="download-btn" onclick="downloadFile()">Download File</button>
                                <button class="close-btn" onclick="window.close()">Close</button>
                            </div>
                            <script>
                                function downloadFile() {
                                    const link = document.createElement('a');
                                    link.href = '${URL.createObjectURL(file)}';
                                    link.download = '${file.name}';
                                    link.click();
                                }
                            </script>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            }
        }
    };

    const handleQuotationInputChange = (e) => {
        const { name, value } = e.target;
        setQuotationData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleServicesChange = (service) => {
        setQuotationData(prev => {
            const currentServices = prev.services || [];
            const isSelected = currentServices.includes(service);
            
            if (isSelected) {
                // Remove service if already selected
                return {
                    ...prev,
                    services: currentServices.filter(s => s !== service)
                };
            } else {
                // Add service if not selected
                return {
                    ...prev,
                    services: [...currentServices, service]
                };
            }
        });
    };

    const handleDocumentTypeChange = (documentType) => {
        setQuotationData(prev => ({
            ...prev,
            documentType: documentType
        }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            service: quotationData.services[0] || 'General',
            documentType: quotationData.documentType || 'Document'
        }));
        
        setQuotationData(prev => ({
            ...prev,
            uploadedFiles: [...(prev.uploadedFiles || []), ...newFiles]
        }));
    };

    const removeUploadedFile = (fileId) => {
        setQuotationData(prev => ({
            ...prev,
            uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId)
        }));
    };



    const handleCreateLead = async (e) => {
        e.preventDefault();
        
        console.log('handleCreateLead called with formData:', formData);
        
        // Minimal validation - only require company name for basic identification
        if (!formData.company_name.trim()) {
            // Set a default company name if none provided
            formData.company_name = 'Unnamed Company';
        }
        
        console.log('Creating lead with minimal validation...');
        
        try {
            // Create new lead object
            const newLead = {
                id: Date.now(),
                company_name: formData.company_name,
                contact_person: formData.contact_person,
                company_rep: formData.company_rep,
                company_phone: formData.company_phone,
                country: formData.country,
                business_address: formData.business_address,
                province: formData.province,
                contact_email: formData.contact_email,
                city: formData.city,
                seta: formData.seta,
                service_interest: formData.service_interest,
                services: formData.services, // Store the services array
                documentType: formData.documentType, // Store the document type
                attachmentType: formData.attachmentType, // Store the attachment type
                attachments: attachments, // Store the attachments
                estimated_value: parseFloat(formData.estimated_value) || 0,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            // Try API first
            try {
                const response = await fetch('http://localhost:8000/api/leads/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        // Use correct field names that now match the backend
                        document_type: formData.documentType,
                        source: 'website' // Default source since it's required
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    newLead.id = result.id || newLead.id;
                }
            } catch (apiError) {
                console.log('API not available, using localStorage only');
            }

            // Always update localStorage and state
            const existingLeads = JSON.parse(localStorage.getItem('leadsData') || '[]');
            const updatedLeads = [...existingLeads, newLead];
            localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
            
            console.log('Lead saved to localStorage:', newLead);
            console.log('Updated leads count:', updatedLeads.length);
            
            // Update state immediately
            setLeads(updatedLeads);
            
            // Close modal and reset form
            setShowCreateModal(false);
            setShowHistoryActionModal(false);
            setHistoryFormMode('create'); // Reset to create mode
            setFormData({
                company_name: '',
                contact_person: '',
                company_rep: '',
                company_phone: '',
                country: '',
                business_address: '',
                province: '',
                contact_email: '',
                city: '',
                seta: '',
                service_interest: '',
                services: [],
                documentType: '',
                attachmentType: '',
                estimated_value: ''
            });
            setAttachments([]);
            
            // Show success message
            alert('Lead created successfully!');
            
        } catch (err) {
            console.error('Error creating lead:', err);
            setError('Error creating lead');
        }
    };

    const handleConvertToQuotation = async () => {
        if (!selectedLead) return;

        try {
            // First, update the lead status to 'pending'
            const updatedLeads = leads.map(lead => 
                lead.id === selectedLead.id 
                    ? { ...lead, status: 'pending' }
                    : lead
            );
            setLeads(updatedLeads);
            localStorage.setItem('leadsData', JSON.stringify(updatedLeads));

            // Try API call, but don't fail if it doesn't work
            let apiSuccess = false;
            try {
                const response = await fetch(`http://localhost:8000/api/leads/${selectedLead.id}/convert_to_quotation/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        quotation_data: {
                            ...quotationData,
                            client_name: selectedLead.company_name,
                            contact_person: selectedLead.contact_person,
                            contact_position: selectedLead.contact_position,
                            contact_phone: selectedLead.contact_phone,
                            contact_email: selectedLead.contact_email,
                            seta: selectedLead.seta || 'wrseta',
                            service_type: selectedLead.service_interest || 'wsp',
                            sdl_number: ''
                        }
                    })
                });
                apiSuccess = response.ok;
            } catch (apiError) {
                console.log('API not available, continuing with localStorage only');
                apiSuccess = true; // Treat as success for localStorage flow
            }

            // Update lead status to 'history' (no duplication)
            const finalUpdatedLeads = leads.map(lead => 
                lead.id === selectedLead.id 
                    ? { 
                        ...lead, 
                        status: 'history', 
                        converted_at: new Date().toISOString(),
                        originalLeadId: lead.id,
                        convertedAt: new Date().toISOString()
                    }
                    : lead
            );
            
            setLeads(finalUpdatedLeads);
            localStorage.setItem('leadsData', JSON.stringify(finalUpdatedLeads));

            // Check if client already exists from this lead
            const existingClients = JSON.parse(localStorage.getItem('clientsData') || '[]');
            const clientAlreadyExists = existingClients.some(client => 
                client.originalLeadId === selectedLead.id || 
                (client.clientName === selectedLead.company_name && client.contactEmail === selectedLead.contact_email)
            );

            if (!clientAlreadyExists) {
                // Create client from lead data with comprehensive preservation
                const clientData = convertLeadToClientData(selectedLead, {
                    quotationData: quotationData
                });

                // Add client to clients page using the proper function
                if (window.addNewClientToClientsPage) {
                    window.addNewClientToClientsPage(clientData);
                    console.log('Client added via window function:', clientData);
                } else {
                    // Fallback: add directly to localStorage
                    const existingClients = JSON.parse(localStorage.getItem('clientsData') || '[]');
                    const updatedClients = [...existingClients, clientData];
                    localStorage.setItem('clientsData', JSON.stringify(updatedClients));
                    console.log('Client added directly to localStorage:', clientData);
                }
            }
            
            // Close modal and reset form
            setShowConvertModal(false);
            setSelectedLead(null);
            setQuotationData({
                title: '',
                total_value: '',
                payment_terms: '30',
                sla_sda: '',
                services: [],
                documentType: '',
                uploadedFiles: [],
                notes: ''
            });
            
            // Show success message
            console.log('Lead conversion successful - client should be added to clients table');
            alert('Lead successfully converted to client and quotation!');
            
        } catch (err) {
            console.error('Error in conversion process:', err);
            // If there's any error, still try to convert the lead
            const finalUpdatedLeads = leads.map(lead => 
                lead.id === selectedLead.id 
                    ? { 
                        ...lead, 
                        status: 'history', 
                        converted_at: new Date().toISOString(),
                        originalLeadId: lead.id,
                        convertedAt: new Date().toISOString()
                    }
                    : lead
            );
            
            setLeads(finalUpdatedLeads);
            localStorage.setItem('leadsData', JSON.stringify(finalUpdatedLeads));

            // Check if client already exists from this lead (even in error case)
            const existingClients = JSON.parse(localStorage.getItem('clientsData') || '[]');
            const clientAlreadyExists = existingClients.some(client => 
                client.originalLeadId === selectedLead.id || 
                (client.clientName === selectedLead.company_name && client.contactEmail === selectedLead.contact_email)
            );

            if (!clientAlreadyExists) {
                // Create client from lead data with comprehensive preservation (even in error case)
                const clientData = convertLeadToClientData(selectedLead, {
                    quotationData: quotationData
                });

                // Add client to clients page using the proper function
                if (window.addNewClientToClientsPage) {
                    window.addNewClientToClientsPage(clientData);
                    console.log('Client added via window function:', clientData);
                } else {
                    // Fallback: add directly to localStorage
                    const existingClients = JSON.parse(localStorage.getItem('clientsData') || '[]');
                    const updatedClients = [...existingClients, clientData];
                    localStorage.setItem('clientsData', JSON.stringify(updatedClients));
                    console.log('Client added directly to localStorage:', clientData);
                }
            }
            
            setShowConvertModal(false);
            setSelectedLead(null);
            setQuotationData({
                title: '',
                total_value: '',
                payment_terms: '30',
                sla_sda: '',
                services: [],
                documentType: '',
                uploadedFiles: [],
                notes: ''
            });
            
            alert('Lead converted to client and quotation! (API unavailable, saved locally)');
        }
    };

    const openConvertModal = (lead) => {
        setSelectedLead(lead);
        setQuotationData({
            title: `${lead.company_name} - Quotation`,
            total_value: lead.estimated_value || '',
            payment_terms: '30',
            sla_sda: '',
            services: [],
            documentType: '',
            uploadedFiles: [],
            notes: ''
        });
        setShowConvertModal(true);
    };

    const handleViewLead = (lead) => {
        setSelectedLead(lead);
        setShowViewModal(true);
    };

    const handleEditLead = (lead) => {
        setSelectedLead(lead);
        setEditFormData({
            company_name: lead.company_name || '',
            contact_person: lead.contact_person || '',
            company_rep: lead.company_rep || '',
            company_phone: lead.company_phone || '',
            country: lead.country || '',
            business_address: lead.business_address || '',
            province: lead.province || '',
            contact_email: lead.contact_email || '',
            city: lead.city || '',
            seta: lead.seta || '',
            services: lead.services || [],
            documentType: lead.documentType || '',
            estimated_value: lead.estimated_value || '',
            attachments: lead.attachments || []
        });
        setShowEditModal(true);
    };

    const handleDeleteLead = (lead) => {
        if (window.confirm(`Are you sure you want to delete the lead for ${lead.company_name}?`)) {
            const updatedLeads = leads.filter(l => l.id !== lead.id);
            setLeads(updatedLeads);
            localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
            alert('Lead deleted successfully!');
        }
    };



    const handleUpdateLead = async (e) => {
        e.preventDefault();
        try {
            const updatedLead = {
                ...selectedLead,
                ...editFormData,
                estimated_value: parseFloat(editFormData.estimated_value) || 0
            };

            // Try API first
            try {
                const response = await fetch(`http://localhost:8000/api/leads/${selectedLead.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...editFormData,
                        // Use correct field names that now match the backend
                        document_type: editFormData.documentType
                    })
                });
            } catch (apiError) {
                console.log('API not available, using localStorage only');
            }

            // Update localStorage and state
            const updatedLeads = leads.map(lead => 
                lead.id === selectedLead.id ? updatedLead : lead
            );
            setLeads(updatedLeads);
            localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
            
            setShowEditModal(false);
            setSelectedLead(null);
            setEditFormData({});
            setShowEditServicesDropdown(false);
            
            alert('Lead updated successfully!');
        } catch (err) {
            console.error('Error updating lead:', err);
            alert('Error updating lead');
        }
    };

    const handleHistoryInputChange = (e) => {
        const { name, value } = e.target;
        setHistoryFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleHistorySubmit = (e) => {
        e.preventDefault();
        
        // Create a new history lead
        const newHistoryLead = {
            id: Date.now().toString(),
            ...historyFormData,
            status: 'history',
            createdAt: new Date().toISOString()
        };

        // Add to leads array
        const updatedLeads = [...leads, newHistoryLead];
        setLeads(updatedLeads);
        localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
        
        // Show success message
        alert('History lead added successfully!');
        
        // Close modal and reset form
        setShowRedactedModal(false);
        setHistoryFormData({
            clientName: '',
            clientReg: '',
            clientAddress: '',
            province: '',
            country: '',
            city: '',
            contactPerson: '',
            contactPosition: '',
            contactPhone: '',
            contactEmail: '',
            companyPhone: '',
            leadManager: '',
            dg: '',
            wspSubmitted: '',
            wspReason: '',
            retainer: '',
            seta: '',
            services: [],
            sdlNumber: '',
            documentType: '',
            attachments: []
        });
    };

    const closeHistoryModal = () => {
        setShowHistoryModal(false);
        setHistoryFormData({
            clientName: '',
            clientReg: '',
            clientAddress: '',
            province: '',
            country: '',
            city: '',
            contactPerson: '',
            contactPosition: '',
            contactPhone: '',
            contactEmail: '',
            companyPhone: '',
            leadManager: '',
            dg: '',
            wspSubmitted: '',
            wspReason: '',
            retainer: '',
            seta: '',
            services: [],
            sdlNumber: '',
            documentType: '',
            attachments: []
        });
    };

    const handleHistoryAction = (lead) => {
        // Set form data to the selected lead's data for history action
        setFormData({
            company_name: lead.company_name || '',
            contact_person: lead.contact_person || '',
            company_phone: lead.company_phone || '',
            country: lead.country || '',
            business_address: lead.business_address || '',
            province: lead.province || '',
            contact_email: lead.contact_email || '',
            city: lead.city || '',
            seta: lead.seta || '',
            service_interest: lead.service_interest || '',
            services: lead.services || [],
            documentType: lead.documentType || '',
            attachmentType: lead.attachmentType || '',
            estimated_value: lead.estimated_value || ''
        });
        setAttachments(lead.attachments || []);
        setHistoryFormMode('history');
        setShowHistoryActionModal(true);
    };

    const closeHistoryActionModal = () => {
        setShowHistoryActionModal(false);
        setHistoryFormMode('create'); // Reset to create mode
        setFormData({
            company_name: '',
            contact_person: '',
            company_phone: '',
            country: '',
            business_address: '',
            province: '',
            contact_email: '',
            city: '',
            seta: '',
            service_interest: '',
            services: [],
            documentType: '',
            attachmentType: '',
            estimated_value: ''
        });
        setAttachments([]);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'R 0.00';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'new': return 'status-new';
            case 'contacted': return 'status-contacted';
            case 'qualified': return 'status-qualified';
            case 'pending': return 'status-pending';
            case 'converted': return 'status-converted';
            case 'lost': return 'status-lost';
            default: return 'status-pending';
        }
    };

    // Guide steps for the leads table
    const combinedGuideSteps = [
        // Table Section
        {
            title: "Lead Records Section",
            description: "Now let's explore the detailed lead management area. Here you can view, manage, and track all your leads in a comprehensive table format.",
            target: ".modules-section"
        },
        {
            title: "Add Lead Button",
            description: "Click this button to create a new lead. It will open a form where you can enter all the lead's information.",
            target: ".add-module-btn"
        },
        {
            title: "Company Column",
            description: "Shows the company name for each lead. This is the primary identifier for each lead record.",
            target: ".modules-table thead th:nth-child(1)"
        },
        {
            title: "Contact Person",
            description: "Displays the main contact person's name for each lead. This is who you'll be communicating with.",
            target: ".modules-table thead th:nth-child(2)"
        },
        {
            title: "Email Address",
            description: "The contact person's email address. Use this for email communications and follow-ups.",
            target: ".modules-table thead th:nth-child(3)"
        },
        {
            title: "Lead Source",
            description: "Shows where the lead came from (website, referral, cold call, etc.). This helps track your marketing effectiveness.",
            target: ".modules-table thead th:nth-child(4)"
        },
        {
            title: "Status Badge",
            description: "Color-coded status indicators showing the current stage of each lead in your sales process.",
            target: ".modules-table thead th:nth-child(5)"
        },
        {
            title: "SETA Information",
            description: "Shows which SETA (Sector Education and Training Authority) the lead is associated with.",
            target: ".modules-table thead th:nth-child(6)"
        },

        {
            title: "Created Date",
            description: "When the lead was first added to your system. Useful for tracking lead age and follow-up timing.",
            target: ".modules-table thead th:nth-child(7)"
        },
        {
            title: "Convert to Quotation",
            description: "This button converts a lead into a quotation. Only available for leads that haven't been converted yet. Click to create a formal quote.",
            target: ".action-buttons .btn-icon:first-child"
        },
        {
            title: "View Details",
            description: "Click this button to view all the details of a lead in a popup modal. Useful for quick reference without editing.",
            target: ".action-buttons .btn-icon:nth-child(2)"
        },
        {
            title: "Edit Lead",
            description: "This button opens an edit form where you can modify any lead information. Perfect for updating contact details or status.",
            target: ".action-buttons .btn-icon:nth-child(3)"
        },
        {
            title: "Delete Lead",
            description: "Removes the lead from your system. Use with caution - this action cannot be undone.",
            target: ".action-buttons .btn-icon:last-child"
        }
    ];

    const handleGuideComplete = () => {
        setShowGuide(false);
        localStorage.setItem('leadsCombinedGuideSeen', 'true');
    };

    const handleGuideSkip = () => {
        setShowGuide(false);
        localStorage.setItem('leadsCombinedGuideSeen', 'true');
    };

    const startGuide = () => {
        setShowGuide(true);
    };



    // Modern main content matching the HTML mockup design
    const pageContent = (
        <>
            {error && (
                <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            {/* Top Bar */}
            <div className="top-bar">
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

            {/* Header Section */}
            <div className="wsp-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>Lead Management</h1>
                        <p>Comprehensive lead tracking, qualification, and conversion management</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className={`btn-secondary ${isExporting ? 'exporting' : ''}`}
                            onClick={handleExportLeads}
                            disabled={isExporting}
                        >
                            <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                            {isExporting ? 'Exporting...' : 'Export Leads'}
                        </button>
                    </div>
                </div>
            </div>



            {/* Leads Section */}
            <div className="modules-section">
                <div className="modules-header">
                    <h2 className="modules-title">
                        {showHistoryMode ? 'Lead History' : 'Lead Records'}
                    </h2>
                    <div className="header-actions">
                        <button className="add-module-btn" onClick={() => {
                            setHistoryFormMode('create');
                            setShowHistoryActionModal(true);
                        }}>
                            + Add Lead
                        </button>
                        <button className={`history-btn ${showHistoryMode ? 'active' : ''}`} onClick={() => setShowHistoryMode(!showHistoryMode)}>
                            <i className="fas fa-history"></i>
                            {showHistoryMode ? 'Current Leads' : 'History'}
                        </button>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="table-container">
                    <table className="modules-table">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Company Rep</th>
                                <th>Lead Manager</th>
                                <th>Company Phone</th>
                                <th>Country</th>
                                <th>Services</th>
                                <th>SETA</th>
                                <th>Document Type</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                                                    <tr>
                                        <td colSpan="10" style={{textAlign: 'center'}}>
                                            <i className="fas fa-spinner fa-spin"></i> Loading leads...
                                        </td>
                                    </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{textAlign: 'center'}}>
                                        No leads found. Create your first lead!
                                    </td>
                                </tr>
                            ) : (
                                leads.filter(lead => {
                                    if (showHistoryMode) {
                                        // Show converted leads and history leads
                                        return lead.status === 'converted' || lead.status === 'history';
                                    } else {
                                        // Show current leads (not converted)
                                        return lead.status !== 'converted' && lead.status !== 'history';
                                    }
                                }).map((lead) => (
                                    <tr key={lead.id}>
                                        <td className="module-name">{lead.company_name}</td>
                                        <td>{lead.company_rep || 'N/A'}</td>
                                        <td>{lead.contact_person}</td>
                                        <td>{lead.company_phone || 'N/A'}</td>
                                        <td>{lead.country || 'N/A'}</td>
                                        <td title={lead.services ? lead.services.join(', ') : 'N/A'}>
                                            {formatServicesDisplay(lead.services)}
                                        </td>
                                        <td>{lead.seta ? lead.seta.toUpperCase() : 'N/A'}</td>
                                        <td>{abbreviateDocumentType(lead.documentType, lead.attachments)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                {lead.status !== 'converted' && lead.status !== 'history' && (
                                                    <button 
                                                        className="btn-icon" 
                                                        title="Convert to Quotation"
                                                        onClick={() => openConvertModal(lead)}
                                                    >
                                                        <i className="fas fa-exchange-alt"></i>
                                                    </button>
                                                )}
                                                <button className="btn-icon" title="View Details" onClick={() => handleViewLead(lead)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                {lead.status !== 'history' && (
                                                    <button className="btn-icon" title="Edit" onClick={() => handleEditLead(lead)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                )}

                                                <button className="btn-icon" title="Delete" onClick={() => handleDeleteLead(lead)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Lead Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content create-lead-modal">
                        <div className="modal-header">
                            <h2>Create New Lead</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={(e) => {
                                console.log('First form submitted');
                                handleCreateLead(e);
                            }}>
                                <div className="create-lead-form">
                                    {/* Company Information Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Company Information</h3>
                                        <div className="form-row">
                                    <div className="form-group">
                                        <label>Company Name</label>
                                        <input
                                            type="text"
                                            name="company_name"
                                            value={formData.company_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter company name (optional)"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Company Rep</label>
                                        <input
                                            type="text"
                                            name="company_rep"
                                            value={formData.company_rep}
                                            onChange={handleInputChange}
                                            placeholder="Enter company representative name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Lead Manager</label>
                                        <div className="lead-manager-dropdown-container">
                                            <div 
                                                className="lead-manager-dropdown-trigger"
                                                onClick={() => setShowLeadManagerDropdown(!showLeadManagerDropdown)}
                                            >
                                                <span className="lead-manager-placeholder">
                                                    {formData.contact_person || 'Select Lead Manager (optional)'}
                                                </span>
                                                <i className={`fas fa-chevron-down ${showLeadManagerDropdown ? 'rotated' : ''}`}></i>
                                            </div>
                                            {showLeadManagerDropdown && (
                                                <div className="lead-manager-dropdown-options">
                                                    {['Nasreen', 'Koketso', 'Shannon'].map((manager) => (
                                                        <div 
                                                            key={manager} 
                                                            className="lead-manager-option"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, contact_person: manager }));
                                                                setShowLeadManagerDropdown(false);
                                                            }}
                                                        >
                                                            {manager}
                                                        </div>
                                                    ))}
                                                    <div 
                                                        className="lead-manager-option create-new"
                                                        onClick={() => {
                                                            setShowLeadManagerDropdown(false);
                                                            setShowCreateManagerModal(true);
                                                        }}
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                        Create New Lead Manager
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Company Phone</label>
                                        <input
                                            type="tel"
                                            name="company_phone"
                                            value={formData.company_phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter company phone number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Business Address</label>
                                        <textarea
                                            name="business_address"
                                            value={formData.business_address}
                                            onChange={handleInputChange}
                                            placeholder="Enter complete business address"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Province/State</label>
                                        <select
                                            name="province"
                                            value={formData.province}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Province</option>
                                            <option value="Eastern Cape">Eastern Cape</option>
                                            <option value="Free State">Free State</option>
                                            <option value="Gauteng">Gauteng</option>
                                            <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                            <option value="Limpopo">Limpopo</option>
                                            <option value="Mpumalanga">Mpumalanga</option>
                                            <option value="Northern Cape">Northern Cape</option>
                                            <option value="North West">North West</option>
                                            <option value="Western Cape">Western Cape</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Enter city name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Country</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Botswana">Botswana</option>
                                            <option value="Lesotho">Lesotho</option>
                                            <option value="Mozambique">Mozambique</option>
                                            <option value="Namibia">Namibia</option>
                                            <option value="Swaziland">Swaziland</option>
                                            <option value="Zimbabwe">Zimbabwe</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    </div>
                                    </div>

                                    {/* Services & SETA Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Services & SETA</h3>
                                        <div className="form-row">
                                    <div className="form-group">
                                        <label>Services</label>
                                        <div className="services-dropdown-container">
                                            <div 
                                                className="services-dropdown-trigger"
                                                onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                                            >
                                                <span className={`services-placeholder ${formData.services && formData.services.length > 0 ? 'has-selections' : ''}`}>
                                                    {formData.services && formData.services.length > 0 
                                                        ? formData.services.join(', ') 
                                                        : 'Select Services (optional)'
                                                    }
                                                </span>
                                                <i className={`fas fa-chevron-down ${showServicesDropdown ? 'rotated' : ''}`}></i>
                                            </div>
                                            {showServicesDropdown && (
                                                <div className="services-dropdown-options">
                                                    {['WSP', 'HR', 'Employment Equity', 'Industry Funded', 'SETA Funded', 'BBBEE'].map((service) => (
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
                                    </div>
                                    <div className="form-group">
                                        <label>SETA</label>
                                        <select
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
                                        </div>
                                    </div>

                                    {/* Financial & Documents Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Financial & Documents</h3>
                                        <div className="form-row">
                                        <div className="form-group">
                                            <label>Document Type</label>
                                            <select
                                                name="documentType"
                                                value={formData.documentType || ''}
                                                onChange={handleInputChange}
                                            >
                                                    <option value="" disabled>Select Document Type</option>
                                            <option value="SLA">SLA</option>
                                            <option value="SDF Appointment Letter">SDF Appointment Letter</option>
                                        </select>
                                    </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                        <label>Upload Documents</label>
                                        <div className="document-upload-section">
                                            <button type="button" className="add-service-btn" onClick={handleFileSelect}>
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M8 1L8 15M1 8L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                                Upload attachment
                                            </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Attachments Section */}
                                        {attachments.length > 0 && (
                                            <div className="attachments-list">
                                                {attachments
                                                    .filter(attachment => attachment.documentType === formData.documentType)
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
                                                        <div className="attachment-actions">
                                                            <button 
                                                                type="button" 
                                                                className="preview-btn" 
                                                                onClick={() => handleFilePreview(attachment)}
                                                                title="Open file"
                                                            >
                                                                <i className="fas fa-external-link-alt"></i>
                                                            </button>
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
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn secondary" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn primary">
                                        Create Lead
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Convert to Quotation Modal */}
            {showConvertModal && selectedLead && (
                <div className="modal-overlay">
                    <div className="modal-content view-lead-modal">
                        <div className="modal-header">
                            <h2>Convert Lead to Client</h2>
                            <button className="modal-close" onClick={() => setShowConvertModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="view-lead-form">
                                {/* Company Information Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Company Information</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <strong>Company Name:</strong>
                                            <span>{selectedLead.company_name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Company Rep:</strong>
                                            <span>{selectedLead.company_rep || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Lead Manager:</strong>
                                            <span>{selectedLead.contact_person}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Company Phone:</strong>
                                            <span>{selectedLead.company_phone || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Business Address:</strong>
                                            <span>{selectedLead.business_address || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Province/State:</strong>
                                            <span>{selectedLead.province || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>City:</strong>
                                            <span>{selectedLead.city || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Country:</strong>
                                            <span>{selectedLead.country || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Services & SETA Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Services & SETA</h3>
                                    <div className="details-grid">
                                    <div className="detail-item">
                                        <strong>Services:</strong>
                                        <span>{selectedLead.services?.join(', ') || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>SETA:</strong>
                                        <span>{selectedLead.seta || 'N/A'}</span>
                                    </div>
                                    </div>
                                </div>

                                {/* Financial & Documents Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Financial & Documents</h3>
                                    <div className="details-grid">

                                    <div className="detail-item">
                                        <strong>Document Type:</strong>
                                        <span>{selectedLead.documentType || 'N/A'}</span>
                                    </div>
                                    </div>
                                    
                                    {/* Attachments Section */}
                                    {selectedLead.attachments && selectedLead.attachments.length > 0 && (
                                        <div className="detail-item full-width">
                                            <strong>Attachments:</strong>
                                            <div className="attachments-display">
                                                {selectedLead.attachments.map((attachment) => (
                                                    <div key={attachment.id} className="attachment-display-item">
                                                        <div className="attachment-info">
                                                            <span className="attachment-name">{attachment.name}</span>
                                                            <span className="attachment-type">({attachment.documentType})</span>
                                                            <span className="attachment-size">
                                                                ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                                                            </span>
                                                        </div>
                                                        <div className="attachment-actions">
                                                            <button 
                                                                type="button" 
                                                                className="preview-btn" 
                                                                onClick={() => handleFilePreview(attachment)}
                                                                title="Open file"
                                                            >
                                                                <i className="fas fa-external-link-alt"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    </div>

                                {/* Lead Status Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Lead Status</h3>
                                    <div className="details-grid">
                                    <div className="detail-item">
                                        <strong>Status:</strong>
                                        <span className={`status-badge ${getStatusBadgeClass(selectedLead.status)}`}>
                                            {selectedLead.status}
                                        </span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Created Date:</strong>
                                            <span>{formatDate(selectedLead.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn secondary" onClick={() => setShowConvertModal(false)}>
                                    Close
                                </button>
                                <button type="button" className="btn primary" onClick={handleConvertToQuotation}>
                                    Convert to Client
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Lead Modal */}
            {showViewModal && selectedLead && (
                <div className="modal-overlay">
                    <div className="modal-content view-lead-modal">
                        <div className="modal-header">
                            <h2>Lead Details</h2>
                            <button className="modal-close" onClick={() => setShowViewModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="view-lead-form">
                                {/* Company Information Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Company Information</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <strong>Company Name:</strong>
                                            <span>{selectedLead.company_name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Lead Manager:</strong>
                                            <span>{selectedLead.contact_person}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Company Phone:</strong>
                                            <span>{selectedLead.company_phone || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Business Address:</strong>
                                            <span>{selectedLead.business_address || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Province/State:</strong>
                                            <span>{selectedLead.province || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>City:</strong>
                                            <span>{selectedLead.city || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Country:</strong>
                                            <span>{selectedLead.country || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Services & SETA Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Services & SETA</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <strong>Services:</strong>
                                            <span>{selectedLead.services?.join(', ') || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>SETA:</strong>
                                            <span>{selectedLead.seta || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial & Documents Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Financial & Documents</h3>
                                    <div className="details-grid">

                                        <div className="detail-item">
                                            <strong>Document Type:</strong>
                                            <span>{selectedLead.documentType || 'N/A'}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Attachments Section */}
                                    {selectedLead.attachments && selectedLead.attachments.length > 0 && (
                                        <div className="detail-item full-width">
                                            <strong>Attachments:</strong>
                                            <div className="attachments-display">
                                                {selectedLead.attachments.map((attachment) => (
                                                    <div key={attachment.id} className="attachment-display-item">
                                                        <span className="attachment-name">{attachment.name}</span>
                                                        <span className="attachment-type">({attachment.documentType})</span>
                                                        <span className="attachment-size">
                                                            ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Lead Status Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Lead Status</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <strong>Status:</strong>
                                            <span className={`status-badge ${getStatusBadgeClass(selectedLead.status)}`}>
                                                {selectedLead.status}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Created Date:</strong>
                                            <span>{formatDate(selectedLead.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn secondary" onClick={() => setShowViewModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Lead Modal */}
            {showEditModal && selectedLead && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        width: '90%',
                        maxWidth: '1500px',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div className="modal-header" style={{
                            padding: '20px',
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <h2 style={{ margin: 0, color: '#007bff', fontWeight: 'bold' }}>
                                Edit Lead
                            </h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)} style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '5px'
                            }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body create-lead-form" style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1,
                            minHeight: '200px'
                        }}>
                            <form onSubmit={handleUpdateLead}>
                                    {/* Company Information Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Company Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Company Name</label>
                                                <input
                                                    type="text"
                                                    name="company_name"
                                                    value={editFormData.company_name}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter company name (optional)"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Company Rep</label>
                                                <input
                                                    type="text"
                                                    name="company_rep"
                                                    value={editFormData.company_rep}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter company representative name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Lead Manager</label>
                                                <div className="lead-manager-dropdown-container">
                                                    <div 
                                                        className="lead-manager-dropdown-trigger"
                                                        onClick={() => setShowLeadManagerDropdown(!showLeadManagerDropdown)}
                                                    >
                                                        <span className="lead-manager-placeholder">
                                                            {editFormData.contact_person || 'Select Lead Manager (optional)'}
                                                        </span>
                                                        <i className={`fas fa-chevron-down ${showLeadManagerDropdown ? 'rotated' : ''}`}></i>
                                                    </div>
                                                    {showLeadManagerDropdown && (
                                                        <div className="lead-manager-dropdown-options">
                                                            {['Nasreen', 'Koketso', 'Shannon'].map((manager) => (
                                                                <div 
                                                                    key={manager} 
                                                                    className="lead-manager-option"
                                                                    onClick={() => {
                                                                        setEditFormData(prev => ({ ...prev, contact_person: manager }));
                                                                        setShowLeadManagerDropdown(false);
                                                                    }}
                                                                >
                                                                    {manager}
                                                                </div>
                                                            ))}
                                                            <div 
                                                                className="lead-manager-option create-new"
                                                                onClick={() => {
                                                                    setShowLeadManagerDropdown(false);
                                                                    setShowCreateManagerModal(true);
                                                                }}
                                                            >
                                                                <i className="fas fa-plus"></i>
                                                                Create New Lead Manager
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Company Phone</label>
                                                <input
                                                    type="tel"
                                                    name="company_phone"
                                                    value={editFormData.company_phone}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter company phone number"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Business Address</label>
                                                <textarea
                                                    name="business_address"
                                                    value={editFormData.business_address}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter business address"
                                                    rows="3"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Province/State</label>
                                                <select
                                                    name="province"
                                                    value={editFormData.province}
                                                    onChange={handleEditInputChange}
                                                >
                                                    <option value="">Select Province</option>
                                                    <option value="Eastern Cape">Eastern Cape</option>
                                                    <option value="Free State">Free State</option>
                                                    <option value="Gauteng">Gauteng</option>
                                                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                                    <option value="Limpopo">Limpopo</option>
                                                    <option value="Mpumalanga">Mpumalanga</option>
                                                    <option value="Northern Cape">Northern Cape</option>
                                                    <option value="North West">North West</option>
                                                    <option value="Western Cape">Western Cape</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={editFormData.city}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter city name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Contact Email</label>
                                                <input
                                                    type="email"
                                                    name="contact_email"
                                                    value={editFormData.contact_email}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter contact email"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Country</label>
                                                <select
                                                                                                name="country"
                                            value={editFormData.country}
                                                    onChange={handleEditInputChange}
                                                >
                                                    <option value="">Select Country</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="Botswana">Botswana</option>
                                                    <option value="Lesotho">Lesotho</option>
                                                    <option value="Mozambique">Mozambique</option>
                                                    <option value="Namibia">Namibia</option>
                                                    <option value="Swaziland">Swaziland</option>
                                                    <option value="Zimbabwe">Zimbabwe</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services & SETA Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Services & SETA</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Services</label>
                                                <div className="services-dropdown-container">
                                                    <div 
                                                        className="services-dropdown-trigger"
                                                        onClick={() => setShowEditServicesDropdown(!showEditServicesDropdown)}
                                                    >
                                                        <span className={`services-placeholder ${editFormData.services && editFormData.services.length > 0 ? 'has-selections' : ''}`}>
                                                            {editFormData.services && editFormData.services.length > 0 
                                                                ? editFormData.services.join(', ') 
                                                                : 'Select Services (optional)'
                                                            }
                                                        </span>
                                                        <i className={`fas fa-chevron-down ${showEditServicesDropdown ? 'rotated' : ''}`}></i>
                                                    </div>
                                                    {showEditServicesDropdown && (
                                                        <div className="services-dropdown-options">
                                                            {['WSP', 'HR', 'Employment Equity', 'Industry Funded', 'SETA Funded', 'BBBEE'].map((service) => (
                                                                <label key={service} className="service-option">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editFormData.services?.includes(service) || false}
                                                                        onChange={() => handleEditServiceRadioChange(service)}
                                                                    />
                                                                    <span className="option-label">{service}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>SETA</label>
                                                <select
                                                    name="seta"
                                                    value={editFormData.seta}
                                                    onChange={handleEditInputChange}
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
                                        </div>
                                    </div>

                                    {/* Financial & Documents Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Financial & Documents</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Document Type</label>
                                                <select
                                                    name="documentType"
                                                    value={editFormData.documentType || ''}
                                                    onChange={handleEditInputChange}
                                                >
                                                    <option value="" disabled>Select Document Type</option>
                                                    <option value="SLA">SLA</option>
                                                    <option value="SDF Appointment Letter">SDF Appointment Letter</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Upload Documents</label>
                                                <div className="document-upload-section">
                                                    <button type="button" className="add-service-btn" onClick={handleFileSelect}>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M8 1L8 15M1 8L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                        </svg>
                                                        Upload attachment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Attachments Section */}
                                        {attachments.length > 0 && (
                                            <div className="attachments-list">
                                                {attachments
                                                    .filter(attachment => attachment.documentType === editFormData.documentType)
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
                                                        <div className="attachment-actions">
                                                            <button 
                                                                type="button" 
                                                                className="preview-btn" 
                                                                onClick={() => handleFilePreview(attachment)}
                                                                title="Open file"
                                                            >
                                                                <i className="fas fa-external-link-alt"></i>
                                                            </button>
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
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                            </form>
                        </div>
                        <div className="modal-footer" style={{ 
                            borderTop: '1px solid #e0e0e0', 
                            padding: '15px 20px', 
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <button 
                                type="button" 
                                className="btn secondary" 
                                onClick={() => {
                                    setShowEditModal(false);
                                    setShowEditServicesDropdown(false);
                                }}
                                style={{
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                                Edit Lead
                            </div>
                            <button 
                                type="button" 
                                className="btn primary" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleUpdateLead(e);
                                }}
                                style={{
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Update Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create New Lead Manager Modal */}
            {showCreateManagerModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create New Lead Manager</h2>
                            <button className="modal-close" onClick={() => setShowCreateManagerModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const newManagerName = e.target.managerName.value.trim();
                                if (newManagerName) {
                                    setFormData(prev => ({ ...prev, contact_person: newManagerName }));
                                    setShowCreateManagerModal(false);
                                }
                            }}>
                                <div className="form-group">
                                    <label>Lead Manager Name *</label>
                                    <input
                                        type="text"
                                        name="managerName"
                                        placeholder="Enter lead manager name"
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn secondary" onClick={() => setShowCreateManagerModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn primary">
                                        Create Manager
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* History Lead Modal */}
            {showHistoryModal && (
                <div className="modal-overlay" onClick={closeHistoryModal}>
                    <div className="modal-content create-lead-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add History Lead</h2>
                            <button className="modal-close" onClick={closeHistoryModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleHistorySubmit}>
                                <div className="create-lead-form">
                                    {/* Client Information Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Client Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Client Name *</label>
                                                <input
                                                    type="text"
                                                    name="clientName"
                                                    value={historyFormData.clientName}
                                                    onChange={handleHistoryInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Client Registration</label>
                                                <input
                                                    type="text"
                                                    name="clientReg"
                                                    value={historyFormData.clientReg}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Client Address</label>
                                                <input
                                                    type="text"
                                                    name="clientAddress"
                                                    value={historyFormData.clientAddress}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Province</label>
                                                <input
                                                    type="text"
                                                    name="province"
                                                    value={historyFormData.province}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Country</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={historyFormData.country}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={historyFormData.city}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Contact Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Contact Person</label>
                                                <input
                                                    type="text"
                                                    name="contactPerson"
                                                    value={historyFormData.contactPerson}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Business Address</label>
                                                <textarea
                                                    name="contactPosition"
                                                    value={historyFormData.contactPosition}
                                                    onChange={handleHistoryInputChange}
                                                    placeholder="Enter business address"
                                                    rows="3"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Province/State</label>
                                                <select
                                                    name="contactPhone"
                                                    value={historyFormData.contactPhone}
                                                    onChange={handleHistoryInputChange}
                                                >
                                                    <option value="">Select Province</option>
                                                    <option value="Eastern Cape">Eastern Cape</option>
                                                    <option value="Free State">Free State</option>
                                                    <option value="Gauteng">Gauteng</option>
                                                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                                    <option value="Limpopo">Limpopo</option>
                                                    <option value="Mpumalanga">Mpumalanga</option>
                                                    <option value="Northern Cape">Northern Cape</option>
                                                    <option value="North West">North West</option>
                                                    <option value="Western Cape">Western Cape</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={historyFormData.city}
                                                    onChange={handleHistoryInputChange}
                                                    placeholder="Enter city name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Contact Email</label>
                                                <input
                                                    type="email"
                                                    name="contactEmail"
                                                    value={historyFormData.contactEmail}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Company Phone</label>
                                                <input
                                                    type="tel"
                                                    name="companyPhone"
                                                    value={historyFormData.companyPhone}
                                                    onChange={handleHistoryInputChange}
                                                    placeholder="Enter company phone number"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Lead Manager</label>
                                                <input
                                                    type="text"
                                                    name="leadManager"
                                                    value={historyFormData.leadManager}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Additional Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Country</label>
                                                <select
                                                    name="conceptionDate"
                                                    value={redactedFormData.conceptionDate}
                                                    onChange={handleRedactedInputChange}
                                                >
                                                    <option value="">Select Country</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="Botswana">Botswana</option>
                                                    <option value="Lesotho">Lesotho</option>
                                                    <option value="Mozambique">Mozambique</option>
                                                    <option value="Namibia">Namibia</option>
                                                    <option value="Swaziland">Swaziland</option>
                                                    <option value="Zimbabwe">Zimbabwe</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>DG</label>
                                                <input
                                                    type="text"
                                                    name="dg"
                                                    value={historyFormData.dg}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>WSP Submitted</label>
                                                <input
                                                    type="text"
                                                    name="wspSubmitted"
                                                    value={historyFormData.wspSubmitted}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>WSP Reason</label>
                                                <input
                                                    type="text"
                                                    name="wspReason"
                                                    value={historyFormData.wspReason}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Retainer</label>
                                                <input
                                                    type="text"
                                                    name="retainer"
                                                    value={historyFormData.retainer}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>SETA</label>
                                                <input
                                                    type="text"
                                                    name="seta"
                                                    value={historyFormData.seta}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>SDL Number</label>
                                                <input
                                                    type="text"
                                                    name="sdlNumber"
                                                    value={historyFormData.sdlNumber}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Document Type</label>
                                                <input
                                                    type="text"
                                                    name="documentType"
                                                    value={historyFormData.documentType}
                                                    onChange={handleHistoryInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn secondary" onClick={closeHistoryModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn primary">
                                        Add History Lead
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* History Action Modal - Empty Content */}
            {showHistoryActionModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        width: '90%',
                        maxWidth: '1500px',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div className="modal-header" style={{
                            padding: '20px',
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <h2 style={{ margin: 0, color: historyFormMode === 'create' ? '#007bff' : '#dc3545', fontWeight: 'bold' }}>
                                {historyFormMode === 'create' ? 'Create New Lead' : 'History Action'}
                            </h2>
                            <button className="modal-close" onClick={closeHistoryActionModal} style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '5px'
                            }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body create-lead-form" style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1,
                            minHeight: '200px'
                        }}>
                            <form onSubmit={(e) => {
                                console.log('Second form submitted');
                                handleCreateLead(e);
                            }}>
                                    {/* Company Information Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Company Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Company Name</label>
                                                <input
                                                    type="text"
                                                    name="company_name"
                                                    value={formData.company_name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter company name (optional)"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Company Rep</label>
                                                <input
                                                    type="text"
                                                    name="company_rep"
                                                    value={formData.company_rep}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter company representative name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Lead Manager</label>
                                                <div className="lead-manager-dropdown-container">
                                                    <div 
                                                        className="lead-manager-dropdown-trigger"
                                                        onClick={() => setShowLeadManagerDropdown(!showLeadManagerDropdown)}
                                                    >
                                                        <span className="lead-manager-placeholder">
                                                            {formData.contact_person || 'Select Lead Manager (optional)'}
                                                        </span>
                                                        <i className={`fas fa-chevron-down ${showLeadManagerDropdown ? 'rotated' : ''}`}></i>
                                                    </div>
                                                    {showLeadManagerDropdown && (
                                                        <div className="lead-manager-dropdown-options">
                                                            {['Nasreen', 'Koketso', 'Shannon'].map((manager) => (
                                                                <div 
                                                                    key={manager} 
                                                                    className="lead-manager-option"
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, contact_person: manager }));
                                                                        setShowLeadManagerDropdown(false);
                                                                    }}
                                                                >
                                                                    {manager}
                                                                </div>
                                                            ))}
                                                            <div 
                                                                className="lead-manager-option create-new"
                                                                onClick={() => {
                                                                    setShowLeadManagerDropdown(false);
                                                                    setShowCreateManagerModal(true);
                                                                }}
                                                            >
                                                                <i className="fas fa-plus"></i>
                                                                Create New Lead Manager
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Company Phone</label>
                                                <input
                                                    type="tel"
                                                    name="company_phone"
                                                    value={formData.company_phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter company phone number"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Business Address</label>
                                                <textarea
                                                    name="business_address"
                                                    value={formData.business_address}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter business address"
                                                    rows="3"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Province/State</label>
                                                <select
                                                    name="province"
                                                    value={formData.province}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select Province</option>
                                                    <option value="Eastern Cape">Eastern Cape</option>
                                                    <option value="Free State">Free State</option>
                                                    <option value="Gauteng">Gauteng</option>
                                                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                                    <option value="Limpopo">Limpopo</option>
                                                    <option value="Mpumalanga">Mpumalanga</option>
                                                    <option value="Northern Cape">Northern Cape</option>
                                                    <option value="North West">North West</option>
                                                    <option value="Western Cape">Western Cape</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter city name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Contact Email</label>
                                                <input
                                                    type="email"
                                                    name="contact_email"
                                                    value={formData.contact_email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter contact email"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Country</label>
                                                <select
                                                                                                name="country"
                                            value={formData.country}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select Country</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="Botswana">Botswana</option>
                                                    <option value="Lesotho">Lesotho</option>
                                                    <option value="Mozambique">Mozambique</option>
                                                    <option value="Namibia">Namibia</option>
                                                    <option value="Swaziland">Swaziland</option>
                                                    <option value="Zimbabwe">Zimbabwe</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services & SETA Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Services & SETA</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Services</label>
                                                <div className="services-dropdown-container">
                                                    <div 
                                                        className="services-dropdown-trigger"
                                                        onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                                                    >
                                                        <span className={`services-placeholder ${formData.services && formData.services.length > 0 ? 'has-selections' : ''}`}>
                                                            {formData.services && formData.services.length > 0 
                                                                ? formData.services.join(', ') 
                                                                : 'Select Services (optional)'
                                                            }
                                                        </span>
                                                        <i className={`fas fa-chevron-down ${showServicesDropdown ? 'rotated' : ''}`}></i>
                                                    </div>
                                                    {showServicesDropdown && (
                                                        <div className="services-dropdown-options">
                                                            {['WSP', 'HR', 'Employment Equity', 'Industry Funded', 'SETA Funded', 'BBBEE'].map((service) => (
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
                                            </div>
                                            <div className="form-group">
                                                <label>SETA</label>
                                                <select
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
                                        </div>
                                    </div>

                                    {/* Financial & Documents Section */}
                                    <div className="form-section">
                                        <h3 className="section-title">Financial & Documents</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Document Type</label>
                                                <select
                                                    name="documentType"
                                                    value={formData.documentType || ''}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="" disabled>Select Document Type</option>
                                                    <option value="SLA">SLA</option>
                                                    <option value="SDF Appointment Letter">SDF Appointment Letter</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Upload Documents</label>
                                                <div className="document-upload-section">
                                                    <button type="button" className="add-service-btn" onClick={handleFileSelect}>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M8 1L8 15M1 8L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                        </svg>
                                                        Upload attachment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Attachments Section */}
                                        {attachments.length > 0 && (
                                            <div className="attachments-list">
                                                {attachments
                                                    .filter(attachment => attachment.documentType === formData.documentType)
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
                                                        <div className="attachment-actions">
                                                            <button 
                                                                type="button" 
                                                                className="preview-btn" 
                                                                onClick={() => handleFilePreview(attachment)}
                                                                title="Open file"
                                                            >
                                                                <i className="fas fa-external-link-alt"></i>
                                                            </button>
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
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>



                            </form>
                        </div>
                        <div className="modal-footer" style={{ 
                            borderTop: '1px solid #e0e0e0', 
                            padding: '15px 20px', 
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <button 
                                type="button" 
                                className="btn secondary" 
                                onClick={closeHistoryActionModal}
                                style={{
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <div style={{ fontWeight: 'bold', color: historyFormMode === 'create' ? '#007bff' : '#dc3545' }}>
                                {historyFormMode === 'create' ? 'Create Lead' : 'History'}
                            </div>
                            <button 
                                type="button" 
                                className="btn primary" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleCreateLead(e);
                                }}
                                style={{
                                    background: historyFormMode === 'create' ? '#007bff' : '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {historyFormMode === 'create' ? 'Create Lead' : 'History'}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Export Leads Modal */}
            {showExportModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        width: '90%',
                        maxWidth: '1160px',
                        maxHeight: '93vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div className="modal-header" style={{
                            padding: '20px',
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <h2 style={{ margin: 0, color: '#006400', fontWeight: 'bold' }}>
                                Export Leads
                            </h2>
                            <button className="modal-close" onClick={handleExportCancel} style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '5px'
                            }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body" style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1,
                            minHeight: '200px'
                        }}>
                            {/* Export form content removed - now blank */}
                        </div>
                        
                        <div className="modal-footer" style={{ 
                            borderTop: '1px solid #e0e0e0', 
                            padding: '15px 20px', 
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <button 
                                type="button" 
                                className="btn secondary" 
                                onClick={handleExportCancel}
                                style={{
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>

                            <button 
                                type="button" 
                                className={`btn primary ${isExporting ? 'exporting' : ''}`}
                                onClick={handleExportSubmit}
                                disabled={isExporting}
                                style={{
                                    background: isExporting ? '#10b981' : '#006400',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: isExporting ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                                {isExporting ? 'Exporting...' : 'Export Leads'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Combined Guide */}
            <GridCardGuide 
                isActive={showGuide}
                onComplete={handleGuideComplete}
                onSkip={handleGuideSkip}
                steps={combinedGuideSteps}
            />

        </>
    );

    return (
        <HubSpotLayout 
            title="Leads Management" 
            description="Manage and track your sales leads and prospects"
        >
            {pageContent}
        </HubSpotLayout>
    );
};

export default Leads; 