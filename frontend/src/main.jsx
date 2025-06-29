import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { BookProvider } from './contexts/BookContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { OrderProvider } from './contexts/OrderContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ChangelogProvider } from './contexts/ChangelogContext';
import { ToastProvider } from './contexts/ToastContext';
import { AttributeProvider } from './contexts/AttributeContext';
import { VariationProvider } from './contexts/VariationContext';
import ErrorBoundary from './components/common/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <BookProvider>
              <CartProvider>
                <OrderProvider>
                  <LanguageProvider>
                    <ChangelogProvider>
                      <ToastProvider>
                        <AttributeProvider>
                          <VariationProvider>
                            <App />
                          </VariationProvider>
                        </AttributeProvider>
                      </ToastProvider>
                    </ChangelogProvider>
                  </LanguageProvider>
                </OrderProvider>
              </CartProvider>
            </BookProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
