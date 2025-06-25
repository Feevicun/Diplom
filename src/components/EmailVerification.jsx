import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    fetch(`/api/verify/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Verification failed');
        }
        return res.text();
      })
      .then(() => {
        setMessage('✅ Email verified successfully.');
        setTimeout(() => {
          navigate('/register'); // редірект через React Router
        }, 1000);
      })
      .catch((err) => {
        setMessage(`❌ Verification error: ${err.message}`);
      });
  }, [token, navigate]);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '40px' }}>
      <h1>{message}</h1>
    </div>
  );
}

export default EmailVerification;
