import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import HubSpotLayout from '../components/HubSpotLayout';
import WelcomeModal from '../components/WelcomeModal';
import GridCardGuide from '../components/GridCardGuide';
import '../css/Dashboard.css';
import '../css/WelcomeModal.css';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
    const [modalMode, setModalMode] = useState('view');
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [userName, setUserName] = useState('');
    
    // Dashboard metrics state
    const [dashboardMetrics, setDashboardMetrics] = useState({
        leads: 0,
        active_leads: 0,
        conversion_rate: 0,
        total_value: 'R 0'
    });
    const [leadsData, setLeadsData] = useState([]);
    const [quotationsData, setQuotationsData] = useState([]);
    const [showQuotationsModal, setShowQuotationsModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showGuide, setShowGuide] = useState(false);

    const navigate = useNavigate();

    // Load dashboard data from API
    useEffect(() => {
        loadDashboardData();
        
        // Check if user just logged in and show welcome modal
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
            // Show welcome modal on first visit
            const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
            if (!hasSeenWelcome) {
                setTimeout(() => {
                    setShowWelcomeModal(true);
                    localStorage.setItem('hasSeenWelcome', 'true');
                }, 1000);
            }
        }
        
        // Refresh dashboard data every 30 seconds
        const interval = setInterval(() => {
            loadDashboardData();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Calculate metrics from localStorage data
            const leadsData = JSON.parse(localStorage.getItem('leadsData') || '[]');
            const clientsData = JSON.parse(localStorage.getItem('clientsData') || '[]');
            
            // Get active clients only
            const activeClients = clientsData.filter(client => {
                const status = (client.status || '').toLowerCase();
                return status === 'active' || status === 'converted' || !status;
            });
            
            const totalLeads = leadsData.filter(lead => lead.status === 'new' || lead.status === 'pending').length;
            const activeLeads = leadsData.filter(lead => lead.status === 'converted').length;
            const totalActiveClients = activeClients.length + activeLeads; // Include converted leads as clients
            const conversionRate = totalLeads > 0 ? ((activeLeads / totalLeads) * 100).toFixed(1) : 0;
            
            // Calculate total value from both active clients and converted leads
            const clientsTotalValue = activeClients.reduce((sum, client) => sum + (parseFloat(client.totalValue) || 0), 0);
            const leadsTotalValue = leadsData
                .filter(lead => lead.status === 'converted')
                .reduce((sum, lead) => sum + (parseFloat(lead.estimated_value) || 0), 0);
            const totalValue = clientsTotalValue + leadsTotalValue;
            
            setDashboardMetrics({
                leads: totalLeads,
                active_leads: totalActiveClients, // Now includes active clients
                conversion_rate: parseFloat(conversionRate),
                total_value: `R ${(totalValue / 1000000).toFixed(1)}M`
            });
            
            setLeadsData(leadsData.slice(-5));
            setQuotationsData(leadsData.filter(lead => lead.status === 'converted').slice(-5));
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setDashboardMetrics({
                leads: 342,
                active_leads: 128,
                conversion_rate: 37.4,
                total_value: 'R 2.5M'
            });
        } finally {
            setLoading(false);
        }
    };

    const refreshDashboard = () => {
        loadDashboardData();
    };

    const handleMetricClick = (metricType) => {
        switch (metricType) {
            case 'leads':
                navigate('/leads');
                break;
            case 'active_leads':
                setQuotationsData(JSON.parse(localStorage.getItem('leadsData') || '[]').filter(lead => lead.status === 'converted'));
                setShowQuotationsModal(true);
                break;
            case 'conversion_rate':
                alert(`Current conversion rate: ${dashboardMetrics.conversion_rate}%`);
                break;
            case 'total_value':
                alert(`Total quotation value: ${dashboardMetrics.total_value}`);
                break;
            case 'management_fee':
                alert(`Management & Delivery Fee: R 45,000`);
                break;
            default:
                break;
        }
    };

    // Chart configurations
    const leadsChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'New Leads',
            data: [85, 79, 95, 91, 76, 75],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };

    const leadsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Monthly Lead Generation',
                font: { size: 16, weight: '600' },
                color: '#2c3e50'
            },
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: { size: 12 }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#7f8c8d' }
            },
            x: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#7f8c8d' }
            }
        }
    };

    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Monthly Revenue',
            data: [250000, 280000, 320000, 295000, 340000, 380000],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };

    const revenueOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Monthly Revenue Trends',
                font: { size: 16, weight: '600' },
                color: '#2c3e50'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return 'R ' + (value / 1000) + 'K';
                    },
                    color: '#7f8c8d'
                },
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#7f8c8d' }
            }
        }
    };

    const setaData = {
        labels: ['WRSETA', 'CHIETA', 'BANKSETA', 'FASSET', 'CETA'],
        datasets: [{
            data: [35, 30, 25, 15, 15],
            backgroundColor: [
                '#4CAF50',
                '#2196F3',
                '#FF9800',
                '#9C27B0',
                '#F44336'
            ],
            borderWidth: 0
        }]
    };

    const setaOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Client Distribution by SETA',
                font: { size: 16, weight: '600' },
                color: '#2c3e50'
            },
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    font: { size: 12 }
                }
            }
        }
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

    // Guide steps for metric cards
    const guideSteps = [
        {
            title: "Total Leads",
            description: "This card shows the total number of leads in your system. Click to view detailed lead information and manage your lead pipeline.",
            target: ".metrics-grid .metric-card:nth-child(1)"
        },
        {
            title: "Active Leads",
            description: "Displays the number of leads that are currently being actively pursued. These are leads in progress through your sales funnel.",
            target: ".metrics-grid .metric-card:nth-child(2)"
        },
        {
            title: "Conversion Rate",
            description: "Shows your lead conversion percentage. This metric helps you track how effectively you're converting leads into clients.",
            target: ".metrics-grid .metric-card:nth-child(3)"
        },
        {
            title: "Total Value",
            description: "Displays the total monetary value of all your converted leads. This represents your portfolio's financial worth.",
            target: ".metrics-grid .metric-card:nth-child(4)"
        },
        {
            title: "Management & Delivery Fee",
            description: "Shows your management and delivery fees. This represents your service revenue from client management activities.",
            target: ".metrics-grid .metric-card:nth-child(5)"
        }
    ];

    const handleGuideComplete = () => {
        setShowGuide(false);
        localStorage.setItem('dashboardGuideSeen', 'true');
    };

    const handleGuideSkip = () => {
        setShowGuide(false);
        localStorage.setItem('dashboardGuideSeen', 'true');
    };

    const startGuide = () => {
        setShowGuide(true);
    };

    // Calculate compliance rate data based on client services
    const calculateComplianceRateData = () => {
        try {
            const clientsData = JSON.parse(localStorage.getItem('clientsData') || '[]');
            const leadsData = JSON.parse(localStorage.getItem('leadsData') || '[]');
            
            // Calculate current tranch based on today's date
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth(); // 0-11
            
            // Calculate which tranch we're in (each tranch is 3 months)
            // Tranch 1: Jan-Mar (months 0-2)
            // Tranch 2: Apr-Jun (months 3-5)
            // Tranch 3: Jul-Sep (months 6-8)
            // Tranch 4: Oct-Dec (months 9-11)
            const currentTranch = Math.floor(currentMonth / 3) + 1;
            
            // Calculate which month of the current tranch we're in (1-3)
            const monthInTranch = (currentMonth % 3) + 1;
            
            // Calculate tranch start and end dates
            const tranchStartMonth = (currentTranch - 1) * 3;
            const tranchStartDate = new Date(currentYear, tranchStartMonth, 1);
            const tranchEndDate = new Date(currentYear, tranchStartMonth + 3, 0); // Last day of the 3rd month
            
            // Get tranch name
            const tranchNames = ['Q1', 'Q2', 'Q3', 'Q4'];
            const tranchName = tranchNames[currentTranch - 1];
            
            // Get all active clients and converted leads within the current tranch period
            const activeClients = clientsData.filter(client => {
                const status = (client.status || '').toLowerCase();
                const isActive = status === 'active' || status === 'converted' || !status;
                
                if (!isActive) return false;
                
                // Check if client was created or updated within the current tranch
                const clientDate = new Date(client.createdAt || client.created_date || Date.now());
                return clientDate >= tranchStartDate && clientDate <= tranchEndDate;
            });
            
            const convertedLeads = leadsData.filter(lead => {
                if (lead.status !== 'converted') return false;
                
                // Check if lead was converted within the current tranch
                const leadDate = new Date(lead.created_date || lead.convertedAt || Date.now());
                return leadDate >= tranchStartDate && leadDate <= tranchEndDate;
            });
            
            const allClients = [...activeClients, ...convertedLeads];
            
            // Define all possible services
            const allServices = ['WSP', 'HR', 'Employment Equity', 'Industry Funded', 'SETA Funded', 'BBBEE'];
            
            // Count clients using each service
            const serviceCounts = {};
            allServices.forEach(service => {
                serviceCounts[service] = 0;
            });
            
            // Count total clients
            const totalClients = allClients.length;
            
            // Count clients using each service
            allClients.forEach(client => {
                const clientServices = client.services || [];
                clientServices.forEach(service => {
                    if (serviceCounts.hasOwnProperty(service)) {
                        serviceCounts[service]++;
                    }
                });
            });
            
            // Calculate compliance rates (percentage of clients using each service)
            const complianceRates = {};
            allServices.forEach(service => {
                complianceRates[service] = totalClients > 0 ? ((serviceCounts[service] / totalClients) * 100).toFixed(1) : 0;
            });
            
            return {
                labels: allServices,
                data: Object.values(complianceRates).map(rate => parseFloat(rate)),
                counts: Object.values(serviceCounts),
                totalClients: totalClients,
                tranchInfo: {
                    currentTranch: currentTranch,
                    tranchName: tranchName,
                    monthInTranch: monthInTranch,
                    tranchStartDate: tranchStartDate,
                    tranchEndDate: tranchEndDate,
                    currentYear: currentYear
                }
            };
        } catch (error) {
            console.error('Error calculating compliance rate data:', error);
            // Return default data if there's an error
            return {
                labels: ['WSP', 'HR', 'Employment Equity', 'Industry Funded', 'SETA Funded', 'BBBEE'],
                data: [25, 30, 40, 55, 35, 45],
                counts: [25, 30, 40, 55, 35, 45],
                totalClients: 100,
                tranchInfo: {
                    currentTranch: 1,
                    tranchName: 'Q1',
                    monthInTranch: 1,
                    tranchStartDate: new Date(),
                    tranchEndDate: new Date(),
                    currentYear: new Date().getFullYear()
                }
            };
        }
    };

    const complianceRateData = calculateComplianceRateData();

    const complianceRateChartData = {
        labels: complianceRateData.labels,
        datasets: [{
            label: `Tranch ${complianceRateData.tranchInfo.currentTranch}`,
            data: complianceRateData.data,
            backgroundColor: [
                'rgba(76, 175, 80, 0.8)',
                'rgba(33, 150, 243, 0.8)',
                'rgba(255, 152, 0, 0.8)',
                'rgba(156, 39, 176, 0.8)',
                'rgba(244, 67, 54, 0.8)',
                'rgba(0, 150, 136, 0.8)'
            ],
            borderColor: [
                '#4CAF50',
                '#2196F3',
                '#FF9800',
                '#9C27B0',
                '#F44336',
                '#009688'
            ],
            borderWidth: 2
        }]
    };

    const complianceRateOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Compliance Rate',
                font: { size: 16, weight: '600' },
                color: '#2c3e50'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed.y;
                        const count = complianceRateData.counts[context.dataIndex];
                        const total = complianceRateData.totalClients;
                        return `${label}: ${value}% (${count}/${total} clients)`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { 
                    color: '#7f8c8d',
                    callback: function(value) {
                        return value + '%';
                    }
                }
            },
            x: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#7f8c8d' }
            }
        }
    };

    return (
        <HubSpotLayout>
            <div className="hubspot-dashboard">

                {/* Key Metrics Cards */}
                <div className="metrics-section">
                    <div className="metrics-header">
                        <h2>Key Metrics</h2>
                        <button 
                            className="guide-trigger-btn"
                            onClick={startGuide}
                            title="Start metrics guide"
                        >
                            <i className="fas fa-question-circle"></i>
                            <span>Start Guide</span>
                        </button>
                    </div>
                    <div className="metrics-grid">
                        <div 
                            className="metric-card primary" 
                            onClick={() => handleMetricClick('leads')}
                        >
                            <div className="metric-icon">
                                <i className="fas fa-lightbulb"></i>
                            </div>
                            <div className="metric-content">
                                <h3>Total Leads</h3>
                                <div className="metric-value">{loading ? '...' : dashboardMetrics.leads}</div>
                            </div>
                        </div>

                        <div 
                            className="metric-card secondary" 
                            onClick={() => handleMetricClick('active_leads')}
                        >
                            <div className="metric-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="metric-content">
                                <h3>Active Leads</h3>
                                <div className="metric-value">{loading ? '...' : dashboardMetrics.active_leads}</div>
                            </div>
                        </div>

                        <div 
                            className="metric-card tertiary" 
                            onClick={() => handleMetricClick('conversion_rate')}
                        >
                            <div className="metric-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <div className="metric-content">
                                <h3>Conversion Rate</h3>
                                <div className="metric-value">{loading ? '...' : `${dashboardMetrics.conversion_rate}%`}</div>
                            </div>
                        </div>

                        <div 
                            className="metric-card success" 
                            onClick={() => handleMetricClick('total_value')}
                        >
                            <div className="metric-icon">
                                <i className="fas fa-dollar-sign"></i>
                            </div>
                            <div className="metric-content">
                                <h3>Total Value</h3>
                                <div className="metric-value">{loading ? '...' : dashboardMetrics.total_value}</div>
                            </div>
                        </div>

                        <div 
                            className="metric-card warning" 
                            onClick={() => handleMetricClick('management_fee')}
                        >
                            <div className="metric-icon">
                                <i className="fas fa-cog"></i>
                            </div>
                            <div className="metric-content">
                                <h3>Management & Delivery Fee</h3>
                                <div className="metric-value">{loading ? '...' : 'R 45,000'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    <div className="charts-grid">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Revenue Trends</h3>
                                <div className="chart-actions">
                                    <button className="chart-btn">
                                        <i className="fas fa-download"></i>
                                    </button>
                                    <button className="chart-btn">
                                        <i className="fas fa-expand"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                <Line data={revenueData} options={revenueOptions} />
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>SETA Distribution</h3>
                                <div className="chart-actions">
                                    <button className="chart-btn">
                                        <i className="fas fa-download"></i>
                                    </button>
                                    <button className="chart-btn">
                                        <i className="fas fa-expand"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                <Doughnut data={setaData} options={setaOptions} />
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Compliance Record</h3>
                                <div className="chart-actions">
                                    <button className="chart-btn">
                                        <i className="fas fa-download"></i>
                                    </button>
                                    <button className="chart-btn">
                                        <i className="fas fa-expand"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                <Bar data={complianceRateChartData} options={complianceRateOptions} />
                            </div>
                        </div>
                    </div>
                </div>



            </div>

            {/* Active Leads Modal */}
            {showQuotationsModal && (
                <div className="hubspot-modal-overlay">
                    <div className="hubspot-modal">
                        <div className="modal-header">
                            <h2>Active Leads</h2>
                            <button className="modal-close" onClick={() => setShowQuotationsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <table className="hubspot-table">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Contact Person</th>
                                        <th>Position</th>
                                        <th>Service</th>
                                        <th>Estimated Value</th>
                                        <th>SETA</th>
                                        <th>Created Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotationsData.map((lead) => (
                                        <tr key={lead.id}>
                                            <td>{lead.company_name}</td>
                                            <td>{lead.contact_person}</td>
                                            <td>{lead.contact_position}</td>
                                            <td>{lead.service_interest}</td>
                                            <td className="currency">{formatCurrency(lead.estimated_value)}</td>
                                            <td>{lead.seta}</td>
                                            <td>{formatDate(lead.created_date)}</td>
                                            <td>
                                                <span className={`status-badge ${lead.status}`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {quotationsData.length === 0 && (
                                        <tr>
                                            <td colSpan="8" style={{textAlign: 'center'}}>
                                                No active leads found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome Modal */}
            <WelcomeModal 
                isOpen={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
                userName={userName}
            />

            {/* Metrics Guide */}
            <GridCardGuide 
                isActive={showGuide}
                onComplete={handleGuideComplete}
                onSkip={handleGuideSkip}
                steps={guideSteps}
            />
        </HubSpotLayout>
    );
};

export default Dashboard; 