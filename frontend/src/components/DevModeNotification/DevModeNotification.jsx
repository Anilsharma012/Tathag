import  { useState, useEffect } from 'react';

const DevModeNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('/api/health');
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.warn('Failed to parse backend health response:', parseError);
          data = { status: 'error' };
        }

        if (response.ok && data.status === 'ok') {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('offline');
        setIsVisible(true);
      }
    };

    checkBackendStatus();
  }, []);

  if (!isVisible || backendStatus === 'connected') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#ffd60a',
      color: '#003566',
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 9999,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      ⚠️ Development Mode: Backend server is offline. Some features may not work properly.
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          marginLeft: '10px',
          background: 'none',
          border: 'none',
          color: '#003566',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default DevModeNotification;
