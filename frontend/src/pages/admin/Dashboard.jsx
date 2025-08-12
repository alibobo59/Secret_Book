import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBook } from "../../contexts/BookContext";
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Users,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserSquare2,
  Activity,
  BarChart3,
  Megaphone,
  Package,
  Shield,
  FileText,
  UserCheck,
  Image,
  Settings,
  User,
} from "lucide-react";

import BookManagement from "./BookManagement";
import CategoryManagement from "./CategoryManagement";
import UserManagement from "./UserManagement";
import OrderManagement from "./OrderManagement";
import DashboardHome from "./DashboardHome";
import AuthorManagement from "./AuthorManagement";
import PublisherManagement from "./PublisherManagement";
import LogManagement from "./LogManagement";
import AnalyticsDashboard from "./AnalyticsDashboard";
import MarketingManagement from "./MarketingManagement";
import BulkOperations from "./BulkOperations";
import EnhancedUserManagement from "./EnhancedUserManagement";
import SecurityAudit from "./SecurityAudit";
import ContentManagement from "./ContentManagement";
import BookDetailPage from "./BookDetailPage";
import BookCreatePage from "./BookCreatePage";
import BookEditPage from "./BookEditPage";
import MediaLibrary from "./MediaLibrary";
import BulkOperationReport from "./BulkOperationReport";
import AttributeManagement from "./AttributeManagement";
import AdminProfile from "./AdminProfile";
import AdminSettings from "./AdminSettings";
import AdminHeader from "../../components/admin/AdminHeader";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { books, categories } = useBook();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") {
      setActiveTab("dashboard");
    } else if (path.startsWith("/admin/books")) {
      setActiveTab("books");
    } else if (path.startsWith("/admin/categories")) {
      setActiveTab("categories");
    } else if (path.startsWith("/admin/authors")) {
      setActiveTab("authors");
    } else if (path.startsWith("/admin/publishers")) {
      setActiveTab("publishers");
    } else if (path.startsWith("/admin/users")) {
      setActiveTab("users");
    } else if (path.startsWith("/admin/enhanced-users")) {
      setActiveTab("enhanced-users");
    } else if (path.startsWith("/admin/orders")) {
      setActiveTab("orders");
    } else if (path.startsWith("/admin/analytics")) {
      setActiveTab("analytics");
    } else if (path.startsWith("/admin/marketing")) {
      setActiveTab("marketing");
    } else if (path.startsWith("/admin/bulk-ops")) {
      setActiveTab("bulk-ops");
    } else if (path.startsWith("/admin/security")) {
      setActiveTab("security");
    } else if (path.startsWith("/admin/content")) {
      setActiveTab("content");
    } else if (path.startsWith("/admin/media")) {
      setActiveTab("media");
    } else if (path.startsWith("/admin/attributes")) {
      setActiveTab("attributes");
    } else if (path.startsWith("/admin/profile")) {
      setActiveTab("profile");
    } else if (path.startsWith("/admin/settings")) {
      setActiveTab("settings");
    } else if (path.startsWith("/admin/logs")) {
      setActiveTab("logs");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    setIsMobileMenuOpen(false);

    // Navigate to the appropriate route
    switch (itemId) {
      case "dashboard":
        navigate("/admin");
        break;
      case "books":
        navigate("/admin/books");
        break;
      case "categories":
        navigate("/admin/categories");
        break;
      case "authors":
        navigate("/admin/authors");
        break;
      case "publishers":
        navigate("/admin/publishers");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "enhanced-users":
        navigate("/admin/enhanced-users");
        break;
      case "orders":
        navigate("/admin/orders");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
      case "marketing":
        navigate("/admin/marketing");
        break;
      case "bulk-ops":
        navigate("/admin/bulk-ops");
        break;
      case "security":
        navigate("/admin/security");
        break;
      case "content":
        navigate("/admin/content");
        break;
      case "media":
        navigate("/admin/media");
        break;
      case "attributes":
        navigate("/admin/attributes");
        break;
      case "profile":
        navigate("/admin/profile");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
      case "logs":
        navigate("/admin/logs");
        break;
      default:
        navigate("/admin");
    }
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Bảng Điều Khiển", // Dashboard
      icon: <LayoutDashboard size={20} />,
    },
    { id: "books", label: "Sách", icon: <BookOpen size={20} /> }, // Books
    { id: "categories", label: "Danh Mục", icon: <Tag size={20} /> }, // Categories
    { id: "attributes", label: "Thuộc Tính", icon: <Settings size={20} /> }, // Attributes
    { id: "authors", label: "Tác Giả", icon: <UserSquare2 size={20} /> }, // Authors
    { id: "publishers", label: "Nhà Xuất Bản", icon: <Building2 size={20} /> }, // Publishers
    { id: "users", label: "Người Dùng", icon: <Users size={20} /> }, // Users
    {
      id: "enhanced-users",
      label: "Người Dùng Nâng Cao", // Enhanced Users
      icon: <UserCheck size={20} />,
    },
    { id: "orders", label: "Đơn Hàng", icon: <ShoppingCart size={20} /> }, // Orders
    { id: "analytics", label: "Phân Tích", icon: <BarChart3 size={20} /> }, // Analytics
    { id: "marketing", label: "Tiếp Thị", icon: <Megaphone size={20} /> }, // Marketing
    { id: "bulk-ops", label: "Thao Tác Hàng Loạt", icon: <Package size={20} /> }, // Bulk Operations
    { id: "security", label: "Bảo Mật", icon: <Shield size={20} /> }, // Security
    { id: "content", label: "Nội Dung", icon: <FileText size={20} /> }, // Content
    { id: "media", label: "Thư Viện Media", icon: <Image size={20} /> }, // Media Library
    { id: "profile", label: "Hồ Sơ", icon: <User size={20} /> }, // Profile
    { id: "settings", label: "Cài Đặt", icon: <Settings size={20} /> }, // Settings
    { id: "logs", label: "Nhật Ký Hệ Thống", icon: <Activity size={20} /> }, // System Logs
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-gray-800 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } shadow-md fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-all duration-300 ease-in-out z-30`}>
        <div
          className={`${
            isSidebarCollapsed ? "p-4 flex justify-center" : "p-6"
          }`}>
          {!isSidebarCollapsed ? (
            <h1 className="text-2xl font-bold text-amber-600">Bảng Quản Trị</h1> // Admin Panel
          ) : (
            <h1 className="text-xl font-bold text-amber-600">BQT</h1> // AP
          )}
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`flex ${
                isSidebarCollapsed ? "justify-center" : "items-center"
              } px-6 py-3 w-full ${
                activeTab === item.id
                  ? "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 border-r-4 border-amber-600"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleNavClick(item.id)}>
              <span className={isSidebarCollapsed ? "" : "mr-3"}>
                {item.icon}
              </span>
              {!isSidebarCollapsed && item.label}
            </button>
          ))}
          <button
            className={`flex ${
              isSidebarCollapsed ? "justify-center" : "items-center"
            } px-6 py-3 w-full text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700`}
            onClick={handleLogout}>
            <span className={isSidebarCollapsed ? "" : "mr-3"}>
              <LogOut size={20} />
            </span>
            {!isSidebarCollapsed && "Đăng Xuất"} // Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        } transition-all duration-300 flex flex-col`}>
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-0 left-0 z-40 p-4">
          <button
            className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Sidebar Toggle Button */}
        <div className="hidden md:block fixed top-4 z-40 p-1">
          <button
            className={`p-2 rounded-r-md bg-white dark:bg-gray-800 shadow-md ${
              isSidebarCollapsed ? "ml-20" : "ml-64"
            } transition-all duration-300`}
            onClick={toggleSidebar}>
            {isSidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Admin Header */}
        <AdminHeader isSidebarCollapsed={isSidebarCollapsed} />

        {/* Content Area */}
        <main className="p-6 mt-2 md:mt-0 md:pt-16 flex-1 overflow-auto">
          <Routes>
            {/* Dashboard Home */}
            // In the Routes section, change this line:
            <Route path="/" element={<DashboardHome />} />
            {/* Books Routes */}
            <Route
              path="/books"
              element={<BookManagement books={books} categories={categories} />}
            />
            <Route path="/books/create" element={<BookCreatePage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/books/:id/edit" element={<BookEditPage />} />
            {/* Other Admin Routes */}
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/attributes" element={<AttributeManagement />} />
            <Route path="/authors" element={<AuthorManagement />} />
            <Route path="/publishers" element={<PublisherManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route
              path="/enhanced-users"
              element={<EnhancedUserManagement />}
            />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/marketing" element={<MarketingManagement />} />
            <Route path="/bulk-ops" element={<BulkOperations />} />
            <Route
              path="/bulk-ops/:operationId/report"
              element={<BulkOperationReport />}
            />
            <Route path="/security" element={<SecurityAudit />} />
            <Route path="/content" element={<ContentManagement />} />
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/logs" element={<LogManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
