import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/client/Header";
import Footer from "../components/client/Footer";

const ClientLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-amber-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading Client...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
