import App from "./App";
import "./index.css";
import { BookProvider } from "./contexts/BookContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { OrderProvider } from "./contexts/OrderContext";
import LanguageProvider from "./contexts/LanguageContext";
import ReactDOM from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <BookProvider>
                <CartProvider>
                  <OrderProvider>
                    <App />
                  </OrderProvider>
                </CartProvider>
              </BookProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
