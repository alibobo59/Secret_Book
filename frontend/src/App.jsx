import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { CouponProvider } from "./contexts/CouponContext";
import { UserManagementProvider } from "./contexts/UserManagementContext";
import { ReviewManagementProvider } from "./contexts/ReviewManagementContext";
import { OrderManagementProvider } from "./contexts/OrderManagementContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { ClientLayout, AdminLayout } from "./layouts";
import {
  OrderManagement as OrderManagementClient,
  HomePage,
  BrowseBooksPage,
  BookDetailPage,
  ProfilePage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
  CheckOutPage,
  OrderSuccessPage,
  OrderFailedPage,
  OrderConfirmationPage,
} from "./pages/client";
import ReviewPage from "./pages/client/ReviewPage";
import {
  DashboardHome,
  BookManagement,
  CategoryManagement,
  AuthorManagement,
  PublisherManagement,
  UserManagement,
  OrderManagement,
  OrderDetail,
  PublisherCreate,
  PublisherEdit,
  BookCreate,
  BookEdit,
  BookDetail,
  AuditLogDashboard,
  ReviewManagement,
} from "./pages/admin";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import CouponManagement from "./pages/admin/CouponManagement";
import CouponCreate from "./pages/admin/CouponCreate";
import CouponEdit from "./pages/admin/CouponEdit";

function App() {
  const { user, hasRole, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-amber-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Đang tải từ trang chính...
          </p>
        </div>
      </div>
    );
  }

  return (
    <CouponProvider>
      <UserManagementProvider>
        <ReviewManagementProvider>
          <OrderManagementProvider>
            <AnalyticsProvider>
              <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BrowseBooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/checkout" element={<CheckOutPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/orders" element={<OrderManagementClient />} />
        <Route path="/orders/:orderId/review" element={<ReviewPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="/order-failed/:orderId?" element={<OrderFailedPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
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
        <Route path="books/:id" element={<BookDetail />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="authors" element={<AuthorManagement />} />
        <Route path="publishers" element={<PublisherManagement />} />
        <Route path="publishers/create" element={<PublisherCreate />} />
        <Route path="publishers/edit/:id" element={<PublisherEdit />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="audit-logs" element={<AuditLogDashboard />} />
        <Route path="coupons" element={<CouponManagement />} />
        <Route path="coupons/create" element={<CouponCreate />} />
        <Route path="coupons/edit/:id" element={<CouponEdit />} />
        <Route path="reviews" element={<ReviewManagement />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AnalyticsProvider>
          </OrderManagementProvider>
        </ReviewManagementProvider>
      </UserManagementProvider>
    </CouponProvider>
  );
}

export default App;
