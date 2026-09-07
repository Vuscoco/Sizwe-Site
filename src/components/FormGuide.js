import React, { useState, useEffect, useRef } from 'react';
import '../css/GridCardGuide.css';

const FormGuide = ({ 
    isActive, 
    onComplete, 
    onSkip, 
    steps = [], 
    onTabChange,
    currentTab
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [highlightedElement, setHighlightedElement] = useState(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            setIsVisible(true);
            setCurrentStep(0);
            document.body.classList.add('guide-active');
        } else {
            setIsVisible(false);
            setCurrentStep(0);
            document.body.classList.remove('guide-active');
        }
        
        return () => {
            document.body.classList.remove('guide-active');
        };
    }, [isActive]);

    useEffect(() => {
        if (isVisible && currentStep < steps.length) {
            const step = steps[currentStep];
            
            // Handle tab switching if specified in the step
            if (step.switchToTab && onTabChange) {
                onTabChange(step.switchToTab);
                // Wait a bit for the tab to switch before highlighting
                setTimeout(() => {
                    highlightElement(step.target);
                    positionTooltip(step.target);
                }, 300);
            } else {
                highlightElement(step.target);
                positionTooltip(step.target);
            }
        }
    }, [isVisible, currentStep, steps, onTabChange]);

    // Add keyboard event listener for Enter key
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (isVisible && event.key === 'Enter') {
                event.preventDefault();
                nextStep();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleKeyPress);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [isVisible, currentStep, steps.length]);

    const highlightElement = (target) => {
        // Remove previous highlights
        const existingHighlights = document.querySelectorAll('.guide-highlight');
        existingHighlights.forEach(el => {
            el.classList.remove('guide-highlight');
        });

        // Add highlight to target element
        const targetElement = document.querySelector(target);
        if (targetElement) {
            targetElement.classList.add('guide-highlight');
            setHighlightedElement(targetElement);
            scrollToElement(targetElement);
        }
    };

    const scrollToElement = (element) => {
        const elementRect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const topBuffer = 150;
        const bottomBuffer = 200;
        const sideBuffer = 100;
        
        const isAboveViewport = elementRect.top < topBuffer;
        const isBelowViewport = elementRect.bottom > viewportHeight - bottomBuffer;
        const isLeftOfViewport = elementRect.left < sideBuffer;
        const isRightOfViewport = elementRect.right > viewportWidth - sideBuffer;
        
        const needsVerticalScroll = isAboveViewport || isBelowViewport;
        const needsHorizontalScroll = isLeftOfViewport || isRightOfViewport;
        
        if (needsVerticalScroll || needsHorizontalScroll) {
            let scrollTop = window.pageYOffset;
            let scrollLeft = window.pageXOffset;
            
            if (needsVerticalScroll) {
                if (isAboveViewport) {
                    scrollTop = element.offsetTop - topBuffer;
                } else {
                    scrollTop = element.offsetTop - viewportHeight + bottomBuffer + element.offsetHeight;
                }
            }
            
            if (needsHorizontalScroll) {
                if (isLeftOfViewport) {
                    scrollLeft = element.offsetLeft - sideBuffer;
                } else {
                    scrollLeft = element.offsetLeft - viewportWidth + sideBuffer + element.offsetWidth;
                }
            }
            
            // Smooth scroll animation
            const startTime = performance.now();
            const startScrollTop = window.pageYOffset;
            const startScrollLeft = window.pageXOffset;
            const scrollDistanceTop = scrollTop - startScrollTop;
            const scrollDistanceLeft = scrollLeft - startScrollLeft;
            const duration = 800;
            
            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };
            
            const animateScroll = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeInOutCubic(progress);
                
                window.scrollTo(
                    startScrollLeft + scrollDistanceLeft * easedProgress,
                    startScrollTop + scrollDistanceTop * easedProgress
                );
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            };
            
            requestAnimationFrame(animateScroll);
        }
    };

    const positionTooltip = (target) => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;

        const targetElement = document.querySelector(target);
        if (!targetElement) return;

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate position based on step position preference
        const step = steps[currentStep];
        const position = step.position || 'bottom';
        
        let left, top;
        
        switch (position) {
            case 'top':
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                top = targetRect.top - tooltipRect.height - 10;
                break;
            case 'bottom':
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                top = targetRect.bottom + 10;
                break;
            case 'left':
                left = targetRect.left - tooltipRect.width - 10;
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                left = targetRect.right + 10;
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                break;
            default:
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                top = targetRect.bottom + 10;
        }

        // Ensure tooltip stays within viewport
        left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));
        top = Math.max(10, Math.min(top, viewportHeight - tooltipRect.height - 10));

        // Apply position with animation
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(20px)';
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        }, 100);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeGuide();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeGuide = () => {
        const existingHighlights = document.querySelectorAll('.guide-highlight');
        existingHighlights.forEach(el => {
            el.classList.remove('guide-highlight');
        });
        
        setIsVisible(false);
        setCurrentStep(0);
        setHighlightedElement(null);
        onComplete && onComplete();
    };

    const skipGuide = () => {
        const existingHighlights = document.querySelectorAll('.guide-highlight');
        existingHighlights.forEach(el => {
            el.classList.remove('guide-highlight');
        });
        
        setIsVisible(false);
        setCurrentStep(0);
        setHighlightedElement(null);
        onSkip && onSkip();
    };

    if (!isVisible || currentStep >= steps.length) return null;

    const currentStepData = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <>
            {/* Backdrop */}
            <div className="guide-backdrop" onClick={skipGuide}></div>
            
            {/* Tooltip */}
            <div ref={tooltipRef} className="guide-tooltip">
                <div className="guide-tooltip-header">
                    <h3>{currentStepData.title}</h3>
                    <button className="guide-close" onClick={skipGuide}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="guide-tooltip-content">
                    <p>{currentStepData.description}</p>
                </div>
                
                <div className="guide-tooltip-footer">
                    <div className="guide-progress">
                        <div className="guide-progress-bar">
                            <div 
                                className="guide-progress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="guide-progress-text">
                            {currentStep + 1} of {steps.length}
                        </span>
                    </div>
                    
                    <div className="guide-actions">
                        <button 
                            className="guide-btn guide-btn-skip"
                            onClick={skipGuide}
                        >
                            Skip Guide
                        </button>
                        
                        <div className="guide-nav">
                            <button 
                                className="guide-btn guide-btn-prev"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                            >
                                Previous
                            </button>
                            
                            <button 
                                className="guide-btn guide-btn-next"
                                onClick={nextStep}
                            >
                                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FormGuide; 