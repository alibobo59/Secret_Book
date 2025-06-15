import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ClientLayout, AdminLayout } from "./layouts";
import {
  HomePage,
  BrowseBooksPage,
  BookDetailPage,
  CartPage,
  ProfilePage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
} from "./pages/client";
import {
  DashboardHome,
  BookManagement,
  CategoryManagement,
  AuthorManagement,
  PublisherManagement,
  UserManagement,
  OrderManagement,
  PublisherCreate,
  PublisherEdit,
  BookCreate,
  BookEdit,
} from "./pages/admin";

function App() {
  const { user, hasRole, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-amber-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading from main...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BrowseBooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          user && hasRole(["admin", "mod"]) ? (
            <AdminLayout />
          ) : (
            <Navigate to="/login" />
          )
        }>
        <Route index element={<DashboardHome />} />
        <Route path="books" element={<BookManagement />} />
        <Route path="books/create" element={<BookCreate />} />
        <Route path="books/edit/:id" element={<BookEdit />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="authors" element={<AuthorManagement />} />
        <Route path="publishers" element={<PublisherManagement />} />
        <Route path="publishers/create" element={<PublisherCreate />} />
        <Route path="publishers/edit/:id" element={<PublisherEdit />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="orders" element={<OrderManagement />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
