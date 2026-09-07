import React, { useState, useEffect } from 'react';
import HubSpotLayout from '../components/HubSpotLayout';
import AccreditationModal from '../components/AccreditationModal';
import GridCardGuide from '../components/GridCardGuide';
import '../css/Accreditation.css';

const Accreditation = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [formData, setFormData] = useState({
        accreditingBody: 'QCTO',
        accreditationNumber: '',
        qualifications: '',
        nqfLevel: '',
        ofoNumber: '',
        issuedBy: '',
        expires: '',
        duration: ''
    });

    // Modal state for accreditation actions
    const [accreditationModalOpen, setAccreditationModalOpen] = useState(false);
    const [selectedAccreditation, setSelectedAccreditation] = useState(null);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit'
    const [accreditationData, setAccreditationData] = useState([]); // Dynamic data from localStorage

    // New state variables
    const [showAccreditationForm, setShowAccreditationForm] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showAddAccreditationModal, setShowAddAccreditationModal] = useState(false);
    const [accreditationForm, setAccreditationForm] = useState({
        accreditingBody: 'QCTO',
        accreditationNumber: '',
        qualifications: '',
        nqfLevel: '',
        ofoNumber: '',
        issuedBy: new Date().toISOString().split('T')[0],
        expires: '',
        duration: '5 years'
    });

    // Static sample accreditation data
    const staticAccreditationSample = {
        id: 'static-sample',
        accreditingBody: 'QCTO',
        accreditationNumber: '05-QCTO/AC-TTC240924085655',
        qualifications: 'Food and Dev\' Process Machine Operator (Intermediate Occupational Certificate)',
        nqfLevel: 'NQF L3',
        ofoNumber: '121149',
        issuedBy: '2024-09-24',
        expires: '48 months',
        duration: '5 years',
        createdAt: '2024-09-24T00:00:00.000Z'
    };

    const qualificationsData = {
        '05-QCTO/AC-TTC240924085655': [
            { name: 'Food and Dev\' Process Machine Operator (Intermediate Occupational Certificate)', nqf: 'NQF L3', ofo: '121149' }
        ],
        '05-QCTO/AC-TTC250125102623': [
            { name: 'Retail Manager/Retail Store Manager (Occupational Certificate)', nqf: 'NQF L6', ofo: '91789' },
            { name: 'Retail Supervisor (Occupational Certificate)', nqf: 'NQF L4', ofo: '99573' },
            { name: 'Visual Merchandiser (Occupational Certificate)', nqf: 'NQF L3', ofo: '99688' },
            { name: 'Checkout Operator (Occupational Certificate)', nqf: 'NQF L2', ofo: '99707' },
            { name: 'Dispatching and Receiving Clerk', nqf: 'NQF L3', ofo: '99446' }
        ],
        '05-QCTO/SDP010524113839': [
            { name: 'Retail Supervisor (Occupational Certificate)', nqf: 'NQF L4', ofo: '99573' },
            { name: 'Visual Merchandiser (Occupational Certificate)', nqf: 'NQF L3', ofo: '99688' },
            { name: 'Retail Manager/Retail Store Manager (Occupational Certificate)', nqf: 'NQF L6', ofo: '91789' },
            { name: 'Retail Buyer (Occupational Certificate)', nqf: 'NQF L5', ofo: '103145' }
        ],
        '05-QCTO/SDP040325132739': [
            { name: 'Food and Dev\' Process Machine Operator (Intermediate Occupational Certificate)', nqf: 'NQF L3', ofo: '121149' }
        ]
    };

    // OFO Number mapping based on NQF Level
    const ofoMapping = {
        'NQF 2': '99688',
        'NQF 3': '99688', 
        'NQF L2': '99707',
        'NQF L3': '121149',
        'NQF L4': '99573',
        'NQF 4': '99573',
        'NQF L5': '103145',
        'NQF 5': '103145',
        'NQF L6': '91789',
        'NQF 6': '91789'
    };

    // Load data from localStorage on component mount
    useEffect(() => {
        loadAccreditationData();
    }, []);

    const loadAccreditationData = () => {
        const storedAccreditations = localStorage.getItem('accreditationData');
        let accreditations = [];
        
        if (storedAccreditations) {
            accreditations = JSON.parse(storedAccreditations);
        }
        
        // Add static sample if it doesn't exist in localStorage
        const hasStaticSample = accreditations.some(acc => acc.id === 'static-sample');
        if (!hasStaticSample) {
            accreditations.unshift(staticAccreditationSample);
        }
        
        setAccreditationData(accreditations);
    };

    // Function to add new accreditation data
    const addNewAccreditation = (newAccreditationData) => {
        const newAccreditation = {
            id: Date.now(),
            accreditingBody: newAccreditationData.accreditingBody || 'QCTO',
            accreditationNumber: newAccreditationData.accreditationNumber || '',
            qualifications: newAccreditationData.qualifications || '',
            nqfLevel: newAccreditationData.nqfLevel || '',
            ofoNumber: newAccreditationData.ofoNumber || '',
            issuedBy: newAccreditationData.issuedBy || new Date().toISOString().split('T')[0],
            expires: newAccreditationData.expires || '',
            duration: newAccreditationData.duration || '5 years',
            createdAt: new Date().toISOString()
        };

        const updatedAccreditations = [...accreditationData, newAccreditation];
        setAccreditationData(updatedAccreditations);
        localStorage.setItem('accreditationData', JSON.stringify(updatedAccreditations));
    };

    // Handle accreditation form input changes
    const handleAccreditationFormChange = (e) => {
        const { name, value } = e.target;
        setAccreditationForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle accreditation form submission
    const handleAccreditationFormSubmit = (e) => {
        e.preventDefault();
        addNewAccreditation(accreditationForm);
        setAccreditationForm({
            accreditingBody: 'QCTO',
            accreditationNumber: '',
            qualifications: '',
            nqfLevel: '',
            ofoNumber: '',
            issuedBy: new Date().toISOString().split('T')[0],
            expires: '',
            duration: '5 years'
        });
        setShowAccreditationForm(false);
        alert('Accreditation record added successfully!');
    };

    // Clear all data for testing
    const clearAllData = () => {
        if (window.confirm('Are you sure you want to clear ALL accreditation data? This will permanently delete all records you have created and cannot be undone.')) {
            localStorage.removeItem('accreditationData');
            setAccreditationData([]);
            alert('All accreditation data cleared successfully!');
        }
    };

    // Listen for storage events to update data when forms are submitted
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'accreditationData') {
                loadAccreditationData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Expose functions globally so forms can call them
    useEffect(() => {
        window.addNewAccreditationToAccreditationPage = addNewAccreditation;
        
        return () => {
            delete window.addNewAccreditationToAccreditationPage;
        };
    }, [accreditationData]);

    const updateQualifications = () => {
        const accNumber = formData.accreditationNumber;
        const qualifications = qualificationsData[accNumber] || [];
        
        setFormData(prev => ({
            ...prev,
            qualifications: '',
            nqfLevel: '',
            ofoNumber: ''
        }));
    };

    const updateNQFLevel = () => {
        const accNumber = formData.accreditationNumber;
        const qualification = formData.qualifications;
        const qualifications = qualificationsData[accNumber] || [];
        const selectedQual = qualifications.find(q => q.name === qualification);
        
        if (selectedQual) {
            setFormData(prev => ({
                ...prev,
                nqfLevel: selectedQual.nqf,
                ofoNumber: selectedQual.ofo || ofoMapping[selectedQual.nqf] || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                nqfLevel: '',
                ofoNumber: ''
            }));
        }
    };

    const calculateDuration = () => {
        if (formData.issuedBy) {
            const issuedDate = new Date(formData.issuedBy);
            const expiryDate = new Date(issuedDate);
            expiryDate.setFullYear(expiryDate.getFullYear() + 5); // Exactly 5 years
            
            setFormData(prev => ({
                ...prev,
                expires: expiryDate.toISOString().split('T')[0],
                duration: '5 years'
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create the accreditation data object
        const accreditationData = {
            accreditingBody: formData.accreditingBody,
            accreditationNumber: formData.accreditationNumber,
            qualifications: formData.qualifications,
            nqfLevel: formData.nqfLevel,
            ofoNumber: formData.ofoNumber,
            issuedBy: formData.issuedBy,
            expires: formData.expires,
            duration: formData.duration
        };

        console.log('Form submitted:', accreditationData);

        // Save to localStorage
        const existingAccreditations = JSON.parse(localStorage.getItem('accreditationData') || '[]');
        const newAccreditation = {
            id: Date.now(),
            accreditingBody: formData.accreditingBody,
            accreditationNumber: formData.accreditationNumber,
            qualifications: formData.qualifications,
            nqfLevel: formData.nqfLevel,
            ofoNumber: formData.ofoNumber,
            issuedBy: formData.issuedBy,
            expires: formData.expires,
            duration: formData.duration,
            createdAt: new Date().toISOString()
        };
        
        const updatedAccreditations = [...existingAccreditations, newAccreditation];
        localStorage.setItem('accreditationData', JSON.stringify(updatedAccreditations));
        
        // Update local state so the table refreshes immediately
        setAccreditationData(updatedAccreditations);
        

        
        // Reset form
        setFormData({
            accreditingBody: 'QCTO',
            accreditationNumber: '',
            qualifications: '',
            nqfLevel: '',
            ofoNumber: '',
            issuedBy: '',
            expires: '',
            duration: ''
        });
        
        alert('Accreditation added successfully!');
    };

    // Handle Accreditation Modal actions
    const handleViewAccreditation = (accreditation) => {
        setSelectedAccreditation(accreditation);
        setModalMode('view');
        setAccreditationModalOpen(true);
    };

    const handleEditAccreditation = (accreditation) => {
        setSelectedAccreditation(accreditation);
        setModalMode('edit');
        setAccreditationModalOpen(true);
    };

    const handleSaveAccreditation = (updatedAccreditation) => {
        // Update localStorage
        const existingAccreditations = JSON.parse(localStorage.getItem('accreditationData') || '[]');
        const updatedAccreditations = existingAccreditations.map(accreditation => 
            accreditation.id === updatedAccreditation.id ? updatedAccreditation : accreditation
        );
        localStorage.setItem('accreditationData', JSON.stringify(updatedAccreditations));
        
        // Update local state
        setAccreditationData(updatedAccreditations);
        setAccreditationModalOpen(false);
        setSelectedAccreditation(null);
        alert('Accreditation updated successfully!');
    };

    const handleDeleteAccreditation = (accreditationId) => {
        // Add confirmation dialog to prevent accidental deletion
        const recordType = accreditationId === 'static-sample' ? 'static sample' : 'accreditation';
        if (!window.confirm(`Are you sure you want to delete this ${recordType} record? This action cannot be undone.`)) {
            return; // User cancelled the deletion
        }
        
        // Update localStorage
        const existingAccreditations = JSON.parse(localStorage.getItem('accreditationData') || '[]');
        const updatedAccreditations = existingAccreditations.filter(accreditation => accreditation.id !== accreditationId);
        localStorage.setItem('accreditationData', JSON.stringify(updatedAccreditations));
        
        // Update local state
        setAccreditationData(updatedAccreditations);
        setAccreditationModalOpen(false);
        setSelectedAccreditation(null);
        alert(`${recordType.charAt(0).toUpperCase() + recordType.slice(1)} deleted successfully!`);
    };

    const closeAccreditationModal = () => {
        setAccreditationModalOpen(false);
        setSelectedAccreditation(null);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % 3);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + 3) % 3);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    };

    // Guide steps for add-accreditation functionality
    const guideSteps = [
        {
            title: "Add Accreditation Button",
            description: "Click this button to add a new accreditation to your system. This opens the accreditation form where you can enter all the required details.",
            target: ".header-actions .btn-secondary"
        },
        {
            title: "Accrediting Body",
            description: "Select the accrediting body for your qualification. Common options include QCTO, SETA, and other recognized bodies.",
            target: ".accreditation-form select[name='accreditingBody']"
        },
        {
            title: "Accreditation Number",
            description: "Enter the unique accreditation number assigned to your qualification. This is typically provided by the accrediting body.",
            target: ".accreditation-form input[name='accreditationNumber']"
        },
        {
            title: "Qualifications",
            description: "Select the specific qualification that this accreditation covers. The list will update based on your accreditation number.",
            target: ".accreditation-form select[name='qualifications']"
        },
        {
            title: "NQF Level",
            description: "The National Qualifications Framework level of your qualification. This is automatically populated based on your qualification selection.",
            target: ".accreditation-form select[name='nqfLevel']"
        },
        {
            title: "OFO Number",
            description: "The Organising Framework for Occupations number. This is automatically populated based on your NQF level selection.",
            target: ".accreditation-form input[name='ofoNumber']"
        },
        {
            title: "Issued Date",
            description: "The date when the accreditation was issued. This helps track when your accreditation became valid.",
            target: ".accreditation-form input[name='issuedBy']"
        },
        {
            title: "Expiry Date",
            description: "The date when your accreditation expires. This is crucial for compliance monitoring and renewal planning.",
            target: ".accreditation-form input[name='expires']"
        },
        {
            title: "Duration",
            description: "The duration of your accreditation validity period. This is automatically calculated based on your issue and expiry dates.",
            target: ".accreditation-form input[name='duration']"
        },
        {
            title: "Submit Accreditation",
            description: "Click this button to save your new accreditation. All fields will be validated before submission.",
            target: ".accreditation-form .btn-primary"
        }
    ];

    const handleGuideComplete = () => {
        setShowGuide(false);
        localStorage.setItem('accreditationGuideSeen', 'true');
    };

    const handleGuideSkip = () => {
        setShowGuide(false);
        localStorage.setItem('accreditationGuideSeen', 'true');
    };

    const startGuide = () => {
        setShowGuide(true);
    };

    const openAddAccreditationModal = () => {
        setShowAddAccreditationModal(true);
        // Reset form data when opening modal
        setFormData({
            accreditingBody: 'QCTO',
            accreditationNumber: '',
            qualifications: '',
            nqfLevel: '',
            ofoNumber: '',
            issuedBy: '',
            expires: '',
            duration: ''
        });
    };

    const closeAddAccreditationModal = () => {
        setShowAddAccreditationModal(false);
        // Reset form data when closing modal
        setFormData({
            accreditingBody: 'QCTO',
            accreditationNumber: '',
            qualifications: '',
            nqfLevel: '',
            ofoNumber: '',
            issuedBy: '',
            expires: '',
            duration: ''
        });
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e);
        closeAddAccreditationModal();
    };

    useEffect(() => {
        if (formData.accreditationNumber) {
            updateQualifications();
        }
    }, [formData.accreditationNumber]);

    useEffect(() => {
        if (formData.qualifications) {
            updateNQFLevel();
        }
    }, [formData.qualifications]);

    useEffect(() => {
        if (formData.issuedBy) {
            calculateDuration();
        }
    }, [formData.issuedBy]);

    // (move all code from return, except Sidebar/Header, into a variable)
    const pageContent = (
        <>


            <div className="accreditation-content">
                {/* Professional Accreditation Summary */}
                <section className="accreditation-overview">
                    <div className="summary-metrics">
                        <div className="metric-card primary">
                            <div className="metric-icon">
                                <i className="fas fa-certificate"></i>
                            </div>
                            <div className="metric-content">
                                <h3>Active Accreditations</h3>
                                <div className="metric-value">{accreditationData.length}</div>
                                <div className="metric-trend positive">
                                    <i className="fas fa-arrow-up"></i>
                                    <span>+{Math.max(0, accreditationData.length - 1)} this month</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="metric-card warning">
                            <div className="metric-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="metric-content">
                                <h3>Pending Renewals</h3>
                                <div className="metric-value">{accreditationData.filter(acc => {
                                    if (!acc.expires) return false;
                                    const expiryDate = new Date(acc.expires);
                                    const today = new Date();
                                    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
                                    return expiryDate <= thirtyDaysFromNow && expiryDate > today;
                                }).length}</div>
                                <div className="metric-trend">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <span>Due within 30 days</span>
                                </div>
                            </div>
                        </div>
                        

                        
                        <div className="metric-card danger">
                            <div className="metric-icon">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="metric-content">
                                <h3>Expired Accreditations</h3>
                                <div className="metric-value">{accreditationData.filter(acc => {
                                    if (!acc.expires) return false;
                                    const expiryDate = new Date(acc.expires);
                                    const today = new Date();
                                    return expiryDate < today;
                                }).length}</div>
                                <div className="metric-trend negative">
                                    <i className="fas fa-arrow-down"></i>
                                    <span>Requires attention</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                </section>

                {/* Add Accreditation Prompt */}
                <div className="accreditation-prompt">
                    <div className="prompt-content">
                        <h2>Add New Accreditation</h2>
                        <p>Click the button below to add a new accreditation to your system</p>
                        <button className="btn-primary" onClick={openAddAccreditationModal}>
                            <i className="fas fa-plus"></i>
                            Add Accreditation
                        </button>
                    </div>
                </div>

                {/* Accreditation Table Section */}
                <section className="recent-activities">
                    <div className="table-header">
                        <h2>Accreditation Records ({accreditationData.length} total)</h2>
                    </div>
                    
                    <div className="table-container">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Accrediting Body</th>
                                    <th>Accreditation Number</th>
                                    <th>Qualifications</th>
                                    <th>NQF Level</th>
                                    <th>OFO Number</th>
                                    <th>Issued By</th>
                                    <th>Expires</th>
                                    <th>Duration</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accreditationData.map((accreditation) => (
                                    <tr key={accreditation.id}>
                                        <td>{accreditation.accreditingBody}</td>
                                        <td>{accreditation.accreditationNumber}</td>
                                        <td>{accreditation.qualifications}</td>
                                        <td>{accreditation.nqfLevel}</td>
                                        <td>{accreditation.ofoNumber}</td>
                                        <td>{accreditation.issuedBy}</td>
                                        <td>{accreditation.expires}</td>
                                        <td>{accreditation.duration}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-icon" 
                                                    title="View Details"
                                                    onClick={() => handleViewAccreditation(accreditation)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button 
                                                    className="btn-icon" 
                                                    title="Edit"
                                                    onClick={() => handleEditAccreditation(accreditation)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn-icon" 
                                                    title="Delete"
                                                    onClick={() => handleDeleteAccreditation(accreditation.id)}
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
                </section>

            {/* Main Content Grid with Carousel */}
            <div className="content-grid">
                <div className="carousel-container" tabIndex="0" onKeyDown={handleKeyDown}>
                    <div className="carousel-header">
                        <h2>Accreditation Status Overview</h2>
                        <div className="section-actions">
                            <button className="btn-icon view"><i className="fas fa-filter"></i></button>
                            <button className="btn-icon edit"><i className="fas fa-ellipsis-v"></i></button>
                        </div>
                    </div>
                    
                    <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {/* Accreditation Status */}
                        <div className={`carousel-item ${currentSlide === 0 ? 'active' : ''}`}>
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <i className="fas fa-history"></i>
                                        <span className="badge success">Active</span>
                                    </div>
                                    <h3>Legacy Accreditation</h3>
                                    <p className="metric-value">Dec 31, 2025</p>
                                    <div className="metric-details">
                                        <span><i className="fas fa-calendar"></i> Expires: Dec 31, 2025</span>
                                        <span><i className="fas fa-building"></i> Legacy</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <i className="fas fa-shield-alt"></i>
                                        <span className="badge warning">Renewal Due</span>
                                    </div>
                                    <h3>Health & Safety Compliance</h3>
                                    <p className="metric-value">Mar 10, 2025</p>
                                    <div className="metric-details">
                                        <span><i className="fas fa-calendar"></i> Expires: Mar 10, 2025</span>
                                        <span><i className="fas fa-building"></i> OSHA</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <i className="fas fa-certificate"></i>
                                        <span className="badge success">Compliant</span>
                                    </div>
                                    <h3>QCTO Accreditation</h3>
                                    <p className="metric-value">Valid</p>
                                    <div className="metric-details">
                                        <span><i className="fas fa-check"></i> All Requirements Met</span>
                                        <span><i className="fas fa-calendar-check"></i> Last Review: Jan 2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legacy Qualifications */}
                        <div className={`carousel-item ${currentSlide === 1 ? 'active' : ''}`}>
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <i className="fas fa-graduation-cap"></i>
                                        <span className="badge success">Active</span>
                                    </div>
                                    <h3>National Certificate: Generic Management</h3>
                                    <p className="metric-value">NQF 5</p>
                                    <div className="metric-details">
                                        <span><i className="fas fa-users"></i> 45 Learners</span>
                                        <span><i className="fas fa-chart-line"></i> 88% Completion</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <i className="fas fa-book"></i>
                                        <span className="badge info">In Progress</span>
                                    </div>
                                    <h3>National Certificate: Project Management</h3>
                                    <p className="metric-value">NQF 5</p>
                                    <div className="metric-details">
                                        <span><i className="fas fa-calendar"></i> Started: Jan 2024</span>
                                        <span><i className="fas fa-user-tie"></i> 28 Enrolled</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <i className="fas fa-certificate"></i>
                                        <span className="badge warning">Review Due</span>
                                    </div>
                                    <h3>National Diploma: Business Management</h3>
                                    <p className="metric-value">NQF 6</p>
                                    <div className="metric-details">
                                        <span><i className="fas fa-clock"></i> Review: Mar 2024</span>
                                        <span><i className="fas fa-users"></i> 32 Graduates</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Carousel Navigation */}
                    <div className="carousel-nav">
                        <button 
                            type="button" 
                            className={currentSlide === 0 ? 'active' : ''} 
                            onClick={() => goToSlide(0)}
                            aria-label="Go to slide 1"
                        ></button>
                        <button 
                            type="button" 
                            className={currentSlide === 1 ? 'active' : ''} 
                            onClick={() => goToSlide(1)}
                            aria-label="Go to slide 2"
                        ></button>
                    </div>
                </div>
            </div>



            {/* Add Accreditation Modal */}
            {showAddAccreditationModal && (
                <div className="modal-overlay" onClick={closeAddAccreditationModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Accreditation</h2>
                            <button className="modal-close" onClick={closeAddAccreditationModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleModalSubmit} className="accreditation-form">
                            <div className="form-group">
                                <label htmlFor="modal-accreditingBody">Accrediting Body:</label>
                                <select 
                                    id="modal-accreditingBody" 
                                    name="accreditingBody" 
                                    value={formData.accreditingBody}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="QCTO">QCTO</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="modal-accreditationNumber">Accreditation Number:</label>
                                <select 
                                    id="modal-accreditationNumber" 
                                    name="accreditationNumber" 
                                    className="accreditation-number" 
                                    value={formData.accreditationNumber}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="" disabled>Select accreditation number</option>
                                    <option value="05-QCTO/AC-TTC240924085655">05-QCTO/AC-TTC240924085655</option>
                                    <option value="05-QCTO/AC-TTC250125102623">05-QCTO/AC-TTC250125102623</option>
                                    <option value="05-QCTO/SDP010524113839">05-QCTO/SDP010524113839</option>
                                    <option value="05-QCTO/SDP040325132739">05-QCTO/SDP040325132739</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="modal-qualifications">Qualifications:</label>
                                <select 
                                    id="modal-qualifications" 
                                    name="qualifications" 
                                    className="qualifications" 
                                    value={formData.qualifications}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="" disabled>Select qualifications</option>
                                    {formData.accreditationNumber && qualificationsData[formData.accreditationNumber]?.map((qual, index) => (
                                        <option key={index} value={qual.name}>{qual.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="modal-nqfLevel">NQF Level:</label>
                                <input 
                                    type="text" 
                                    id="modal-nqfLevel" 
                                    name="nqfLevel" 
                                    value={formData.nqfLevel}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="modal-ofoNumber">OFO Code:</label>
                                <input 
                                    type="text" 
                                    id="modal-ofoNumber" 
                                    name="ofoNumber" 
                                    placeholder="Auto-filled based on NQF Level"
                                    value={formData.ofoNumber}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="modal-issuedBy">Issued By:</label>
                                <input 
                                    type="date" 
                                    id="modal-issuedBy" 
                                    name="issuedBy" 
                                    value={formData.issuedBy}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="modal-expires">Expires:</label>
                                <input 
                                    type="date" 
                                    id="modal-expires" 
                                    name="expires" 
                                    value={formData.expires}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="modal-duration">Duration:</label>
                                <input 
                                    type="text" 
                                    id="modal-duration" 
                                    name="duration" 
                                    value={formData.duration}
                                    readOnly
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={closeAddAccreditationModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Accreditation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </>
    );

    return (
        <HubSpotLayout 
            title="Accreditation Management" 
            description="Manage your accreditation records and qualifications"
        >
            {pageContent}

            {/* Add Accreditation Guide */}
            <GridCardGuide 
                isActive={showGuide}
                onComplete={handleGuideComplete}
                onSkip={handleGuideSkip}
                steps={guideSteps}
            />
        </HubSpotLayout>
    );
};

export default Accreditation; 