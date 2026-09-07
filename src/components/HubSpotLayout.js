import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HubSpotLayout = ({ children, title, description, showActions = true, actions = [] }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        // Get user name from localStorage
        const storedName = localStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName);
        }
        
        // Get user email from Firebase auth
        if (currentUser) {
            setUserEmail(currentUser.email);
        }
    }, [currentUser]);

    // Get current page name for breadcrumb
    const getPageName = () => {
        const path = location.pathname;
        const pageMap = {
            '/': 'Dashboard',
            '/dashboard': 'Dashboard',
            '/leads': 'Leads',
            '/clients': 'Clients',
            '/client-creation': 'Client Creation',
            '/contract-creation': 'Contract Creation',
            '/accreditation': 'Accreditation',
            '/wsp-training': 'Project Management'
        };
        return pageMap[path] || 'Page';
    };

    // Navigation items with improved structure
    const navItems = [
        { 
            path: '/dashboard', 
            icon: 'fas fa-chart-line', 
            label: 'Dashboard',
            description: 'Overview and analytics'
        },
        { 
            path: '/leads', 
            icon: 'fas fa-lightbulb', 
            label: 'Leads',
            description: 'Manage lead pipeline'
        },
        { 
            path: '/clients', 
            icon: 'fas fa-building', 
            label: 'Clients',
            description: 'Client management'
        },
        { 
            path: '/wsp-training', 
            icon: 'fas fa-project-diagram', 
            label: 'Project Management',
            description: 'Manage projects and training programs'
        },
        { 
            path: '/accreditation', 
            icon: 'fas fa-certificate', 
            label: 'Accreditation',
            description: 'Manage accreditations'
        },
        { 
            path: '/facilitator', 
            icon: 'fas fa-users-cog', 
            label: 'Facilitator Log Book',
            description: 'Facilitator log book'
        },
        { 
            path: '/help', 
            icon: 'fas fa-question-circle', 
            label: 'Help',
            description: 'Help and support'
        },
    ];

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleLogout = () => {
        // Add logout logic here
        navigate('/');
    };

    return (
        <div className="app-container">
            {/* Main Container */}
            <div className="main-container">
                {/* Left Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <div className="logo-container">
                            <img 
                                src="/images/sizwe_training_logo.jpeg" 
                                alt="MySizwe Training" 
                                className="sidebar-logo" 
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <span className="sidebar-brand-text">MySizwe</span>
                        </div>
                        <div className="sidebar-logo-text" style={{display: 'none'}}>
                            <h1 style={{
                                fontSize: '48px',
                                fontWeight: '900',
                                color: '#006400',
                                margin: '0',
                                textAlign: 'center',
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                letterSpacing: '-2px',
                                lineHeight: '1'
                            }}>
                                MySizwe
                            </h1>
                            <p style={{
                                fontSize: '20px',
                                color: '#6c757d',
                                margin: '8px 0 0 0',
                                textAlign: 'center',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px'
                            }}>
                                Training Solutions
                            </p>
                        </div>
                    </div>
                    
                    <nav className="sidebar-nav">
                            <ul>
                                {navItems.map((item) => (
                                <li key={item.path}>
                                        <a 
                                            href={item.path} 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(item.path);
                                            }}
                                        className={location.pathname === item.path ? 'active' : ''}
                                            title={item.description}
                                        >
                                            <i className={item.icon}></i>
                                            <span>{item.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                    </nav>
                    
                    {/* Profile Section at Bottom */}
                    <div className="sidebar-profile">
                        <div className="profile-picture">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="profile-info">
                            <div className="profile-name">{userName || 'User'}</div>
                            <div className="profile-email">{userEmail || 'user@example.com'}</div>
                        </div>
                        <button 
                            className="profile-logout-btn" 
                            onClick={() => {
                                // Clear user data
                                localStorage.removeItem('userName');
                                // Navigate to login
                                navigate('/');
                            }}
                            title="Logout"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>


                </aside>

                {/* Main Content Area */}
                <main className="content">
                    <div className="content-header">
                        <div className="header-left">
                            <h1>{title || getPageName()}</h1>
                            <p>{description || `Manage your ${getPageName().toLowerCase()} data and information.`}</p>
                        </div>
                        <div className="header-right">
                        </div>
                        {showActions && actions.length > 0 && (
                            <div className="header-actions">
                                {actions.map((action, index) => (
                                    <button
                                        key={index}
                                        className={`btn ${action.variant || 'secondary'}`}
                                        onClick={action.onClick}
                                        title={action.title}
                                        disabled={action.disabled}
                                    >
                                        {action.icon && <i className={action.icon}></i>}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Page Content */}
                    <div className="page-content fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HubSpotLayout; 