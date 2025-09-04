import React, { useState, useEffect } from 'react';
import './DevNotification.css';

const DevNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      checkBackendStatus();
      setIsVisible(true);
    }
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const handleStudentLogin = async () => {
    try {
      const response = await fetch('/api/dev/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('✅ Logged in as ' + data.user.name);
        window.location.href = '/student/dashboard';
      } else {
        alert('❌ Login failed');
      }
    } catch (error) {
      alert('❌ Login error: ' + error.message);
    }
  };

  const getStatusMessage = () => {
    switch (backendStatus) {
      case 'connected':
        return '✅ Backend connected';
      case 'disconnected':
        return '⚠️ Backend disconnected - Using mock data';
      case 'error':
        return '❌ Backend error - Using mock data';
      default:
        return '🔄 Checking backend status...';
    }
  };

  const getStatusClass = () => {
    switch (backendStatus) {
      case 'connected':
        return 'dev-notification--success';
      case 'disconnected':
      case 'error':
        return 'dev-notification--warning';
      default:
        return 'dev-notification--info';
    }
  };

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`dev-notification ${getStatusClass()}`}>
      <div className="dev-notification__content">
        <span className="dev-notification__icon">🔧</span>
        <span className="dev-notification__text">
          Development Mode: {getStatusMessage()}
        </span>
        <button
          className="dev-notification__retry"
          onClick={checkBackendStatus}
          title="Retry backend connection"
        >
          🔄
        </button>
        <button
          className="dev-notification__retry"
          onClick={handleStudentLogin}
          title="Quick Student Login"
          style={{ marginLeft: '5px', backgroundColor: '#4CAF50' }}
        >
          👤
        </button>
        <button 
          className="dev-notification__close"
          onClick={() => setIsVisible(false)}
          title="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DevNotification;
