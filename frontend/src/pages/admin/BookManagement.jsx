import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useBook } from "../../contexts/BookContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Trash2,
  Edit,
  Eye,
  Download,
  Settings,
  CheckSquare,
  Square,
  Search,
  X,
} from "lucide-react";
import { Loading } from "../../components/admin";
import { api } from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";
import axios from "axios";

const BookManagement = () => {
  const { user, getToken, hasRole } = useAuth();
  const { categories, authors, publishers } = useBook();
  const { loading: initialLoading } = useOutletContext();
  const navigate = useNavigate();

  // Component-specific state
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  // Filtering State
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    author_id: "",
    publisher_id: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Bulk operations state
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const queryFilters = useMemo(
    () => ({
      search: filters.search,
      category_id: filters.category_id,
      author_id: filters.author_id,
      publisher_id: filters.publisher_id,
    }),
    [filters]
  );

  // Define fetchBooks outside useEffect to avoid recreation on each render
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();

      // Filter out empty values to avoid sending empty strings as parameters
      const params = Object.fromEntries(
        Object.entries(queryFilters).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
      );

      const response = await api.get("/books", {
        params,
      });

      // Handle paginated response from Laravel
      if (response.data) {
        // Check if it's a paginated response (has data property with array)
        if (response.data.data && Array.isArray(response.data.data)) {
          setBooks(response.data.data);
        }
        // Check if it's a direct array response
        else if (Array.isArray(response.data)) {
          setBooks(response.data);
        } else {
          setError("Định dạng phản hồi không hợp lệ từ máy chủ.");
        }
      } else {
        setError("Không có dữ liệu từ máy chủ.");
      }
    } catch (err) {
      setError("Không thể tải danh sách sách.");
    } finally {
      setLoading(false);
    }
  }, [queryFilters, getToken]);

  useEffect(() => {
    // Check if user has admin or mod role
    const isAdminOrMod = hasRole(["admin", "mod"]);

    if (!user) {
      return;
    }

    if (!isAdminOrMod) {
      return;
    }

    fetchBooks();
  }, [fetchBooks, hasRole, user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearchTerm(value);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const applyFilters = () => {
    // The useEffect will handle the refetch
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category_id: "",
      author_id: "",
      publisher_id: "",
    });
    setSearchTerm("");
    // The useEffect will handle the refetch
  };

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
        // Refetch will be triggered by useEffect if we modify a dependency,
        // but in this case, we want to force a refetch of the current page.
        // A simple way is to have a 'refetch' state.
        // For now, let's just filter locally for responsiveness, though refetching is more robust.
        setBooks((prev) => prev.filter((book) => book.id !== id));
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

  // Bulk operations functions
  const handleSelectBook = (bookId) => {
    setSelectedBooks((prev) => {
      const newSelected = prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId];
      setShowBulkActions(newSelected.length > 0);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length && books.length > 0) {
      setSelectedBooks([]);
      setShowBulkActions(false);
    } else {
      setSelectedBooks(books.map((book) => book.id));
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (!hasRole(["admin"])) {
      setError("Chỉ quản trị viên mới có thể xóa sách.");
      return;
    }

    if (selectedBooks.length === 0) {
      setError("Vui lòng chọn sách để xóa.");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedBooks.length} sách? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }

    setBulkLoading(true);
    try {
      const response = await api.post(
        "/books/bulk-delete",
        {
          book_ids: selectedBooks,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Remove deleted books from local state
        setBooks((prev) =>
          prev.filter((book) => !selectedBooks.includes(book.id))
        );
        setSelectedBooks([]);
        setShowBulkActions(false);
        setError("");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi xóa sách.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkUpdate = () => {
    if (selectedBooks.length === 0) {
      setError("Vui lòng chọn sách để cập nhật.");
      return;
    }

    // Navigate to bulk update page with selected book IDs
    navigate("/admin/books/bulk-update", {
      state: { selectedBookIds: selectedBooks },
    });
  };

  const handleBulkExport = () => {
    if (selectedBooks.length === 0) {
      setError("Vui lòng chọn sách để xuất.");
      return;
    }

    const selectedBooksData = books.filter((book) =>
      selectedBooks.includes(book.id)
    );
    const csvContent = convertToCSV(selectedBooksData);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `books_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    const headers = [
      "ID",
      "Tiêu đề",
      "SKU",
      "Giá",
      "Tồn kho",
      "Danh mục",
      "Tác giả",
      "Nhà xuất bản",
      "Hình ảnh",
    ];
    const csvRows = [headers.join(",")];

    data.forEach((book) => {
      const row = [
        book.id,
        `"${book.title}"`,
        book.sku,
        book.price,
        book.stock_quantity,
        `"${book.category?.name || ""}"`,
        `"${book.author?.name || ""}"`,
        `"${book.publisher?.name || ""}"`,
        `"${book.image || ""}"`,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Quản Lý Sách
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!hasRole(["admin", "mod"]) && !error && (
        <p className="text-red-500 mb-4">
          Chỉ quản trị viên hoặc điều hành viên mới có thể quản lý sách.
        </p>
      )}
      {hasRole(["admin", "mod"]) && (
        <>
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <input
                  type="text"
                  name="search"
                  value={searchTerm}
                  onChange={handleFilterChange}
                  placeholder="Tìm kiếm theo tiêu đề hoặc SKU..."
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <select
                  name="category_id"
                  value={filters.category_id}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200">
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  name="author_id"
                  value={filters.author_id}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200">
                  <option value="">Tất cả tác giả</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  name="publisher_id"
                  value={filters.publisher_id}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200">
                  <option value="">Tất cả nhà xuất bản</option>
                  {publishers.map((pub) => (
                    <option key={pub.id} value={pub.id}>
                      {pub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={resetFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                Reset
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/books/create")}
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
                Thêm Sách Mới
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tổng số {books.length} sách
              </div>
            </div>

            {showBulkActions && (
              <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Đã chọn {selectedBooks.length} sách
                </span>
                <button
                  onClick={handleBulkUpdate}
                  disabled={bulkLoading}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1">
                  <Settings size={14} />
                  <span>Cập Nhật Hàng Loạt</span>
                </button>
                <button
                  onClick={handleBulkExport}
                  disabled={bulkLoading}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1">
                  <Download size={14} />
                  <span>Xuất</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1">
                  <Trash2 size={14} />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={handleSelectAll}
                      className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100">
                      {selectedBooks.length === books.length &&
                      books.length > 0 ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Hình ảnh
                  </th>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10">
                      <Loading />
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-10 text-gray-500 dark:text-gray-400">
                      Không tìm thấy sách nào.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr
                      key={book.id}
                      className={`hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                        selectedBooks.includes(book.id)
                          ? "bg-blue-50 dark:bg-blue-900"
                          : ""
                      }`}>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectBook(book.id)}
                          className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100">
                          {selectedBooks.includes(book.id) ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td
                         className="px-6 py-4 whitespace-nowrap cursor-pointer"
                         onClick={() => handleViewDetail(book.id)}>
                         {book.image ? (
                           <img
                             src={getImageUrl(book.image)}
                             alt={book.title}
                             className="h-12 w-12 object-cover rounded-md"
                             onError={(e) => {
                               // Prevent infinite loop by checking if we're already showing placeholder
                               if (!e.target.dataset.fallback) {
                                 e.target.dataset.fallback = 'true';
                                 e.target.src = '/placeholder-book.svg';
                               } else {
                                 // If placeholder also fails, replace with div
                                 const placeholder = document.createElement('div');
                                 placeholder.className = 'h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center';
                                 placeholder.innerHTML = '<span class="text-xs text-gray-500 dark:text-gray-400">Không có ảnh</span>';
                                 e.target.parentElement.replaceChild(placeholder, e.target);
                               }
                             }}
                           />
                         ) : (
                           <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                             <span className="text-xs text-gray-500 dark:text-gray-400">Không có ảnh</span>
                           </div>
                         )}
                       </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 cursor-pointer"
                        onClick={() => handleViewDetail(book.id)}>
                        {book.title}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 cursor-pointer"
                        onClick={() => handleViewDetail(book.id)}>
                        {book.sku || "Không có"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 cursor-pointer"
                        onClick={() => handleViewDetail(book.id)}>
                        {(book.price || 0).toLocaleString('vi-VN')} VND
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 cursor-pointer"
                        onClick={() => handleViewDetail(book.id)}>
                        {book.stock_quantity || 0}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 cursor-pointer"
                        onClick={() => handleViewDetail(book.id)}>
                        {book.category?.name || "Không xác định"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 cursor-pointer"
                        onClick={() => handleViewDetail(book.id)}>
                        {book.author?.name || "Không xác định"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right text-sm"
                        onClick={(e) => e.stopPropagation()}>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default BookManagement;
