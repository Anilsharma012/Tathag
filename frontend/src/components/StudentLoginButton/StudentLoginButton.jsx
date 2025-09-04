import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentLoginButton = () => {
  const navigate = useNavigate();

  const handleQuickLogin = async () => {
    try {
      const response = await fetch('/api/dev/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('✅ Logged in as Demo Student!');
        
        // Redirect to student dashboard
        navigate('/student/dashboard');
        window.location.reload(); // Refresh to update authentication state
      } else {
        alert('❌ Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ Login error: ' + error.message);
    }
  };

  return (
    <button 
      onClick={handleQuickLogin}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px'
      }}
    >
      🔧 Quick Student Login
    </button>
  );
};

export default StudentLoginButton;
