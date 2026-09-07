import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeIntro = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  console.log('WelcomeIntro component rendered');

  const slides = [
    {
      id: 1,
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src="/images/sizwe_training_logo.jpeg" 
              alt="Sizwe Training Logo" 
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>
          <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '1rem' }}>
            Welcome to MySizwe
          </h1>
          <p style={{ fontSize: '1.3rem', color: '#e6ffe6', marginBottom: '2rem' }}>
            Your comprehensive training management solution
          </p>
        </div>
      )
    },
    {
      id: 2,
      content: (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>
            Manage Your Training Programs
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '2rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>Client Management</p>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>Lead Tracking</p>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>Contract Creation</p>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📈</div>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>Reports & Analytics</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      content: (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>
            Streamline Your Operations
          </h2>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
              <span style={{ 
                background: '#4CAF50', 
                color: 'white', 
                width: '25px', 
                height: '25px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>✓</span>
              <span>Accreditation Management</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
              <span style={{ 
                background: '#4CAF50', 
                color: 'white', 
                width: '25px', 
                height: '25px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>✓</span>
              <span>Skills Program Development</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
              <span style={{ 
                background: '#4CAF50', 
                color: 'white', 
                width: '25px', 
                height: '25px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>✓</span>
              <span>Facilitator Management</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
              <span style={{ 
                background: '#4CAF50', 
                color: 'white', 
                width: '25px', 
                height: '25px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>✓</span>
              <span>Timetable Scheduling</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      content: (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#e6ffe6', marginBottom: '2rem', lineHeight: '1.6' }}>
            Your dashboard is ready. Let's begin managing your training programs efficiently.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: '#ffffff', 
              borderRadius: '50%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: '#ffffff', 
              borderRadius: '50%',
              animation: 'pulse 1.5s ease-in-out infinite 0.2s'
            }}></div>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: '#ffffff', 
              borderRadius: '50%',
              animation: 'pulse 1.5s ease-in-out infinite 0.4s'
            }}></div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    console.log('WelcomeIntro useEffect - starting timer');
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => {
        console.log('Slide changing from', prev, 'to', prev + 1);
        if (prev < slides.length - 1) {
          return prev + 1;
        } else {
          // On the last slide, wait a bit then navigate
          console.log('Last slide reached, preparing to navigate');
          clearInterval(slideTimer);
          setTimeout(() => {
            console.log('Calling onComplete and navigating');
            onComplete(); // Mark welcome as seen
            navigate('/dashboard');
          }, 2000);
          return prev;
        }
      });
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(slideTimer);
  }, [navigate, slides.length, onComplete]);

  // Skip intro if user clicks anywhere
  const handleSkip = () => {
    console.log('Skip button clicked');
    onComplete(); // Mark welcome as seen
    navigate('/dashboard');
  };

  console.log('Rendering WelcomeIntro with current slide:', currentSlide);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #006400 0%, #004d00 50%, #003300 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        cursor: 'pointer'
      }}
      onClick={handleSkip}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        color: 'white'
      }}>
        <div 
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
        >
          Skip Intro
        </div>
        
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out'
              }}
            >
              {slide.content}
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem'
        }}>
          {slides.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                background: index === currentSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.2);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default WelcomeIntro; 