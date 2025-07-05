import React, { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useBook } from "../../contexts/BookContext";
import { useAuth } from "../../contexts/AuthContext";
import { Trash2, Edit, Eye } from "lucide-react";
import { Loading } from "../../components/admin";
import { api } from "../../services/api";

const BookManagement = () => {
  const { user, getToken, hasRole } = useAuth();
  const { books, categories, setBooks, authors, publishers } = useBook();
  const { loading, error, setError } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRole(["admin"])) {
      setError("Chỉ quản trị viên mới có thể quản lý sách.");
    }
  }, [hasRole, setError]);

  const handleDelete = async (id) => {
    if (!hasRole(["admin"])) {
      setError("Chỉ quản trị viên mới có thể xóa sách.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("Thiếu token xác thực. Vui lòng đăng nhập.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        await api.delete(`/books/${id}`, config);
        setBooks(books.filter((book) => book.id !== id));
        setError(null);
      } catch (err) {
        const message = err.response?.data?.error || "Không thể xóa sách";
        setError(message);
      }
    }
  };

  const handleEdit = (id) => {
    if (!hasRole(["admin"])) {
      setError("Chỉ quản trị viên mới có thể chỉnh sửa sách.");
      return;
    }
    navigate(`/admin/books/edit/${id}`);
  };

  const handleViewDetail = (id) => {
    navigate(`/admin/books/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Quản Lý Sách
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!hasRole(["admin"]) && !error && (
        <p className="text-red-500 mb-4">Chỉ quản trị viên mới có thể quản lý sách.</p>
      )}
      {hasRole(["admin"]) && (
        <>
          <button
            onClick={() => navigate("/admin/books/create")}
            className="mb-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
            Thêm Sách Mới
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Mã SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {book.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {book.sku || "Không có"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      ${book.price || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {book.stock_quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {book.category?.name || "Không xác định"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleViewDetail(book.id)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                        title="Xem Chi Tiết">
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(book.id)}
                        className="text-amber-600 hover:text-amber-800 mr-4"
                        disabled={!hasRole(["admin"])}
                        title="Chỉnh Sửa Sách">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={!hasRole(["admin"])}
                        title="Xóa Sách">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default BookManagement;
