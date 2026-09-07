import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HubSpotLayout from '../components/HubSpotLayout';
import '../css/LeadsHubSpot.css';

const LeadsHubSpot = () => {
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
    const [searchTerm, setSearchTerm] = useState('');

    // Form data for creating new lead
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

    // Form data for converting to quotation
    const [quotationData, setQuotationData] = useState({
        title: '',
        total_value: '',
        payment_terms: '30',
        valid_until: '',
        notes: ''
    });

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            setLoading(true);
            const storedLeads = localStorage.getItem('leadsData');
            if (storedLeads) {
                const parsedLeads = JSON.parse(storedLeads);
                setLeads(parsedLeads);
            }
        } catch (error) {
            setError('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        try {
            const newLead = {
                id: Date.now(),
                ...formData,
                status: 'pending',
                created_date: new Date().toISOString().split('T')[0],
                estimated_value: parseFloat(formData.estimated_value) || 0
            };

            const updatedLeads = [...leads, newLead];
            setLeads(updatedLeads);
            localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
            setShowCreateModal(false);
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
        } catch (error) {
            setError('Failed to create lead');
        }
    };

    const handleDeleteLead = (lead) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            const updatedLeads = leads.filter(l => l.id !== lead.id);
            setLeads(updatedLeads);
            localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'converted': return 'status-converted';
            case 'qualified': return 'status-qualified';
            case 'pending': return 'status-pending';
            case 'lost': return 'status-lost';
            default: return 'status-pending';
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Header actions
    const headerActions = [
        {
            label: 'Create Lead',
            variant: 'primary',
            icon: 'fas fa-plus',
            onClick: () => setShowCreateModal(true)
        }
    ];

    // (move all code from return into a variable)
    const pageContent = (
        <>
            {/* Metrics Cards */}
            <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Total Leads</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#006400' }}>
                        {leads.filter(lead => lead.status === 'new' || lead.status === 'pending').length}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Converted</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
                        {leads.filter(lead => lead.status === 'converted').length}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Pending</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
                        {leads.filter(lead => lead.status === 'pending').length}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Total Value</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#006400' }}>
                        {formatCurrency(leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0))}
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="table-container">
                <div className="table-header">
                    <h2>All Leads</h2>
                    <div className="table-actions">
                        <div className="table-search-container">
                            <i className="fas fa-search table-search-icon"></i>
                            <input
                                type="text"
                                className="table-search-input"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-secondary">
                            <i className="fas fa-filter"></i>
                            Filter
                        </button>
                    </div>
                </div>
                
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Contact</th>
                                <th>Service</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id}>
                                    <td>
                                        <div className="client-name">{lead.company_name}</div>
                                    </td>
                                    <td>
                                        <div>{lead.contact_person}</div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{lead.contact_email}</div>
                                    </td>
                                    <td>{lead.service_interest}</td>
                                    <td className="currency">{formatCurrency(lead.estimated_value)}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(lead.created_date)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-icon" 
                                                onClick={() => handleViewLead(lead)}
                                                title="View"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button 
                                                className="btn-icon" 
                                                onClick={() => handleEditLead(lead)}
                                                title="Edit"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                className="btn-icon" 
                                                onClick={() => handleDeleteLead(lead)}
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Lead Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Lead</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleCreateLead}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="company_name"
                                            value={formData.company_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company Rep</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="company_rep"
                                            value={formData.company_rep}
                                            onChange={handleInputChange}
                                            placeholder="Enter company representative name"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Contact Person</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="contact_person"
                                            value={formData.contact_person}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Position</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="contact_position"
                                            value={formData.contact_position}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="contact_email"
                                            value={formData.contact_email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="contact_phone"
                                            value={formData.contact_phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Service Interest</label>
                                        <select
                                            className="form-control"
                                            name="service_interest"
                                            value={formData.service_interest}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Service</option>
                                            <option value="wsp">WSP Training</option>
                                            <option value="accreditation">Accreditation</option>
                                            <option value="skills_program">Skills Program</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Estimated Value</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="estimated_value"
                                            value={formData.estimated_value}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create Lead
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <HubSpotLayout 
            title="HubSpot Leads" 
            description="Manage HubSpot leads and contacts"
        >
            {pageContent}
        </HubSpotLayout>
    );
};

export default LeadsHubSpot; 