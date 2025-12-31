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
        if (!hasVerified.current) {
          setStatus('error');
          setError('No token provided');
        }
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

        // Redirect immediately on success - no need to show success screen
        window.location.href = '/';

      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verifyToken();
  }, [searchParams]);

  // Only show verifying or error states (success redirects immediately)
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

  // Error state
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
