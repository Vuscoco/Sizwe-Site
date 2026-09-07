import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HubSpotLayout from '../components/HubSpotLayout';
import GridCardGuide from '../components/GridCardGuide';
import '../css/Clients.css';
import '../css/WSPTraining.css';

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
        clientAddress: leadData.contact_position || '',                // Business Address → Registered Address
        
        // Contact Information - CORRECTED mapping
        contactPerson: leadData.contact_person || '',                  // Lead Manager → Contact Person
        contactPosition: '',                                           // Position (empty - to be filled manually)
        contactPhone: leadData.company_contact || '',                  // Company No. → Phone Number (CORRECTED)
        contactEmail: leadData.contact_email || '',                    // Contact Email → Email Address
        
        // Business Details - Direct one-to-one mapping
        seta: leadData.seta || 'wrseta',                               // SETA → SETA
        service: leadData.services ? leadData.services.join(', ') : 'WSP', // Services → Services
        sdlNumber: leadData.sdl_number || '',                          // SDL Number → SDL Number
        moderator: leadData.contact_person || '',                      // Lead Manager → Project Manager
        
        // Financial Information
        monthlyRetainer: leadData.estimated_value ? parseFloat(leadData.estimated_value) / 12 : 0,
        totalValue: leadData.estimated_value || 0,

        
        // Qualification Details (default values for converted leads)
        qualificationType: 'employed_learnership',
        qualificationLevel: 'nqf5',
        
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
        province: leadData.contact_phone || '',                        // Province/State → Province
        country: leadData.country || '',                               // Country → Country (CORRECTED)
        city: leadData.source || '',                                   // City → City
        
        // Additional fields for complete data preservation
        leadManager: leadData.contact_person || '',                    // Lead Manager → Lead Manager
        companyContact: leadData.company_contact || '',                // Company No. → Company Contact
        
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

const Clients = () => {
    const navigate = useNavigate();

    
    // Client data state
    const [clientsData, setClientsData] = useState([]);
    const [convertedLeadsCount, setConvertedLeadsCount] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    
    // Modal state for client actions
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'seta'
    const [showHistoryMode, setShowHistoryMode] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showViewClientModal, setShowViewClientModal] = useState(false);
    const [selectedClientForView, setSelectedClientForView] = useState(null);
    const [attachments, setAttachments] = useState([]);
    
    // Lead details modal state
    const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedConvertedLead, setSelectedConvertedLead] = useState(null);

    // Redacted modal state
    const [showRedactedModal, setShowRedactedModal] = useState(false);
    const [showLeadManagerDropdown, setShowLeadManagerDropdown] = useState(false);
    const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);
    const [showServicesDropdown, setShowServicesDropdown] = useState(false);
    const [redactedFormData, setRedactedFormData] = useState({
        clientName: '',
        clientReg: '',
        clientAddress: '',
        province: '',
        country: '',
        city: '',
        leadManager: '',
        companyContact: '',
        contactPerson: '',
        contactPosition: '',
        contactPhone: '',
        contactEmail: '',
        seta: '',
        service: '',
        sdlNumber: '',
        moderator: '',
        retainer: '',
        documentType: '',
        services: [],
        dg: '',
        wspSubmitted: '',
        wspReason: '',
        clientType: 'regular',
        createdFrom: 'regular'
    });



    // Load data from localStorage on component mount
    useEffect(() => {
        loadClientsData();
        loadConvertedLeadsCount();
    }, []);



    const loadClientsData = () => {
        const storedClients = localStorage.getItem('clientsData');
        if (storedClients) {
            setClientsData(JSON.parse(storedClients));
        }
    };

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

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return 'R 0.00';
        return `R ${parseFloat(amount).toLocaleString('en-ZA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-ZA');
        } catch (error) {
            return 'N/A';
        }
    };

    // Helper function to truncate text with ellipsis
    const truncateText = (text, maxLength = 30) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Helper function to get status badge class
    const getStatusBadgeClass = (status) => {
        if (!status) return 'active';
        const statusLower = status.toLowerCase();
        if (statusLower === 'converted' || statusLower === 'active') return 'converted';
        if (statusLower === 'pending') return 'pending';
        if (statusLower === 'overdue') return 'overdue';
        return 'active';
    };

    // Helper function to map DG values to display values
    const getDGDisplayValue = (dgValue) => {
        if (!dgValue) return 'N/A';
        
        const dgMapping = {
            'DG1': '20-21',
            'DG2': '21-22',
            'DG3': '22-23',
            'DG4': '23-24',
            'DG5': '24-25',
            'DG6': '25-26',
            'DG7': '26-27',
            'DG8': '27-28',
            'DG9': '28-29',
            'DG10': '29-30'
        };
        
        return dgMapping[dgValue] || dgValue;
    };

    const loadConvertedLeadsCount = () => {
        const storedLeads = localStorage.getItem('leadsData');
        if (storedLeads) {
            const leadsData = JSON.parse(storedLeads);
            const convertedLeads = leadsData.filter(lead => lead.status === 'converted');
            setConvertedLeadsCount(convertedLeads.length);
        }
    };

    // Calculate total value from converted leads
    const getConvertedLeadsValue = () => {
        const storedLeads = localStorage.getItem('leadsData');
        if (storedLeads) {
            const leadsData = JSON.parse(storedLeads);
            const convertedLeads = leadsData.filter(lead => lead.status === 'converted');
            return convertedLeads.reduce((sum, lead) => sum + (parseFloat(lead.estimated_value) || 0), 0);
        }
        return 0;
    };

    // Export clients function
    const handleExportClients = async () => {
        setIsExporting(true);
        try {
            // Get all clients data
            const allClients = clientsData;
            
            // Create CSV content
            const headers = [
                'Client Name',
                'Contact Person',
                'Phone',
                'Email',
                'SETA',
                'Services',
                'Monthly Retainer',
                'Total Value',
                'Status',
                'Created Date'
            ];
            
            const csvContent = [
                headers.join(','),
                ...allClients.map(client => [
                    `"${client.clientName || ''}"`,
                    `"${client.contactPerson || ''}"`,
                    `"${client.contactPhone || ''}"`,
                    `"${client.contactEmail || ''}"`,
                    `"${client.seta || ''}"`,
                    `"${client.services ? client.services.join('; ') : ''}"`,
                    `"${client.monthlyRetainer || 0}"`,
                    `"${client.totalValue || 0}"`,
                    `"${client.status || 'Active'}"`,
                    `"${client.createdAt || ''}"`
                ].join(','))
            ].join('\n');
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Clients exported successfully!');
        } catch (error) {
            console.error('Error exporting clients:', error);
            alert('Error exporting clients. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // Get converted leads data for table display
    const getConvertedLeadsData = () => {
        const storedLeads = localStorage.getItem('leadsData');
        if (storedLeads) {
            const leadsData = JSON.parse(storedLeads);
            const convertedLeads = leadsData.filter(lead => lead.status === 'converted');
            console.log('Found converted leads:', convertedLeads);
            return convertedLeads.map(lead => ({
                id: `converted-${lead.id}`,
                clientName: lead.company_name || 'N/A',
                seta: lead.seta || 'N/A',
                service: lead.services ? lead.services.join(', ') : (lead.service_interest || 'N/A'),
                status: 'Converted',
                contactPerson: lead.contact_person || 'N/A',
                monthlyRetainer: parseFloat(lead.estimated_value) / 12 || 0,
                totalValue: parseFloat(lead.estimated_value) || 0,
                lastContact: lead.created_at || lead.created_date || 'N/A',
                isConvertedLead: true,
                originalLead: lead
            }));
        }
        return [];
    };

    // Filter clients based on active tab (now only active clients)
    const getFilteredClients = () => {
        return getFilteredActiveClients();
    };

    // Filter converted leads based on active tab and history mode
    const getFilteredConvertedLeads = () => {
        const convertedLeads = getConvertedLeadsData();
        let filteredLeads = convertedLeads;
        
        // Apply history mode filtering
        if (showHistoryMode) {
            // Show history records (status 'history') and converted leads
            filteredLeads = convertedLeads.filter(lead => 
                lead.status === 'history' || lead.status === 'converted'
            );
        } else {
            // Show current clients (not history records)
            filteredLeads = convertedLeads.filter(lead => 
                lead.status !== 'history'
            );
        }
        
        // Apply tab filtering
        if (activeTab === 'all') {
            return filteredLeads;
        } else if (activeTab === 'seta') {
            // Show converted leads that have SETA information
            return filteredLeads.filter(lead => lead.seta && lead.seta !== 'N/A' && lead.seta !== '');
        }
        return filteredLeads;
    };

    // Get total leads count (only new/pending leads)
    const getTotalLeadsCount = () => {
        const storedLeads = localStorage.getItem('leadsData');
        if (storedLeads) {
            const leadsData = JSON.parse(storedLeads);
            // Count only new and pending leads
            const newLeads = leadsData.filter(lead => lead.status === 'new' || lead.status === 'pending');
            return newLeads.length;
        }
        return 0;
    };

    // Get pending leads count
    const getPendingLeadsCount = () => {
        const storedLeads = localStorage.getItem('leadsData');
        if (storedLeads) {
            const leadsData = JSON.parse(storedLeads);
            return leadsData.filter(lead => lead.status === 'pending' || lead.status === 'new').length;
        }
        return 0;
    };

    // Get overdue leads count
    const getOverdueLeadsCount = () => {
        const storedLeads = localStorage.getItem('leadsData');
        if (storedLeads) {
            const leadsData = JSON.parse(storedLeads);
            const today = new Date();
            return leadsData.filter(lead => {
                if (lead.status === 'converted') return false; // Exclude converted leads
                if (!lead.next_follow_up) return false;
                const followUpDate = new Date(lead.next_follow_up);
                return followUpDate < today;
            }).length;
        }
        return 0;
    };

    // Utility function to get only active clients
    const getActiveClients = () => {
        return clientsData.filter(client => {
            const status = (client.status || '').toLowerCase();
            return status === 'active' || status === 'converted' || !status;
        });
    };

    // Get active clients count
    const getActiveClientsCount = () => {
        return getActiveClients().length;
    };

    // Get active clients total value


    // Get active clients monthly revenue
    const getActiveClientsMonthlyRevenue = () => {
        return getActiveClients().reduce((sum, client) => sum + (client.monthlyRetainer || 0), 0);
    };

    // Get filtered active clients based on tab
    const getFilteredActiveClients = () => {
        const activeClients = getActiveClients();
        if (activeTab === 'all') {
            return activeClients;
        } else if (activeTab === 'seta') {
            // Filter for SETA-funded active clients
            return activeClients.filter(client => 
                client.clientType === 'seta' || 
                client.createdFrom === 'seta' ||
                (client.seta && client.seta !== 'N/A' && client.seta !== '')
            );
        }
        return activeClients;
    };

    // Function to add new client data
    const addNewClient = (clientData) => {
        const newClient = {
            id: Date.now(), // Simple ID generation
            clientName: clientData.clientName || '',
            clientReg: clientData.clientReg || '',
            clientAddress: clientData.clientAddress || '',
            province: clientData.province || '',
            country: clientData.country || '',
            city: clientData.city || '',
            leadManager: clientData.leadManager || clientData.contactPerson || '',
            companyContact: clientData.companyContact || '',
            seta: clientData.seta?.toUpperCase() || '',
            service: clientData.services ? clientData.services.join(', ') : (clientData.service?.toUpperCase() || ''),
            status: 'Active', // Default status
            contactPerson: clientData.contactPerson || '',
            contactPosition: clientData.contactPosition || '',
            contactPhone: clientData.contactPhone || '',
            contactEmail: clientData.contactEmail || '',
            sdlNumber: clientData.sdlNumber || '',
            moderator: clientData.moderator || '',
            monthlyRetainer: parseFloat(clientData.retainer) || 0,
            totalValue: (parseFloat(clientData.retainer) || 0) * 12, // Calculate from monthly retainer
            lastContact: new Date().toISOString().split('T')[0],
            nextFollowUp: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
            services: clientData.services || [],
            documentType: clientData.documentType || 'N/A',
            attachments: clientData.attachments || [],
            clientType: clientData.clientType || 'regular',
            createdFrom: clientData.createdFrom || 'regular',
            createdAt: new Date().toISOString()
        };

        const updatedClients = [...clientsData, newClient];
        setClientsData(updatedClients);
        localStorage.setItem('clientsData', JSON.stringify(updatedClients));
    };

    // Listen for storage events to update data when forms are submitted
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'clientsData') {
                loadClientsData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Expose functions globally so forms can call them
    useEffect(() => {
        window.addNewClientToClientsPage = addNewClient;
        
        return () => {
            delete window.addNewClientToClientsPage;
        };
    }, [clientsData]);

    // Handle client actions
    const handleViewClient = (client) => {
        setSelectedClientForView(client);
        setShowViewClientModal(true);
    };

    const handleViewLeadDetails = (convertedLead) => {
        // For converted leads, we need to access the original lead data
        if (convertedLead.originalLead) {
            setSelectedLead(convertedLead.originalLead);
            setSelectedConvertedLead(convertedLead);
            setShowLeadDetailsModal(true);
        }
    };

    const handleEditConvertedLead = (convertedLead) => {
        // Pre-populate the redacted form with converted lead data
        const originalLead = convertedLead.originalLead;
        setRedactedFormData({
            clientName: originalLead.company_name || '',
            clientReg: originalLead.client_reg || `CONV-${Date.now()}`,
            clientAddress: originalLead.company_address || '',
            province: '',
            country: '',
            city: '',
            leadManager: originalLead.contact_person || '',
            companyContact: originalLead.company_contact || '',
            contactPerson: originalLead.contact_person || '',
            contactPosition: '',
            contactPhone: originalLead.contact_phone || '',
            contactEmail: originalLead.contact_email || '',
            seta: originalLead.seta || '',
            service: originalLead.service_interest || '',
            sdlNumber: originalLead.sdl_number || '',
            moderator: originalLead.moderator || '',
            retainer: originalLead.estimated_value ? (parseFloat(originalLead.estimated_value) / 12).toString() : '',
            documentType: '',
            services: originalLead.services || [],
            dg: '',
            wspSubmitted: '',
            wspReason: '',
            clientType: 'regular',
            createdFrom: 'converted_lead'
        });
        setShowRedactedModal(true);
    };

    const handleConvertLeadToClient = (convertedLead) => {
        // Get the original lead data
        const originalLead = convertedLead.originalLead;
        
        // Use utility function for comprehensive data preservation
        const newClient = convertLeadToClientData(originalLead, convertedLead);
        
        // Add to clients data
        addNewClient(newClient);
        
        // Update the lead status to 'history' (no duplication)
        const storedLeads = localStorage.getItem('leadsData');
        if (storedLeads) {
            const leadsData = JSON.parse(storedLeads);
            const updatedLeads = leadsData.map(lead => 
                lead.id === originalLead.id 
                    ? { 
                        ...lead, 
                        status: 'history', 
                        converted_at: new Date().toISOString(),
                        originalLeadId: lead.id,
                        convertedAt: new Date().toISOString()
                    }
                    : lead
            );
            localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
        }
        
        // Close the modal
        setShowLeadDetailsModal(false);
        setSelectedLead(null);
        
        // Force a re-render by updating the state
        loadConvertedLeadsCount();
        
        // Show success message
        alert('Lead converted to client successfully! Lead moved to history.');
    };

    const handleEditClient = (client) => {
        // Pre-populate the redacted form with original lead data that was converted
        setRedactedFormData({
            // Company Information - from original lead
            clientName: client.clientName && client.clientName !== 'N/A' ? client.clientName : '', // Company name from lead
            clientReg: client.clientReg && client.clientReg !== 'N/A' ? client.clientReg : '', // Registration number from client
            clientAddress: client.clientAddress && client.clientAddress !== 'N/A' ? client.clientAddress : '', // Company address from lead
            province: client.province && client.province !== 'N/A' ? client.province : '', // Province from client
            country: client.country && client.country !== 'N/A' ? client.country : '', // Country from client
            city: client.city && client.city !== 'N/A' ? client.city : '', // City from client
            leadManager: client.leadManager && client.leadManager !== 'N/A' ? client.leadManager : '', // Project Manager from client
            companyContact: client.companyContact && client.companyContact !== 'N/A' ? client.companyContact : '', // Company contact from client
            
            // Contact Information - from original lead
            contactPerson: client.contactPerson && client.contactPerson !== 'N/A' ? client.contactPerson : '', // Contact person from lead
            contactPosition: client.contactPosition && client.contactPosition !== 'N/A' ? client.contactPosition : '', // Contact position from client
            contactPhone: client.contactPhone && client.contactPhone !== 'N/A' ? client.contactPhone : '', // Phone from lead
            contactEmail: client.contactEmail && client.contactEmail !== 'N/A' ? client.contactEmail : '', // Email from lead
            
            // Services & SETA - from original lead
            seta: client.seta && client.seta !== 'N/A' ? client.seta.toLowerCase() : '', // SETA from lead (convert to lowercase for form)
            service: client.service && client.service !== 'N/A' ? client.service : '', // Service from lead
            sdlNumber: client.sdlNumber && client.sdlNumber !== 'N/A' ? client.sdlNumber : '', // SDL number from lead
            moderator: client.moderator && client.moderator !== 'N/A' ? client.moderator : '', // Moderator from lead
            
            // Business Details - from original lead
            retainer: client.monthlyRetainer && client.monthlyRetainer !== 0 ? client.monthlyRetainer.toString() : '',



            documentType: client.documentType || '',
            services: client.services || [],
            dg: client.dg || '',
            wspSubmitted: client.wspSubmitted || '',
            wspReason: client.wspReason || '',
            clientType: client.clientType || 'regular',
            createdFrom: client.createdFrom || 'regular'
        });
        
        // Load attachments if they exist
        if (client.attachments && client.attachments.length > 0) {
            setAttachments(client.attachments);
        } else {
            setAttachments([]);
        }
        
        setSelectedClientForView(client);
        setShowRedactedModal(true);
    };

    const handleSaveClient = (updatedClient) => {
        try {
            // Update the client in the clientsData array
            const updatedClients = clientsData.map(client => 
                client.id === updatedClient.id ? updatedClient : client
            );
            
            // Update state and localStorage
            setClientsData(updatedClients);
            localStorage.setItem('clientsData', JSON.stringify(updatedClients));
            
            // Close the modal
            setShowRedactedModal(false);
            setSelectedClientForView(null);
            
            // Show success message
            alert('Client updated successfully!');
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Error updating client. Please try again.');
        }
    };

    const handleDeleteClient = (clientId) => {
        // Add confirmation dialog to prevent accidental deletion
        if (!window.confirm('Are you sure you want to delete this client record? This action cannot be undone.')) {
            return; // User cancelled the deletion
        }
        
        try {
            // Remove the client from the data
            const updatedClients = clientsData.filter(client => client.id !== clientId);
            
            // Update state and localStorage
            setClientsData(updatedClients);
            localStorage.setItem('clientsData', JSON.stringify(updatedClients));
            
            // Show success message
            alert('Client deleted successfully!');
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Error deleting client. Please try again.');
        }
    };

    const handleConvertToProject = (client) => {
        // Check if the client has "SETA Funded" in their services
        const hasSetaFunded = client.services && client.services.includes('SETA Funded');
        
        if (!hasSetaFunded) {
            alert('Only clients with "SETA Funded" service can be converted to projects. Please update the client services first.');
            return;
        }

        // Ensure we have the most up-to-date client data before conversion
        const ensureUpdatedClientData = () => {
            const storedClients = JSON.parse(localStorage.getItem('clientsData') || '[]');
            const updatedClient = storedClients.find(c => c.id === client.id);
            return updatedClient || client;
        };

        if (window.confirm(`Are you sure you want to convert "${client.clientName}" to a project? This will transfer all client information to the project management table.`)) {
            // Get the latest client data from localStorage to ensure we have the most current DG/SETA values
            const storedClients = JSON.parse(localStorage.getItem('clientsData') || '[]');
            const latestClient = storedClients.find(c => c.id === client.id) || client;
            
            // Create comprehensive project data from client with all preserved information
            const projectData = {
                id: Date.now(),
                
                // Basic project information - map to ProjectManagement fields
                projectManager: client.leadManager || client.contactPerson || '',
                yearRange: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                description: `Project converted from SETA Funded client: ${client.clientName}`,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                
                // Client information - COMPREHENSIVE MAPPING for redacted form
                clientName: latestClient.clientName || '',                           // Company Name
                client: latestClient.clientName || '',                              // Client reference
                clientReg: latestClient.clientReg || '',                            // Registration Number
                clientAddress: latestClient.clientAddress || '',                    // Business Address
                province: latestClient.province || '',                              // Province/State
                country: latestClient.country || '',                                // Country
                city: latestClient.city || '',                                      // City
                
                // Contact information - COMPREHENSIVE MAPPING
                contactPerson: latestClient.contactPerson || '',                    // Contact Person
                contactPosition: latestClient.contactPosition || '',                // Position
                contactPhone: latestClient.contactPhone || '',                      // Phone Number
                contactEmail: latestClient.contactEmail || '',                      // Email Address
                companyContact: latestClient.companyContact || '',                  // Company Contact
                leadManager: latestClient.leadManager || latestClient.contactPerson || '', // Lead Manager
                
                // Project details
                intervention: latestClient.service || 'Training',
                seta: latestClient.seta || '',
                sdlNumber: latestClient.sdlNumber || '',
                moderator: latestClient.moderator || '',
                
                // Financial information
                budget: latestClient.totalValue || latestClient.monthlyRetainer || 0,

                numberOfLearners: latestClient.numberOfLearners || 0,
    
                retainer: latestClient.monthlyRetainer || latestClient.totalValue || '',
                
                // Qualification details

                skillsProgramType: latestClient.skillsProgramType || '',
                unitStandards: latestClient.unitStandards || '',
                modules: latestClient.modules || '',
                credits: latestClient.credits || '',
                
                // Accreditation details
                accreditingBody: latestClient.accreditingBody || 'QCTO',
                accreditationNumber: latestClient.accreditationNumber || '',
                qualifications: latestClient.qualifications || '',
                nqfLevel: latestClient.nqfLevel || '',
                ofoNumber: latestClient.ofoNumber || '',
                issuedBy: latestClient.issuedBy || new Date().toISOString().split('T')[0],
                expires: latestClient.expires || '',
                duration: latestClient.duration || '5 years',
                
                // Legacy qualification details
                selectedLegacyQualification: latestClient.selectedLegacyQualification || '',
                independentNqfLevel: latestClient.independentNqfLevel || '',
                independentCredits: latestClient.independentCredits || '',
                
                // Documents and attachments
                documentType: latestClient.documentType || 'N/A',
                attachments: latestClient.attachments || [],
                
                // Status and tracking
                status: 'Active',
                createdAt: new Date().toISOString(),
                convertedFromClient: true,
                originalClientId: latestClient.id,
                lastContact: latestClient.lastContact || new Date().toISOString().split('T')[0],
                nextFollowUp: latestClient.nextFollowUp || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                
                // Additional client-specific data
                clientType: latestClient.clientType || 'regular',
                createdFrom: latestClient.createdFrom || 'client_conversion',
                source: 'converted_client',
                notes: latestClient.notes || `Converted from SETA Funded client on ${new Date().toLocaleDateString()}`,
                
                // WSP and DG information
                wspSubmitted: latestClient.wspSubmitted || '',
                wspReason: latestClient.wspReason || '',
                dg: latestClient.dg || '',
                
                // Services array
                services: latestClient.services || [],
                
                // Preserve all original client data for complete workflow continuity
                originalClientData: latestClient
            };

            // Get existing projects data and add the new project
            const existingProjects = JSON.parse(localStorage.getItem('projectData') || '[]');
            const updatedProjects = [...existingProjects, projectData];
            
            // Debug: Log the project data being saved
            console.log('Saving Project Data:', projectData);
            console.log('Client Info Being Saved:', {
                clientName: projectData.clientName,
                companyContact: projectData.companyContact,
                dg: projectData.dg,
                seta: projectData.seta
            });
            console.log('Original Client Data:', client);
            console.log('DG from client:', client.dg);
            console.log('SETA from client:', client.seta);
            
            // Save project to localStorage (using the correct key for ProjectManagement)
            localStorage.setItem('projectData', JSON.stringify(updatedProjects));
            
            // Refresh project data in ProjectManagement component
            if (window.refreshProjectData) {
                window.refreshProjectData();
            }
            
            // Remove the client from clientsData (delete from client records table)
            const updatedClients = clientsData.filter(c => c.id !== client.id);
            setClientsData(updatedClients);
            localStorage.setItem('clientsData', JSON.stringify(updatedClients));
            
            alert(`SETA Funded client "${client.clientName}" has been successfully converted to a project and transferred to the project management table!`);
        }
    };

    const handleDeleteConvertedLead = (convertedLeadId) => {
        // Add confirmation dialog to prevent accidental deletion
        if (!window.confirm('Are you sure you want to delete this converted lead? This action cannot be undone.')) {
            return; // User cancelled the deletion
        }
        
        try {
            // Remove the converted lead from localStorage
            const storedLeads = localStorage.getItem('leadsData');
            if (storedLeads) {
                const leadsData = JSON.parse(storedLeads);
                const actualLeadId = convertedLeadId.replace('converted-', '');
                // Convert both IDs to numbers for comparison to handle potential type mismatches
                const actualLeadIdNum = Number(actualLeadId);
                const updatedLeads = leadsData.filter(lead => Number(lead.id) !== actualLeadIdNum);
                localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
            }
            
            // Force a re-render by updating the state
            loadConvertedLeadsCount();
            
            // Show success message
            alert('Converted lead deleted successfully!');
        } catch (error) {
            console.error('Error deleting converted lead:', error);
            alert('Error deleting converted lead. Please try again.');
        }
    };



    const closeSlaModal = () => {
        // Modal close functionality removed
        console.log('Modal close functionality removed');
    };



    // Redacted modal handlers
    const handleRedactedInputChange = (e) => {
        const { name, value } = e.target;
        
        // Ensure no character limitations are enforced
        if (e.target.type === 'text' || e.target.type === 'email' || e.target.type === 'tel' || e.target.type === 'textarea') {
            // Remove any maxlength attribute if it exists
            if (e.target.hasAttribute('maxlength')) {
                e.target.removeAttribute('maxlength');
            }
            // Remove any minlength attribute if it exists
            if (e.target.hasAttribute('minlength')) {
                e.target.removeAttribute('minlength');
            }
        }
        
        setRedactedFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // File upload functions
    const handleFileSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '*/*';
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            const selectedDocumentType = redactedFormData.documentType || 'Other';
            
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

    const removeAttachment = (attachmentId) => {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    };

    const handleFilePreview = (attachment) => {
        if (attachment.file) {
            const url = URL.createObjectURL(attachment.file);
            window.open(url, '_blank');
        }
    };

    const handleRedactedSubmit = (e) => {
        e.preventDefault();
        
        // Check if we're editing an existing client
        const isEditing = selectedClientForView && selectedClientForView.id;
        
        // Create client data
        const clientData = {
            id: isEditing ? selectedClientForView.id : Date.now(),
            clientName: redactedFormData.clientName.trim(),
            clientReg: redactedFormData.clientReg.trim(),
            clientAddress: redactedFormData.clientAddress.trim(),
            province: redactedFormData.province.trim(),
            country: redactedFormData.country.trim(),
            city: redactedFormData.city.trim(),
            leadManager: redactedFormData.leadManager.trim(),

            conceptionDate: redactedFormData.conceptionDate,
            contactPerson: redactedFormData.contactPerson.trim(),
            contactPhone: redactedFormData.contactPhone.trim(),
            contactEmail: redactedFormData.contactEmail.trim(),
            companyContact: redactedFormData.companyContact.trim(),
            seta: redactedFormData.seta?.toUpperCase() || '',
            service: redactedFormData.services ? redactedFormData.services.join(', ') : '',
            sdlNumber: redactedFormData.sdlNumber.trim(),
            moderator: redactedFormData.moderator.trim(),
            qualificationType: redactedFormData.qualificationType || '',
            qualificationLevel: redactedFormData.qualificationLevel || '',
            documentType: redactedFormData.documentType || '',
            monthlyRetainer: parseFloat(redactedFormData.retainer) || 0,

            totalValue: (parseFloat(redactedFormData.retainer) || 0) * 12,
            services: redactedFormData.services || [],
            attachments: attachments,
            dg: redactedFormData.dg || '',
            wspSubmitted: redactedFormData.wspSubmitted || '',
            wspReason: redactedFormData.wspReason || '',
            numberOfLearners: parseInt(redactedFormData.numberOfLearners) || 0,
            skillsProgramType: redactedFormData.skillsProgramType || '',
            unitStandards: redactedFormData.unitStandards || '',
            modules: redactedFormData.modules || '',
            credits: redactedFormData.credits || '',
            accreditingBody: redactedFormData.accreditingBody || 'QCTO',
            accreditationNumber: redactedFormData.accreditationNumber || '',
            qualifications: redactedFormData.qualifications || '',
            nqfLevel: redactedFormData.nqfLevel || '',
            ofoNumber: redactedFormData.ofoNumber || '',
            issuedBy: redactedFormData.issuedBy || new Date().toISOString().split('T')[0],
            expires: redactedFormData.expires || '',
            duration: redactedFormData.duration || '5 years',
            selectedLegacyQualification: redactedFormData.selectedLegacyQualification || '',
            independentNqfLevel: redactedFormData.independentNqfLevel || '',
            independentCredits: redactedFormData.independentCredits || '',
            clientType: redactedFormData.clientType || 'regular',
            createdFrom: isEditing ? selectedClientForView.createdFrom : 'redacted',
            lastContact: isEditing ? selectedClientForView.lastContact : new Date().toISOString().split('T')[0],
            nextFollowUp: isEditing ? selectedClientForView.nextFollowUp : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: isEditing ? selectedClientForView.createdAt : new Date().toISOString(),
            status: isEditing ? selectedClientForView.status : 'Converted'
        };

        if (isEditing) {
            // Update existing client
            const updatedClients = clientsData.map(client => 
                client.id === selectedClientForView.id ? clientData : client
            );
        setClientsData(updatedClients);
        localStorage.setItem('clientsData', JSON.stringify(updatedClients));
        } else {
            // Add new client
            const updatedClients = [...clientsData, clientData];
            setClientsData(updatedClients);
            localStorage.setItem('clientsData', JSON.stringify(updatedClients));
        }

        // Reset form and close modal
        setRedactedFormData({
            clientName: '',
            clientReg: '',
            clientAddress: '',
            province: '',
            country: '',
            city: '',
            leadManager: '',

            conceptionDate: new Date().toISOString().split('T')[0],
            contactPerson: '',
            contactPhone: '',
            contactEmail: '',
            companyContact: '',
            seta: '',
            service: '',
            sdlNumber: '',
            moderator: '',
            retainer: '',
            documentType: '',
            services: [],
            dg: '',
            wspSubmitted: '',
            wspReason: '',
            numberOfLearners: '',
            skillsProgramType: '',
            unitStandards: '',
            modules: '',
            credits: '',
            accreditingBody: 'QCTO',
            accreditationNumber: '',
            qualifications: '',
            nqfLevel: '',
            ofoNumber: '',
            issuedBy: new Date().toISOString().split('T')[0],
            expires: '',
            duration: '5 years',
            selectedLegacyQualification: '',
            independentNqfLevel: '',
            independentCredits: '',
            clientType: 'regular'
        });
        setAttachments([]);
        setShowRedactedModal(false);
        setSelectedClientForView(null);
        
        // Show success message
        alert(isEditing ? 'Client updated successfully!' : 'Client created successfully!');
    };



    // Guide steps for the clients table
    const combinedGuideSteps = [
        // Table Section
        {
            title: "Client Records Section",
            description: "This is your main client management area. Here you can view, manage, and track all your clients in a comprehensive table format.",
            target: ".modules-section"
        },
        {
            title: "Add Client Button",
            description: "Click this dropdown button to create a new client. Choose between SETA Funded or Industrial Funded clients.",
            target: ".add-module-btn"
        },
        {
            title: "Client Tabs",
            description: "Filter your clients by type: All Clients, SETA Funded, or Industrial Funded. Click to switch between views.",
            target: ".tabs-container"
        },
        {
            title: "Search Function",
            description: "Search through your clients by name, contact person, or any other details. Type to filter results instantly.",
            target: ".search-container"
        },
        {
            title: "Client Name Column",
            description: "Shows the company or organization name for each client. This is the primary identifier for each client record.",
            target: ".modules-table thead th:nth-child(1)"
        },
        {
            title: "Fund Type",
            description: "Displays the funding source for each client (SETA, Industrial, etc.). This helps categorize your clients.",
            target: ".modules-table thead th:nth-child(2)"
        },
        {
            title: "Service Type",
            description: "Shows what type of service or training program the client is enrolled in.",
            target: ".modules-table thead th:nth-child(3)"
        },
        {
            title: "Status",
            description: "Current status of the client relationship (Active, In Progress, Completed, etc.).",
            target: ".modules-table thead th:nth-child(4)"
        },
        {
            title: "Contact Person",
            description: "The main contact person's name for each client. This is who you communicate with.",
            target: ".modules-table thead th:nth-child(5)"
        },
        {
            title: "Monthly Retainer",
            description: "The monthly payment amount from each client. This shows your recurring revenue per client.",
            target: ".modules-table thead th:nth-child(6)"
        },
        {
            title: "Total Value",
            description: "The total contract value for each client. This represents the full value of the client relationship.",
            target: ".modules-table thead th:nth-child(7)"
        },
        {
            title: "Last Contact",
            description: "When you last communicated with the client. Useful for tracking follow-up timing.",
            target: ".modules-table thead th:nth-child(8)"
        },
        // Action Buttons for Converted Leads
        {
            title: "View Lead Details",
            description: "Click this button to view all the details of a converted lead in a popup modal.",
            target: ".action-buttons .btn-icon:first-child"
        },
        {
            title: "Convert to Client",
            description: "This button converts a lead into a full client record. Creates a permanent client profile.",
            target: ".action-buttons .btn-icon:nth-child(2)"
        },
        {
            title: "Delete Converted Lead",
            description: "Removes the converted lead from your system. Use with caution - this action cannot be undone.",
            target: ".action-buttons .btn-icon:last-child"
        },
        // Action Buttons for Regular Clients
        {
            title: "View Client Details",
            description: "Click this button to view all the details of a client in a popup modal.",
            target: ".action-buttons .btn-icon:first-child"
        },
        {
            title: "Edit Client",
            description: "This button opens an edit form where you can modify any client information.",
            target: ".action-buttons .btn-icon:nth-child(2)"
        },
        {
            title: "Delete Client",
            description: "Removes the client from your system. Use with caution - this action cannot be undone.",
            target: ".action-buttons .btn-icon:last-child"
        }
    ];

    const handleGuideComplete = () => {
        setShowGuide(false);
        localStorage.setItem('clientsCombinedGuideSeen', 'true');
    };

    const handleGuideSkip = () => {
        setShowGuide(false);
        localStorage.setItem('clientsCombinedGuideSeen', 'true');
    };

    const startGuide = () => {
        setShowGuide(true);
    };

    // Modern main content matching the HTML mockup design
    const pageContent = (
        <>
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

            {/* Client Header Section */}
            <div className="wsp-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>Client Management</h1>
                        <p>Comprehensive client relationship, contract, and business opportunity management</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className={`btn-secondary ${isExporting ? 'exporting' : ''}`}
                            onClick={handleExportClients}
                            disabled={isExporting}
                        >
                            <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                            {isExporting ? 'Exporting...' : 'Export Clients'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="wsp-content">
                {/* Clients Section */}
            <div className="modules-section">
                <div className="modules-header">
                    <h2 className="modules-title">
                        {showHistoryMode ? 'Client History' : 'Client Records'}
                    </h2>
                    <div className="header-actions">
                        <button 
                            className="add-client-btn" 
                            onClick={() => {
                                setSelectedClientForView(null);
                                setShowRedactedModal(true);
                            }}
                            style={{
                                background: '#006400',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                marginRight: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <i className="fas fa-plus"></i>
                            Add Client
                                                </button>

                        <button className={`history-btn ${showHistoryMode ? 'active' : ''}`} onClick={() => setShowHistoryMode(!showHistoryMode)}>
                            <i className="fas fa-history"></i>
                            {showHistoryMode ? 'Current Clients' : 'History'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <button 
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Clients
                    </button>
                    <button 
                        className={`tab ${activeTab === 'seta' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seta')}
                    >
                        SETA Funded
                    </button>

                </div>

                {/* Search Bar */}
                <div className="search-container">
                    <input 
                        type="text" 
                        placeholder="Search clients..." 
                        className="search-input"
                    />
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>

                {/* Clients Table */}
                <div className="table-container">
                    <table className="modules-table">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Lead Manager</th>
                                <th>Services</th>
                                <th>SETA</th>
                                <th>Document Type</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Converted leads data */}
                            {getFilteredConvertedLeads().map((convertedLead) => (
                                <tr 
                                    key={convertedLead.id}
                                    className="client-row clickable"
                                    onClick={() => handleViewClient(convertedLead)}
                                >
                                    <td className="module-name">
                                        {convertedLead.clientName}
                                    </td>
                                    <td>{convertedLead.contactPerson}</td>
                                    <td>{convertedLead.service}</td>
                                    <td>{convertedLead.seta ? convertedLead.seta.toUpperCase() : 'N/A'}</td>
                                    <td>{abbreviateDocumentType(convertedLead.originalLead.documentType, convertedLead.originalLead.attachments)}</td>
                                    <td>
                                        <span className="status-badge converted">{convertedLead.status}</span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-icon" 
                                                title="View Lead Details"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewLeadDetails(convertedLead);
                                                }}
                                            >
                                                <i className="fas fa-user-plus"></i>
                                            </button>
                                            {convertedLead.status !== 'history' && (
                                                                                            <button 
                                                className="btn-icon" 
                                                title="Edit Client"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditConvertedLead(convertedLead);
                                                }}
                                            >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            )}
                                            <button 
                                                className="btn-icon" 
                                                title="Delete Converted Lead"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteConvertedLead(convertedLead.id);
                                                }}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                            {/* Dynamic data from forms */}
                            {getFilteredActiveClients().map((client) => (
                                <tr 
                                    key={client.id}
                                    className="client-row clickable"
                                    onClick={() => handleViewClient(client)}
                                >
                                    <td className="module-name">{client.clientName || 'N/A'}</td>
                                    <td>{client.leadManager || client.contactPerson || 'N/A'}</td>
                                    <td title={client.service || 'N/A'}>{truncateText(client.service || 'N/A')}</td>
                                    <td>{client.seta ? client.seta.toUpperCase() : 'N/A'}</td>
                                    <td>{abbreviateDocumentType(client.documentType, client.attachments)}</td>
                                    <td>
                                        <span className="status-badge in-progress">{client.status || 'Active'}</span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-icon" 
                                                title="View Details"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewClient(client);
                                                }}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button 
                                                className="btn-icon" 
                                                title="Edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClient(client);
                                                }}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                className="btn-icon" 
                                                title="Delete"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeleteClient(client.id);
                                                }}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                            {(client.service && client.service.includes('SETA Funded')) && (
                                                <button 
                                                    className="btn-icon convert-project" 
                                                    title="Convert to Project"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleConvertToProject(client);
                                                    }}
                                                >
                                                    <i className="fas fa-project-diagram"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                            {/* Show message when no records */}
                            {getFilteredActiveClients().length === 0 && getFilteredConvertedLeads().length === 0 && (
                                <tr>
                                    <td colSpan="9" className="no-records-message">
                                        <div className="empty-state">
                                            <i className="fas fa-users"></i>
                                            <h3>No Client Records</h3>
                                            <p>No client records found. No action buttons are currently available.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lead Details Modal */}
            {showLeadDetailsModal && selectedLead && (
                <div className="modal-overlay">
                    <div className="modal-content view-lead-modal">
                        <div className="modal-header">
                            <h2>Lead Details</h2>
                            <button className="modal-close" onClick={() => setShowLeadDetailsModal(false)}>
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
                                            <strong>Project Manager:</strong>
                                            <span>{selectedLead.company_contact || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Lead Manager:</strong>
                                            <span>{selectedLead.contact_person}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Conception Date:</strong>
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
                                            <span>{selectedLead.services ? selectedLead.services.join(', ') : (selectedLead.source || 'N/A')}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>SETA:</strong>
                                            <span>{selectedLead.seta ? selectedLead.seta.toUpperCase() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial & Documents Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Financial & Documents</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <strong>Estimated Value:</strong>
                                            <span>{formatCurrency(selectedLead.estimated_value)}</span>
                                        </div>
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
                                <button type="button" className="btn secondary" onClick={() => {
                                    setShowLeadDetailsModal(false);
                                    setSelectedConvertedLead(null);
                                }}>
                                    Close
                                </button>
                                {selectedConvertedLead && (
                                    <button 
                                        type="button" 
                                        className="btn primary" 
                                        onClick={() => handleConvertLeadToClient(selectedConvertedLead)}
                                    >
                                        Convert to Client
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Redacted Modal */}
            {showRedactedModal && (
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
                            <h2 style={{ margin: 0, color: '#006400', fontWeight: 'bold', fontSize: '20px' }}>
                                {selectedClientForView ? 'Edit Client' : 'Add New Client'}
                            </h2>
                            <button className="modal-close" onClick={() => {
                                setShowRedactedModal(false);
                                setSelectedClientForView(null);
                            }} style={{
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
                            <form id="redacted-form" onSubmit={handleRedactedSubmit}>
                                    {/* Project Information Section */}
                                    <div className="form-section" style={{
                                        marginBottom: '30px',
                                        padding: '20px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <h3 className="section-title" style={{
                                            color: '#006400',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            marginBottom: '20px',
                                            paddingBottom: '10px',
                                            borderBottom: '2px solid #006400'
                                        }}>Client Information</h3>
                                        <div className="form-row">
                                            <div className="form-group" style={{
                                                marginBottom: '20px'
                                            }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    fontSize: '14px'
                                                }}>Company Name *</label>
                                                <input
                                                    type="text"
                                                    name="clientName"
                                                    value={redactedFormData.clientName}
                                                    onChange={handleRedactedInputChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Project Manager *</label>
                                                <div className="lead-manager-dropdown-container">
                                                    <div 
                                                        className="lead-manager-dropdown-trigger"
                                                        onClick={() => setShowLeadManagerDropdown(!showLeadManagerDropdown)}
                                                    >
                                                        <span className="lead-manager-placeholder">
                                                            {redactedFormData.leadManager || 'Select Lead Manager'}
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
                                                                        setRedactedFormData(prev => ({ ...prev, leadManager: manager }));
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
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Company Rep *</label>
                                                <input
                                                    type="text"
                                                    name="companyContact"
                                                    value={redactedFormData.companyContact}
                                                    onChange={handleRedactedInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Registration Number *</label>
                                                <input
                                                    type="text"
                                                    name="clientReg"
                                                    value={redactedFormData.clientReg}
                                                    onChange={handleRedactedInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>SDL Number *</label>
                                                <input
                                                    type="text"
                                                    name="sdlNumber"
                                                    value={redactedFormData.sdlNumber}
                                                    onChange={handleRedactedInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>DG</label>
                                                <select
                                                    name="dg"
                                                    value={redactedFormData.dg}
                                                    onChange={handleRedactedInputChange}
                                                >
                                                    <option value="">Select DG</option>
                                                    <option value="DG1">20-21</option>
                                                    <option value="DG2">21-22</option>
                                                    <option value="DG3">22-23</option>
                                                    <option value="DG4">23-24</option>
                                                    <option value="DG5">24-25</option>
                                                    <option value="DG6">25-26</option>
                                                    <option value="DG7">26-27</option>
                                                    <option value="DG8">27-28</option>
                                                    <option value="DG9">28-29</option>
                                                    <option value="DG10">29-30</option>
                                                </select>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Contact Information Section */}
                                    <div className="form-section" style={{
                                        marginBottom: '30px',
                                        padding: '20px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <h3 className="section-title" style={{
                                            color: '#006400',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            marginBottom: '20px',
                                            paddingBottom: '10px',
                                            borderBottom: '2px solid #006400'
                                        }}>Contact & Location</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Business Address *</label>
                                                <textarea
                                                    name="clientAddress"
                                                    value={redactedFormData.clientAddress}
                                                    onChange={handleRedactedInputChange}
                                                    rows="3"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Company No. *</label>
                                                <input
                                                    type="tel"
                                                    name="contactPhone"
                                                    value={redactedFormData.contactPhone}
                                                    onChange={handleRedactedInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Province/State *</label>
                                                <select
                                                    name="province"
                                                    value={redactedFormData.province}
                                                    onChange={handleRedactedInputChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
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
                                                <label>Country *</label>
                                                <select
                                                    name="country"
                                                    value={redactedFormData.country}
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
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>City *</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={redactedFormData.city}
                                                    onChange={handleRedactedInputChange}
                                                    placeholder="Enter city name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Email Address *</label>
                                                <input
                                                    type="email"
                                                    name="contactEmail"
                                                    value={redactedFormData.contactEmail}
                                                    onChange={handleRedactedInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services & SETA Section */}
                                    <div className="form-section" style={{
                                        marginBottom: '30px',
                                        padding: '20px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <h3 className="section-title" style={{
                                            color: '#006400',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            marginBottom: '20px',
                                            paddingBottom: '10px',
                                            borderBottom: '2px solid #006400'
                                        }}>Services & Programs</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Services *</label>
                                                <div className="services-dropdown-container">
                                                    <div 
                                                        className="services-dropdown-trigger"
                                                        onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                                                    >
                                                        <span className="services-placeholder">
                                                            {redactedFormData.services && redactedFormData.services.length > 0 
                                                                ? redactedFormData.services.join(', ') 
                                                                : 'Select Services'
                                                            }
                                                        </span>
                                                        <i className={`fas fa-chevron-down ${showServicesDropdown ? 'rotated' : ''}`}></i>
                                                    </div>
                                                    {showServicesDropdown && (
                                                        <div className="services-dropdown-options">
                                                            {['WSP', 'HR', 'Employment Equity', 'Industry Funded', 'SETA Funded', 'BBBEE'].map((service) => (
                                                                <div 
                                                                    key={service} 
                                                                    className="service-option"
                                                                    onClick={() => {
                                                                        setRedactedFormData(prev => {
                                                                            const currentServices = prev.services || [];
                                                                            const updatedServices = currentServices.includes(service)
                                                                                ? currentServices.filter(s => s !== service)
                                                                                : [...currentServices, service];
                                                                            return { ...prev, services: updatedServices };
                                                                        });
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={redactedFormData.services && redactedFormData.services.includes(service)}
                                                                        readOnly
                                                                    />
                                                                    <span>{service}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>SETA</label>
                                                <select
                                                    name="seta"
                                                    value={redactedFormData.seta}
                                                    onChange={handleRedactedInputChange}
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
                                        
                                        {/* Document Type Selection */}
                                        <div className="form-row">
                                            <div className="form-group" style={{
                                                marginBottom: '20px'
                                            }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    fontSize: '14px'
                                                }}>Document Type</label>
                                                <select
                                                    name="documentType"
                                                    value={redactedFormData.documentType || ''}
                                                    onChange={handleRedactedInputChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    <option value="">Select Document Type</option>
                                                    <option value="SLA">SLA</option>
                                                    <option value="SDF Appointment Letter">SDF Appointment Letter</option>
                                                    <option value="Contract">Contract</option>
                                                    <option value="Invoice">Invoice</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial & Compliance Section */}
                                    <div className="form-section" style={{
                                        marginBottom: '30px',
                                        padding: '20px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <h3 className="section-title" style={{
                                            color: '#006400',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            marginBottom: '20px',
                                            paddingBottom: '10px',
                                            borderBottom: '2px solid #006400'
                                        }}>Financial & Compliance</h3>
                                        <div className="form-row">
                                            <div className="form-group" style={{
                                                marginBottom: '20px'
                                            }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    fontSize: '14px'
                                                }}>WSP</label>
                                                <select
                                                    name="wspSubmitted"
                                                    value={redactedFormData.wspSubmitted}
                                                    onChange={handleRedactedInputChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    <option value="">Submitted?</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                            <div className="form-group" style={{
                                                marginBottom: '20px'
                                            }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    fontSize: '14px'
                                                }}>Monthly Retainer *</label>
                                                <input
                                                    type="number"
                                                    name="retainer"
                                                    value={redactedFormData.retainer}
                                                    onChange={handleRedactedInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {/* Conditional textbox that appears when WSP is "No" */}
                                        {redactedFormData.wspSubmitted === 'No' && (
                                            <div className="form-row">
                                                <div className="form-group" style={{
                                                    marginBottom: '20px'
                                                }}>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        fontWeight: '600',
                                                        color: '#333',
                                                        fontSize: '14px'
                                                    }}>Reason for not submitting WSP</label>
                                                    <textarea
                                                        name="wspReason"
                                                        value={redactedFormData.wspReason}
                                                        onChange={handleRedactedInputChange}
                                                        placeholder="Please provide a reason for not submitting the Workplace Skills Plan..."
                                                        rows="3"
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 12px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            fontSize: '14px',
                                                            backgroundColor: 'white',
                                                            resize: 'vertical'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Documents Section */}
                                        <div className="form-row">
                                            <div className="form-group" style={{
                                                marginBottom: '20px'
                                            }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    fontSize: '14px'
                                                }}>Upload Documents</label>
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
                                                    .filter(attachment => attachment.documentType === redactedFormData.documentType)
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
                                    setShowRedactedModal(false);
                                    setSelectedClientForView(null);
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

                            <button 
                                type="submit" 
                                className="btn primary" 
                                form="redacted-form"
                                style={{
                                    background: '#006400',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {selectedClientForView ? 'Update Client' : 'Create Client'}
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
                                    setRedactedFormData(prev => ({ ...prev, leadManager: newManagerName }));
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
                                        Create Lead Manager
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Client Modal - Read-only version with beautiful layout */}
            {showViewClientModal && selectedClientForView && (
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
                            <h2 style={{ margin: 0, color: '#006400', fontWeight: 'bold' }}>
                                Client Details
                            </h2>
                            <button className="modal-close" onClick={() => setShowViewClientModal(false)} style={{
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
                            <div className="create-lead-form">
                                {/* Company Information Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Company Information</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Company Name *</label>
                                            <div className="read-only-value">{selectedClientForView.clientName || 'N/A'}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>Project Manager *</label>
                                            <div className="read-only-value">{selectedClientForView.leadManager || selectedClientForView.contactPerson || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Company Rep</label>
                                            <div className="read-only-value">{selectedClientForView.companyContact || 'N/A'}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>Contact Person</label>
                                            <div className="read-only-value">{selectedClientForView.contactPerson || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Registration Number *</label>
                                            <div className="read-only-value">{selectedClientForView.clientReg || 'N/A'}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>SDL Number *</label>
                                            <div className="read-only-value">{selectedClientForView.sdlNumber || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>DG</label>
                                            <div className="read-only-value">{getDGDisplayValue(selectedClientForView.dg)}</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>WSP</label>
                                            <div className="read-only-value">{selectedClientForView.wspSubmitted || 'N/A'}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>Monthly Retainer *</label>
                                            <div className="read-only-value">
                                                {selectedClientForView.monthlyRetainer ? `R ${selectedClientForView.monthlyRetainer.toLocaleString()}` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Conditional WSP Reason - only show if WSP is "No" */}
                                    {selectedClientForView.wspSubmitted === 'No' && selectedClientForView.wspReason && (
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Reason for not submitting WSP</label>
                                                <div className="read-only-value">{selectedClientForView.wspReason}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Information Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Contact Information</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Business Address *</label>
                                            <div className="read-only-value">{selectedClientForView.clientAddress || 'N/A'}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>Company No. *</label>
                                            <div className="read-only-value">{selectedClientForView.contactPhone || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Province/State *</label>
                                            <div className="read-only-value">{selectedClientForView.province || 'N/A'}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>Country *</label>
                                            <div className="read-only-value">{selectedClientForView.country || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City *</label>
                                            <div className="read-only-value">{selectedClientForView.city || 'N/A'}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address *</label>
                                            <div className="read-only-value">{selectedClientForView.contactEmail || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Contact Position</label>
                                            <div className="read-only-value">{selectedClientForView.contactPosition || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Services & SETA Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Services & SETA</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Services *</label>
                                            <div className="read-only-value">
                                                {selectedClientForView.services && selectedClientForView.services.length > 0 
                                                    ? selectedClientForView.services.join(', ') 
                                                    : (selectedClientForView.service || 'N/A')
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>SETA</label>
                                            <div className="read-only-value">{selectedClientForView.seta ? selectedClientForView.seta.toUpperCase() : 'N/A'}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Documents Section */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Document Type</label>
                                            <div className="read-only-value">{selectedClientForView.documentType || 'N/A'}</div>
                                        </div>

                                    </div>
                                    
                                    {/* Attachments Section */}
                                    {selectedClientForView.attachments && selectedClientForView.attachments.length > 0 && (
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Attachments</label>
                                                <div className="attachments-list">
                                                    {selectedClientForView.attachments.map((attachment) => (
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
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>



                            </div>
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
                                onClick={() => setShowViewClientModal(false)}
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
                                Close
                            </button>
                            <div style={{ fontWeight: 'bold', color: '#006400' }}>
                                Client Details
                            </div>
                            <button 
                                type="button" 
                                className="btn primary" 
                                style={{
                                    background: '#006400',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    visibility: 'hidden'
                                }}
                            >
                                Placeholder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            </div>

            {/* Combined Guide */}
            <GridCardGuide 
                isActive={showGuide}
                onComplete={handleGuideComplete}
                onSkip={handleGuideSkip}
                steps={combinedGuideSteps}
            />
        </>
    );

    // Ensure no character limitations on input fields when modal opens
    useEffect(() => {
        if (showRedactedModal) {
            // Remove any maxlength/minlength attributes from all input fields
            const inputs = document.querySelectorAll('.create-lead-modal input[type="text"], .create-lead-modal input[type="email"], .create-lead-modal input[type="tel"], .create-lead-modal textarea');
            inputs.forEach(input => {
                if (input.hasAttribute('maxlength')) {
                    input.removeAttribute('maxlength');
                }
                if (input.hasAttribute('minlength')) {
                    input.removeAttribute('minlength');
                }
                // Ensure CSS properties are set for unlimited input
                input.style.textOverflow = 'clip';
                input.style.overflow = 'visible';
                input.style.whiteSpace = 'normal';
                input.style.wordWrap = 'break-word';
            });
        }
    }, [showRedactedModal]);

    return (
        <HubSpotLayout title="Clients" description="View and manage all your client information.">
            {pageContent}
        </HubSpotLayout>
    );
};

export default Clients; 
