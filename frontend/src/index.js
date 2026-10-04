import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import API_URL from './api';

const originalFetch = window.fetch.bind(window);

window.fetch = (url, options = {}) => {
  if (
    API_URL &&
    typeof url === 'string' &&
    url.startsWith('/')
  ) {
    const requestOptions = {
      ...options,
      credentials: options.credentials || 'include',
    };

    return originalFetch(
      `${API_URL}${url}`,
      requestOptions
    );
  }

  return originalFetch(url, options);
};

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();