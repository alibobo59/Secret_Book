import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ProductOverviewPage from "./pages/ProductOverviewPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import CheckoutConfirmationPage from "./pages/CheckoutConfirmationPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AboutUsPage from "./pages/AboutUsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/product/:id" element={<ProductOverviewPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/checkout/confirmation"
            element={<CheckoutConfirmationPage />}
          />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
