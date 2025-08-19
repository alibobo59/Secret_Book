import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { AdminContextProvider } from './contexts/AdminContextProvider';
import { OptimizedContextWrapper } from './contexts/OptimizedProviders';
import ErrorBoundary from './components/common/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <OptimizedContextWrapper>
            <AdminContextProvider>
              <App />
            </AdminContextProvider>
          </OptimizedContextWrapper>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
