import React, { useState, useEffect, useRef } from 'react';
import '../css/GridCardGuide.css';

const GridCardGuide = ({ 
    isActive, 
    onComplete, 
    onSkip, 
    steps = [], 
    targetSelector = '.grid-cols-2' 
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [highlightedElement, setHighlightedElement] = useState(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            setIsVisible(true);
            setCurrentStep(0);
            // Add guide-active class to body to allow scrolling
            document.body.classList.add('guide-active');
        } else {
            setIsVisible(false);
            setCurrentStep(0);
            // Remove guide-active class from body
            document.body.classList.remove('guide-active');
        }
        
        // Cleanup function to ensure class is removed when component unmounts
        return () => {
            document.body.classList.remove('guide-active');
        };
    }, [isActive]);

    useEffect(() => {
        if (isVisible && currentStep < steps.length) {
            const step = steps[currentStep];
            highlightElement(step.target);
            positionTooltip(step.target);
        }
    }, [isVisible, currentStep, steps]);

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
            
            // Auto-scroll to bring the element into view
            scrollToElement(targetElement);
        }
    };

    const scrollToElement = (element) => {
        const elementRect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculate if element is outside viewport with more generous buffers
        const topBuffer = 150; // Increased buffer for better visibility
        const bottomBuffer = 200; // More space for tooltip
        const sideBuffer = 100;
        
        const isAboveViewport = elementRect.top < topBuffer;
        const isBelowViewport = elementRect.bottom > viewportHeight - bottomBuffer;
        const isLeftOfViewport = elementRect.left < sideBuffer;
        const isRightOfViewport = elementRect.right > viewportWidth - sideBuffer;
        
        // Only scroll if element is significantly outside viewport
        const needsVerticalScroll = isAboveViewport || isBelowViewport;
        const needsHorizontalScroll = isLeftOfViewport || isRightOfViewport;
        
        if (needsVerticalScroll || needsHorizontalScroll) {
            // Calculate optimal scroll position
            let scrollTop = window.pageYOffset;
            let scrollLeft = window.pageXOffset;
            
            if (isAboveViewport) {
                // Scroll to position element in upper third of viewport
                scrollTop = window.pageYOffset + elementRect.top - (viewportHeight * 0.25);
            } else if (isBelowViewport) {
                // Scroll to position element in lower third of viewport, leaving space for tooltip
                scrollTop = window.pageYOffset + elementRect.bottom - (viewportHeight * 0.75);
            }
            
            if (isLeftOfViewport) {
                scrollLeft = window.pageYOffset + elementRect.left - sideBuffer;
            } else if (isRightOfViewport) {
                scrollLeft = window.pageXOffset + elementRect.right - viewportWidth + sideBuffer;
            }
            
            // Use a more gentle scroll with easing
            const startTop = window.pageYOffset;
            const startLeft = window.pageXOffset;
            const targetTop = Math.max(0, scrollTop);
            const targetLeft = Math.max(0, scrollLeft);
            const duration = 800; // Longer, smoother duration
            const startTime = performance.now();
            
            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };
            
            const animateScroll = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeInOutCubic(progress);
                
                const currentTop = startTop + (targetTop - startTop) * easedProgress;
                const currentLeft = startLeft + (targetLeft - startLeft) * easedProgress;
                
                window.scrollTo(currentLeft, currentTop);
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            };
            
            requestAnimationFrame(animateScroll);
        }
    };

    const positionTooltip = (target) => {
        const targetElement = document.querySelector(target);
        const tooltip = tooltipRef.current;
        
        if (targetElement && tooltip) {
            // Longer delay to allow for smooth scrolling to complete
            setTimeout(() => {
                const targetRect = targetElement.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                
                // Calculate optimal positioning with better spacing
                let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                let top = targetRect.bottom + 15; // Increased spacing
                
                // Ensure tooltip stays within viewport with generous margins
                const margin = 20;
                if (left < margin) left = margin;
                if (left + tooltipRect.width > window.innerWidth - margin) {
                    left = window.innerWidth - tooltipRect.width - margin;
                }
                
                // Smart positioning logic with better space calculation
                const spaceBelow = window.innerHeight - targetRect.bottom;
                const spaceAbove = targetRect.top;
                const tooltipHeight = tooltipRect.height + 30; // Extra buffer
                
                // Prefer below if there's enough space, otherwise above
                if (spaceBelow >= tooltipHeight && spaceBelow > spaceAbove) {
                    // Position below with comfortable spacing
                    top = targetRect.bottom + 15;
                } else if (spaceAbove >= tooltipHeight) {
                    // Position above with comfortable spacing
                    top = targetRect.top - tooltipRect.height - 15;
                } else {
                    // If neither above nor below has enough space, find the best option
                    if (spaceBelow > spaceAbove) {
                        // Position below, even if it might be tight
                        top = targetRect.bottom + 10;
                    } else {
                        // Position above, even if it might be tight
                        top = targetRect.top - tooltipRect.height - 10;
                    }
                }
                
                // Final viewport boundary check with generous margins
                if (top < margin) top = margin;
                if (top + tooltipRect.height > window.innerHeight - margin) {
                    top = window.innerHeight - tooltipRect.height - margin;
                }
                
                // Apply smooth positioning with CSS transition
                tooltip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            }, 500); // Increased delay to allow smooth scroll to complete
        }
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
        // Remove highlights
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
        // Remove highlights
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
            {/* Backdrop that dims everything except highlighted element */}
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
                    
                    <div className="guide-keyboard-hint">
                        <i className="fas fa-keyboard"></i>
                        <span>Press <kbd>Enter</kbd> to continue</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GridCardGuide; 