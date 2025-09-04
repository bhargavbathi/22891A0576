import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UrlService } from '../services/urlService';
import { Logger } from '../utils/logger';
import './RedirectHandler.css';

const RedirectHandler: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleRedirect();
  }, [shortcode]);

  const handleRedirect = async () => {
    if (!shortcode) {
      setStatus('error');
      setErrorMessage('No shortcode provided');
      await Logger.Log('RedirectHandler', 'ERROR', 'component', 'No shortcode provided in URL');
      return;
    }

    try {
      await Logger.Log('RedirectHandler', 'INFO', 'component', `Attempting to resolve shortcode: ${shortcode}`);
      
      const originalUrl = await UrlService.resolveShortcode(shortcode);
      
      if (!originalUrl) {
        setStatus('expired');
        setErrorMessage('This short link has expired or does not exist');
        await Logger.Log('RedirectHandler', 'WARN', 'component', `Shortcode not found or expired: ${shortcode}`);
        return;
      }

      setStatus('redirecting');
      await Logger.Log('RedirectHandler', 'INFO', 'component', `Redirecting to: ${originalUrl}`);
      
      // Small delay to show the redirecting message
      setTimeout(() => {
        window.location.href = originalUrl;
      }, 1000);

    } catch (error) {
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);
      await Logger.Log('RedirectHandler', 'ERROR', 'component', `Redirect failed: ${errorMsg}`);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="redirect-handler">
      <div className="redirect-content">
        {status === 'loading' && (
          <div className="status-message">
            <div className="spinner"></div>
            <h2>Loading...</h2>
            <p>Resolving short link: /{shortcode}</p>
          </div>
        )}

        {status === 'redirecting' && (
          <div className="status-message">
            <div className="spinner"></div>
            <h2>Redirecting...</h2>
            <p>Taking you to your destination...</p>
          </div>
        )}

        {status === 'expired' && (
          <div className="status-message error">
            <div className="error-icon">⚠️</div>
            <h2>Link Expired</h2>
            <p>{errorMessage}</p>
            <p>This short link may have expired or never existed.</p>
            <button onClick={goHome} className="home-button">
              Create New Short Link
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="status-message error">
            <div className="error-icon">❌</div>
            <h2>Error</h2>
            <p>{errorMessage}</p>
            <p>Something went wrong while processing your request.</p>
            <button onClick={goHome} className="home-button">
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedirectHandler;
