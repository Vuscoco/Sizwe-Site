import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HubSpotLayout from '../components/HubSpotLayout';
import '../css/ContractCreation.css';

const ContractCreation = () => {
    const navigate = useNavigate();
    const [allowances, setAllowances] = useState([{ type: 'travel', amount: '', taxable: false }]);
    const [employmentType, setEmploymentType] = useState('permanent');
    const [hoursPerDay, setHoursPerDay] = useState(8);
    const [daysPerWeek, setDaysPerWeek] = useState(5);

    // Calculate total hours per week
    const totalHours = hoursPerDay * daysPerWeek;

    const addAllowance = () => {
        setAllowances([...allowances, { type: 'travel', amount: '', taxable: false }]);
    };

    const updateAllowance = (index, field, value) => {
        const updatedAllowances = [...allowances];
        updatedAllowances[index][field] = value;
        setAllowances(updatedAllowances);
    };

    const removeAllowance = (index) => {
        if (allowances.length > 1) {
            const updatedAllowances = allowances.filter((_, i) => i !== index);
            setAllowances(updatedAllowances);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Contract form submitted');
        // You can add API call here
    };

    // (move all code from return into a variable)
    const pageContent = (
        <>
            {/* HubSpot-style Header */}
            <div className="contract-header">
                <div className="header-content">
                    <button 
                        className="back-button" 
                        onClick={() => navigate(-1)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Back
                    </button>
                    <div className="header-title">
                        <h1>Create Employment Contract</h1>
                        <p>Generate a comprehensive employment contract with all necessary legal clauses and terms</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={() => navigate('/clients')}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSubmit}>
                            <i className="fas fa-save"></i>
                            Save Contract
                        </button>
                    </div>
                </div>
            </div>

            <main className="contract-form">
                <form id="employmentContract" onSubmit={handleSubmit}>
                    {/* Parties Section */}
                    <section className="contract-section">
                        <h2><i className="fas fa-users"></i> Parties to the Contract</h2>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="companyName">Company Legal Name</label>
                                <input type="text" id="companyName" name="companyName" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="companyReg">Company Registration Number</label>
                                <input type="text" id="companyReg" name="companyReg" required />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="companyAddress">Registered Address</label>
                                <textarea id="companyAddress" name="companyAddress" required></textarea>
                            </div>
                        </div>

                        <h3>Employee Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="employeeName">Full Legal Name</label>
                                <input type="text" id="employeeName" name="employeeName" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="employeeId">ID Number</label>
                                <input type="text" id="employeeId" name="employeeId" required />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="employeeAddress">Physical Address</label>
                                <textarea id="employeeAddress" name="employeeAddress" required></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="employeePhone">Contact Number</label>
                                <input type="tel" id="employeePhone" name="employeePhone" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="employeeEmail">Email Address</label>
                                <input type="email" id="employeeEmail" name="employeeEmail" required />
                            </div>
                        </div>
                    </section>

                    {/* Employment Details Section */}
                    <section className="contract-section">
                        <h2><i className="fas fa-calendar-alt"></i> Employment Details</h2>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input type="date" id="startDate" name="startDate" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="employmentType">Employment Type</label>
                                <select 
                                    id="employmentType" 
                                    name="employmentType" 
                                    value={employmentType}
                                    onChange={(e) => setEmploymentType(e.target.value)}
                                    required
                                >
                                    <option value="permanent">Permanent</option>
                                    <option value="fixed-term">Fixed-Term</option>
                                    <option value="temporary">Temporary</option>
                                </select>
                            </div>
                            {employmentType !== 'permanent' && (
                                <div className="form-group">
                                    <label htmlFor="endDate">End Date</label>
                                    <input type="date" id="endDate" name="endDate" />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="probationPeriod">Probation Period (months)</label>
                                <input type="number" id="probationPeriod" name="probationPeriod" min="0" max="12" defaultValue="3" />
                            </div>
                        </div>
                    </section>

                    {/* Position Details Section */}
                    <section className="contract-section">
                        <h2><i className="fas fa-briefcase"></i> Position Details</h2>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="jobTitle">Job Title</label>
                                <input type="text" id="jobTitle" name="jobTitle" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <input type="text" id="department" name="department" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="reportingTo">Reporting To</label>
                                <input type="text" id="reportingTo" name="reportingTo" required />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="jobDescription">Job Description</label>
                                <textarea id="jobDescription" name="jobDescription" rows="4" required></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Remuneration Section */}
                    <section className="contract-section">
                        <h2><i className="fas fa-money-bill-wave"></i> Remuneration</h2>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="basicSalary">Basic Salary (R)</label>
                                <input type="number" id="basicSalary" name="basicSalary" step="0.01" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="payFrequency">Pay Frequency</label>
                                <select id="payFrequency" name="payFrequency" required>
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="fortnightly">Fortnightly</option>
                                </select>
                            </div>
                        </div>

                        <div className="allowances-section">
                            <h3>Allowances</h3>
                            <div id="allowancesList">
                                {allowances.map((allowance, index) => (
                                    <div key={index} className="allowance-item">
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Type</label>
                                                <select 
                                                    value={allowance.type}
                                                    onChange={(e) => updateAllowance(index, 'type', e.target.value)}
                                                >
                                                    <option value="travel">Travel</option>
                                                    <option value="housing">Housing</option>
                                                    <option value="medical">Medical Aid</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Amount (R)</label>
                                                <input 
                                                    type="number" 
                                                    value={allowance.amount}
                                                    onChange={(e) => updateAllowance(index, 'amount', e.target.value)}
                                                    step="0.01" 
                                                />
                                            </div>
                                            <div className="form-group checkbox-group">
                                                <label>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={allowance.taxable}
                                                        onChange={(e) => updateAllowance(index, 'taxable', e.target.checked)}
                                                    />
                                                    Taxable
                                                </label>
                                            </div>
                                            {allowances.length > 1 && (
                                                <div className="form-group">
                                                    <button 
                                                        type="button" 
                                                        className="remove-allowance-btn"
                                                        onClick={() => removeAllowance(index)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="add-allowance-btn" onClick={addAllowance}>
                                <i className="fas fa-plus"></i> Add Allowance
                            </button>
                        </div>
                    </section>

                    {/* Working Hours Section */}
                    <section className="contract-section">
                        <h2><i className="fas fa-clock"></i> Working Hours</h2>
                        
                        <div className="working-hours-section">
                            <div className="hours-controls">
                                <div className="hours-control">
                                    <label htmlFor="hoursPerDay">Hours per Day</label>
                                    <input 
                                        type="number" 
                                        id="hoursPerDay" 
                                        name="hoursPerDay" 
                                        min="1" 
                                        max="24" 
                                        value={hoursPerDay}
                                        onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                                        required 
                                    />
                                </div>
                                <div className="hours-control">
                                    <label htmlFor="daysPerWeek">Days per Week</label>
                                    <input 
                                        type="number" 
                                        id="daysPerWeek" 
                                        name="daysPerWeek" 
                                        min="1" 
                                        max="7" 
                                        value={daysPerWeek}
                                        onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="total-hours">
                                Total Hours per Week: {totalHours} hours
                            </div>
                        </div>
                    </section>

                    {/* Leave Entitlements Section */}
                    <section className="contract-section">
                        <h2><i className="fas fa-calendar-check"></i> Leave Entitlements</h2>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="annualLeave">Annual Leave (days)</label>
                                <input type="number" id="annualLeave" name="annualLeave" defaultValue="15" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="sickLeave">Sick Leave (days)</label>
                                <input type="number" id="sickLeave" name="sickLeave" defaultValue="30" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="familyLeave">Family Responsibility Leave (days)</label>
                                <input type="number" id="familyLeave" name="familyLeave" defaultValue="3" required />
                            </div>
                        </div>
                    </section>

                    {/* Notice Period Section */}
                    <section className="contract-section">
                        <h2><i className="fas fa-exclamation-circle"></i> Notice Period</h2>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="employeeNotice">Employee Notice Period (weeks)</label>
                                <input type="number" id="employeeNotice" name="employeeNotice" min="1" defaultValue="4" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="employerNotice">Employer Notice Period (weeks)</label>
                                <input type="number" id="employerNotice" name="employerNotice" min="1" defaultValue="4" required />
                            </div>
                        </div>
                    </section>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/clients')}>
                            <i className="fas fa-times"></i>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            <i className="fas fa-save"></i>
                            Save Contract
                        </button>
                    </div>
                </form>
            </main>
        </>
    );

    return (
        <HubSpotLayout 
            title="Create Contract" 
            description="Create a new contract agreement"
        >
            {pageContent}
        </HubSpotLayout>
    );
};

export default ContractCreation; 