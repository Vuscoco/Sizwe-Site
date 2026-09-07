import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeModal = ({ isOpen, onClose, userName }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            setCurrentStep(0);
        }, 300);
    };

    const handleNext = () => {
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleSkip = () => {
        handleClose();
    };

    const steps = [
        {
            title: `Welcome to MySizwe, ${userName || 'User'}!`,
            description: "Your comprehensive training and skills development platform. Get started with managing your training programs.",
            icon: "fas fa-home",
            color: "#006400"
        },
        {
            title: "Manage Your Clients",
            description: "Track client information, manage contracts, and monitor training programs all in one place.",
            icon: "fas fa-users",
            color: "#004d00"
        },
        {
            title: "Ready to Get Started?",
            description: "You're all set! Explore your dashboard and start managing your training programs.",
            icon: "fas fa-rocket",
            color: "#003300"
        }
    ];

    if (!isOpen) return null;

    return (
        <div className={`welcome-modal-overlay ${isVisible ? 'visible' : ''}`}>
            <div className="welcome-modal">
                <div className="welcome-header">
                    <div className="welcome-logo">
                        <img 
                            src="/images/sizwe_training_logo.jpeg" 
                            alt="MySizwe Training" 
                            className="welcome-logo-img"
                        />
                        <span className="welcome-brand">MySizwe</span>
                    </div>
                    <button className="welcome-close-btn" onClick={handleSkip}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="welcome-content">
                    <div className="welcome-step">
                        <div 
                            className="welcome-icon" 
                            style={{ backgroundColor: steps[currentStep].color }}
                        >
                            <i className={steps[currentStep].icon}></i>
                        </div>
                        <h2 className="welcome-title">{steps[currentStep].title}</h2>
                        <p className="welcome-description">{steps[currentStep].description}</p>
                    </div>

                    <div className="welcome-progress">
                        {steps.map((_, index) => (
                            <div 
                                key={index}
                                className={`progress-dot ${index === currentStep ? 'active' : ''}`}
                                onClick={() => setCurrentStep(index)}
                            ></div>
                        ))}
                    </div>

                    <div className="welcome-actions">
                        <button className="welcome-skip-btn" onClick={handleSkip}>
                            Skip
                        </button>
                        <button className="welcome-next-btn" onClick={handleNext}>
                            {currentStep === 2 ? 'Get Started' : 'Next'}
                            <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal; 