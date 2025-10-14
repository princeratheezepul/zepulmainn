import React from 'react';
import { useMarketplaceAuth } from '../../../context/MarketplaceAuthContext';
import toast from 'react-hot-toast';

const SessionTestComponent = () => {
  const { handleSessionExpired, sessionExpired } = useMarketplaceAuth();

  const testSessionExpiration = () => {
    // Simulate session expiration
    handleSessionExpired();
  };

  const testToastDirectly = () => {
    toast.error('Test toast notification for session expiration', {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#ff4b4b',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Session Management Test</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Session Expired State: {sessionExpired ? 'Yes' : 'No'}
        </p>
        <button
          onClick={testSessionExpiration}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
        >
          Test Session Expiration
        </button>
        <button
          onClick={testToastDirectly}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Toast Directly
        </button>
      </div>
    </div>
  );
};

export default SessionTestComponent;
