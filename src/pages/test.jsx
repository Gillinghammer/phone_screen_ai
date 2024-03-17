import React, { useEffect } from 'react';

const TestSessionComponent = () => {
  useEffect(() => {
    const fetchSession = async () => {
      const response = await fetch('/api/test-session', {
        method: 'GET',
        credentials: 'include', // Important for sending cookies
      });
      const data = await response.json();
      console.log('Test Session Data:', data);
    };

    fetchSession();
  }, []);

  return (
    <div>
      <h2>Check Console for Test Session Data</h2>
    </div>
  );
};

export default TestSessionComponent;
