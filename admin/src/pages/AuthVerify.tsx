/**
 * Auth Verification Page
 * Handles magic link verification
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthVerify.css';

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setError('No token provided');
        return;
      }

      // Prevent double execution in React StrictMode
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');

        // Redirect to dashboard with full page reload to ensure cookie is processed
        setTimeout(() => {
          window.location.href = '/';
        }, 500);

      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verifyToken();
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <div className="verify-container">
        <div className="verify-content">
          <div className="verify-spinner"></div>
          <h2 className="verify-title">Verifying your login...</h2>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="verify-container">
        <div className="verify-content">
          <div className="verify-icon success">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="verify-title">Login successful!</h2>
          <p className="verify-message">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <div className="verify-content">
        <div className="verify-icon error">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="verify-title">Verification failed</h2>
        <p className="verify-message">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="verify-button"
        >
          Request a new login link
        </button>
      </div>
    </div>
  );
}
