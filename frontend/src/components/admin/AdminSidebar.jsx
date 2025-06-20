import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

function AdminSidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  handleLogout,
  activePath,
}) {
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin",
    },
    {
      id: "books",
      label: "Books",
      icon: <BookOpen size={20} />,
      path: "/admin/books",
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Tag size={20} />,
      path: "/admin/categories",
    },
    {
      id: "publishers",
      label: "Publishers",
      icon: <Users size={20} />,
      path: "/admin/publishers",
    },
    {
      id: "authors",
      label: "Authors",
      icon: <Users size={20} />,
      path: "/admin/authors",
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart size={20} />,
      path: "/admin/orders",
    },
  ];

  return (
    <aside
      className={`bg-white dark:bg-gray-800 ${
        isSidebarCollapsed ? "w-20" : "w-64"
      } shadow-md fixed inset-y-0 left-0 transform ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-all duration-300 ease-in-out z-30`}>
      <div
        className={
          isSidebarCollapsed
            ? "p-4 flex justify-between items-center"
            : "p-6 flex justify-between items-center"
        }>
        {!isSidebarCollapsed ? (
          <h1 className="text-2xl font-bold text-amber-600">Admin Panel</h1>
        ) : (
          <h1 className="text-xl font-bold text-amber-600">AP</h1>
        )}
        <button
          className="hidden md:block p-2 rounded-md bg-amber-600 text-white shadow-md hover:bg-amber-700 z-10"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          {isSidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`flex ${
              isSidebarCollapsed ? "justify-center" : "items-center"
            } px-6 py-3 w-full ${
              activePath === item.path
                ? "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 border-r-4 border-amber-600"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
            onClick={() => {
              navigate(item.path);
              setIsMobileMenuOpen(false);
            }}>
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
          {!isSidebarCollapsed && "Logout"}
        </button>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
