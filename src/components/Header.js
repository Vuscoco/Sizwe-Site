import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ title, showBackButton = false }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const handleLogout = async () => {
        try {
            // Clear the stored name when logging out
            localStorage.removeItem('userName');
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Error logging out. Please try again.');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    // Simple function to get the user's name
    const getUserName = () => {
        // First try to get the name from localStorage (from login form)
        const storedName = localStorage.getItem('userName');
        if (storedName && storedName.trim() !== '') {
            return storedName;
        }
        
        // Fallback to Firebase displayName
        if (currentUser?.displayName && currentUser.displayName.trim() !== '') {
            return currentUser.displayName;
        }
        
        // Fallback to email name
        if (currentUser?.email) {
            return currentUser.email.split('@')[0];
        }
        
        // Final fallback
        return 'User';
    };

    return (
        <header className="header">
            <div className="header-content">
                {showBackButton && (
                    <button className="back-btn" onClick={handleGoBack}>
                        <i className="fas fa-arrow-left"></i> Go Back
                    </button>
                )}
                <h1>{title}</h1>
                {currentUser && (
                    <span className="user-name">Welcome, {getUserName()}</span>
                )}
            </div>
            <button id="logout-btn" className="logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
            </button>
        </header>
    );
};

export default Header; 