import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts"; // Remove useBook import
import { AdminHeader, AdminSidebar, AdminFooter } from "../components/admin";
import { Menu, X } from "lucide-react";

const AdminLayout = () => {
  const { user, logout, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !hasRole(["admin", "mod"]))) {
      console.log("navigate from adminLayout");
      navigate("/login");
    }
  }, [user, authLoading, hasRole, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const isLoading = authLoading; // Only use authLoading

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        handleLogout={handleLogout}
        activePath={location.pathname}
      />
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        } transition-all duration-300 flex flex-col`}>
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AdminHeader isSidebarCollapsed={isSidebarCollapsed} />

        <main className="p-6 mt-16 md:pt-16 flex-1 overflow-auto">
          <Outlet
            context={{
              loading: isLoading, // Only authLoading
              error: null, // Remove error from useBook
              user,
              hasRole,
            }}
          />
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
