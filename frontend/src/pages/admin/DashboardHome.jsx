import React, { useEffect } from 'react';
import { BookOpen, Tag, AlertCircle, DollarSign } from "lucide-react";
import { StatCard, Table } from "../../components/admin";
import { useNotification } from "../../contexts/NotificationContext";
import { useToast } from "../../contexts/ToastContext";
import { useBook } from "../../contexts/BookContext";
import NotificationTestPanel from "../../components/admin/NotificationTestPanel";

/**
 * Dashboard home component showing statistics and low stock books
 */
const DashboardHome = () => {
  const { books, categories, loading } = useBook();
  const { notifyLowStock } = useNotification();
  const toast = useToast();

  // Calculate statistics with null checks
  const totalBooks = books?.length || 0;
  const totalCategories = categories?.length || 0;
  const lowStockBooks = books?.filter((book) => book.stock < 10)?.length || 0;
  const totalValue = books?.reduce(
    (sum, book) => sum + (book.price || 0) * (book.stock || 0),
    0
  ) || 0;

  // Check for low stock and send notifications
  useEffect(() => {
    if (!books || books.length === 0) return;
    
    const lowStockItems = books.filter((book) => book.stock < 5 && book.stock > 0);
    
    // Send notifications for critically low stock items (less than 5)
    lowStockItems.forEach((book) => {
      // Check if we've already notified about this book recently
      const lastNotified = localStorage.getItem(`lowStock_${book.id}`);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (!lastNotified || (now - parseInt(lastNotified)) > oneDay) {
        notifyLowStock(book.title, book.stock);
        
        // Also show admin toast for low stock
        if (toast) {
          toast.showAdminLowStock(book.title, book.stock);
        }
        
        localStorage.setItem(`lowStock_${book.id}`, now.toString());
      }
    });
  }, [books, notifyLowStock, toast]);

  // Define columns for the low stock books table
  const columns = [
    { id: "id", label: "Mã", sortable: false },
    { id: "title", label: "Tiêu Đề", sortable: false },
    { id: "author", label: "Tác Giả", sortable: false },
    { id: "stock", label: "Tồn Kho", sortable: false },
    { id: "price", label: "Giá", sortable: false },
  ];

  // Filter books with low stock
  const lowStockBooksData = books?.filter((book) => book.stock < 10) || [];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mt-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Bảng Điều Khiển</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="h-6 w-6" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          title="Tổng số sách"
          value={totalBooks}
        />

        <StatCard
          icon={<Tag className="h-6 w-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          title="Danh mục"
          value={totalCategories}
        />

        <StatCard
          icon={<AlertCircle className="h-6 w-6" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          title="Sắp hết hàng"
          value={lowStockBooks}
        />

        <StatCard
          icon={<DollarSign className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          title="Tổng giá trị"
          value={`$${totalValue.toFixed(2)}`}
        />
      </div>

      {/* Notification Test Panel */}
      <NotificationTestPanel />

      {/* Low Stock Alert */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Cảnh Báo Tồn Kho Thấp</h3>
        {lowStockBooksData.length > 0 ? (
          <Table
            columns={columns}
            data={lowStockBooksData}
            renderRow={(book) => (
              <tr
                key={book.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {book.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {book.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {typeof book.author === 'object' ? book.author?.name || 'Tác giả không xác định' : book.author || 'Tác giả không xác định'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    book.stock < 5 
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}>
                    {book.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ${(book.price || 0).toFixed(2)}
                </td>
              </tr>
            )}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p>Không có sách nào có tồn kho thấp.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
