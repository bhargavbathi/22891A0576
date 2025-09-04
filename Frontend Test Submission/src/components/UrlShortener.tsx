import React, { useState, useEffect } from 'react';
import { UrlService, ShortenUrlRequest, ShortenUrlResponse, UrlMapping } from '../services/urlService';
import { Logger } from '../utils/logger';
import './UrlShortener.css';

const UrlShortener: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customShortcode, setCustomShortcode] = useState('');
  const [validityMinutes, setValidityMinutes] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<UrlMapping[]>([]);

  useEffect(() => {
    loadExistingUrls();
  }, []);

  const loadExistingUrls = async () => {
    try {
      const mappings = await UrlService.getAllMappings();
      setShortenedUrls(mappings);
    } catch (error) {
      await Logger.Log('UrlShortener', 'ERROR', 'component', 'Failed to load existing URLs');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await Logger.Log('UrlShortener', 'INFO', 'component', 'User initiated URL shortening');

      const request: ShortenUrlRequest = {
        originalUrl,
        customShortcode: customShortcode || undefined,
        validityMinutes
      };

      const response: ShortenUrlResponse = await UrlService.shortenUrl(request);
      
      setSuccess(`URL shortened successfully! Short URL: ${response.shortUrl}`);
      setOriginalUrl('');
      setCustomShortcode('');
      setValidityMinutes(30);
      
      // Reload the list
      await loadExistingUrls();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      await Logger.Log('UrlShortener', 'ERROR', 'component', `URL shortening failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (shortcode: string) => {
    try {
      await UrlService.deleteMappingByShortcode(shortcode);
      await loadExistingUrls();
      await Logger.Log('UrlShortener', 'INFO', 'component', `User deleted shortcode: ${shortcode}`);
    } catch (error) {
      await Logger.Log('UrlShortener', 'ERROR', 'component', `Failed to delete shortcode: ${shortcode}`);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('URL copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      await Logger.Log('UrlShortener', 'ERROR', 'component', 'Failed to copy to clipboard');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) <= new Date();
  };

  return (
    <div className="url-shortener">
      <header className="header">
        <h1>URL Shortener</h1>
        <p>Create short, memorable links that redirect to your original URLs</p>
      </header>

      <div className="main-content">
        <div className="shortener-form">
          <h2>Shorten a URL</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="originalUrl">Original URL *</label>
              <input
                type="url"
                id="originalUrl"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customShortcode">Custom Shortcode (optional)</label>
              <input
                type="text"
                id="customShortcode"
                value={customShortcode}
                onChange={(e) => setCustomShortcode(e.target.value)}
                placeholder="mylink (3-10 alphanumeric characters)"
                pattern="[a-zA-Z0-9]{3,10}"
                disabled={isLoading}
              />
              <small>Leave empty for auto-generated shortcode</small>
            </div>

            <div className="form-group">
              <label htmlFor="validityMinutes">Validity Period (minutes)</label>
              <input
                type="number"
                id="validityMinutes"
                value={validityMinutes}
                onChange={(e) => setValidityMinutes(parseInt(e.target.value) || 30)}
                min="1"
                max="10080"
                disabled={isLoading}
              />
              <small>Default: 30 minutes, Max: 1 week</small>
            </div>

            <button type="submit" disabled={isLoading || !originalUrl}>
              {isLoading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>

        <div className="urls-list">
          <h2>Your Shortened URLs</h2>
          {shortenedUrls.length === 0 ? (
            <p className="no-urls">No URLs shortened yet. Create your first short link above!</p>
          ) : (
            <div className="urls-grid">
              {shortenedUrls.map((mapping) => (
                <div key={mapping.shortcode} className={`url-card ${isExpired(mapping.expiresAt) ? 'expired' : ''}`}>
                  <div className="url-info">
                    <div className="short-url">
                      <strong>Short URL:</strong>
                      <span 
                        className="clickable-url"
                        onClick={() => copyToClipboard(`${window.location.origin}/${mapping.shortcode}`)}
                        title="Click to copy"
                      >
                        {window.location.origin}/{mapping.shortcode}
                      </span>
                    </div>
                    <div className="original-url">
                      <strong>Original:</strong>
                      <span className="truncated-url" title={mapping.originalUrl}>
                        {mapping.originalUrl}
                      </span>
                    </div>
                    <div className="metadata">
                      <div>Created: {formatDate(mapping.createdAt)}</div>
                      <div>Expires: {formatDate(mapping.expiresAt)}</div>
                      <div>Clicks: {mapping.accessCount}</div>
                      {isExpired(mapping.expiresAt) && <div className="expired-label">EXPIRED</div>}
                    </div>
                  </div>
                  <div className="url-actions">
                    <button 
                      onClick={() => copyToClipboard(`${window.location.origin}/${mapping.shortcode}`)}
                      className="copy-btn"
                    >
                      Copy
                    </button>
                    <button 
                      onClick={() => handleDelete(mapping.shortcode)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UrlShortener;
