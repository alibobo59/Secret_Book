import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useBook } from "../../contexts/BookContext";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft, Edit, Trash2, Calendar, User, Building, Tag, DollarSign, Package, FileText, Activity, Hash } from "lucide-react";
import { api } from "../../services/api";
import Loading from "../../components/admin/Loading";
import AuditLogTable from "../../components/admin/AuditLogTable";
import { getImageUrl } from "../../utils/imageUtils";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, setBooks } = useBook();
  const { hasRole, getToken } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to find the book in the existing books array
        const existingBook = books.find(b => b.id === parseInt(id));
        if (existingBook) {
          setBook(existingBook);
          setLoading(false);
          return;
        }

        // If not found, fetch from API
        const response = await api.get(`/books/${id}`);
        setBook(response.data.data);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sách:", err);
        setError(err.response?.data?.error || "Không thể tải chi tiết sách");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetail();
    }
  }, [id, books]);

  const handleEdit = () => {
    if (!hasRole(["admin"])) {
      setError("Chỉ quản trị viên mới có thể chỉnh sửa sách.");
      return;
    }
    navigate(`/admin/books/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!hasRole(["admin"])) {
      setError("Chỉ quản trị viên mới có thể xóa sách.");
      return;
    }
    
    const token = getToken();
    if (!token) {
      setError("Thiếu token xác thực. Vui lòng đăng nhập.");
      return;
    }

    try {
      setDeleting(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await api.delete(`/books/${id}`, config);
      setBooks(books.filter((book) => book.id !== parseInt(id)));
      navigate("/admin/books", { 
        state: { message: 'Xóa sách thành công' } 
      });
    } catch (err) {
      const message = err.response?.data?.error || "Không thể xóa sách";
      setError(message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStockStatusColor = (quantity) => {
    if (quantity === 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (quantity < 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getStockStatusText = (quantity) => {
    if (quantity === 0) return 'Hết hàng';
    if (quantity < 10) return 'Sắp hết hàng';
    return 'Còn hàng';
  };

  const handleBack = () => {
    navigate("/admin/books");
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-amber-600 hover:text-amber-800 mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại danh sách sách
          </button>
        </div>
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-amber-600 hover:text-amber-800 mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại danh sách sách
          </button>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-center">
          <p>Không tìm thấy sách</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
                  {book.stock_quantity !== undefined && (
                    <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(book.stock_quantity)}`}>
                      {getStockStatusText(book.stock_quantity)}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Chi tiết sách</p>
              </div>
            </div>
            {hasRole(["admin"]) && (
              <div className="flex space-x-3">
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Chi tiết
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Kiểm tra Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Book Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Thông tin sách</h2>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Book Image */}
                  {(book.cover_image || book.image) && (
                    <div className="flex-shrink-0">
                      <img
                        src={getImageUrl(book.cover_image || book.image)}
                        alt={book.title}
                        className="w-48 h-64 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  
                  {/* Book Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiêu đề
                  </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">{book.title}</p>
                    </div>
                    {book.sku && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Mã SKU
                    </label>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">{book.sku}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Tác giả
                  </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        {book.author ? (
                          <Link
                            to={`/admin/authors/${book.author.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {book.author.name}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Nhà xuất bản
                  </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        {book.publisher ? (
                          <Link
                            to={`/admin/publishers/${book.publisher.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {book.publisher.name}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    Danh mục
                  </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        {book.category ? (
                          <Link
                            to={`/admin/categories/${book.category.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {book.category.name}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                    {book.price && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Giá
                    </label>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md font-semibold text-green-600 dark:text-green-400">
                          ${book.price}
                        </p>
                      </div>
                    )}
                    {book.stock_quantity !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          Số lượng tồn kho
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(book.stock_quantity)}`}>
                            {book.stock_quantity} đơn vị
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mã sách
                  </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">#{book.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mô tả</h2>
                  <div className="prose max-w-none text-gray-700 dark:text-gray-300 leading-relaxed" 
                       dangerouslySetInnerHTML={{ __html: book.description }}>
                  </div>
                </div>
              )}

              {/* Book Variations */}
              {book.variations && book.variations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Biến thể sách</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {book.variations.map((variation, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {variation.type || `Biến thể ${index + 1}`}
                          </span>
                          {variation.price && (
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              ${variation.price}
                            </span>
                          )}
                        </div>
                        {variation.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {variation.description}
                          </p>
                        )}
                        {variation.stock_quantity !== undefined && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tồn kho: {variation.stock_quantity} đơn vị
                          </p>
                        )}
                        {variation.image && (
                          <img
                            src={getImageUrl(variation.image)}
                            alt={`Biến thể ${index + 1}`}
                            className="w-16 h-16 object-cover rounded mt-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thống kê nhanh</h3>
                <div className="space-y-4">
                  {book.price && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Giá hiện tại</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">${book.price}</span>
                    </div>
                  )}
                  {book.stock_quantity !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Tồn kho</span>
                      <span className={`font-semibold ${
                        book.stock_quantity === 0 ? 'text-red-600 dark:text-red-400' :
                        book.stock_quantity < 10 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {book.stock_quantity} đơn vị
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Mã sách</span>
                    <span className="font-semibold text-gray-900 dark:text-white">#{book.id}</span>
                  </div>
                  {book.published_year && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Năm xuất bản</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{book.published_year}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thông tin liên quan</h3>
                <div className="space-y-4">
                  {book.author && (
                    <div>
                      <span className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tác giả</span>
                      <Link
                        to={`/admin/authors/${book.author.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        {book.author.name} →
                      </Link>
                    </div>
                  )}
                  {book.publisher && (
                    <div>
                      <span className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Nhà xuất bản</span>
                      <Link
                        to={`/admin/publishers/${book.publisher.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        {book.publisher.name} →
                      </Link>
                    </div>
                  )}
                  {book.category && (
                    <div>
                      <span className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Danh mục</span>
                      <Link
                        to={`/admin/categories/${book.category.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        {book.category.name} →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Thời gian
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm text-gray-600 dark:text-gray-400">Ngày tạo</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(book.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600 dark:text-gray-400">Cập nhật lần cuối</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(book.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditLogTable 
            modelType="Book" 
            modelId={id}
            className="mt-6"
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Xác nhận xóa
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Bạn có chắc chắn muốn xóa sách "{book.title}" không? Hành động này không thể hoàn tác và cũng sẽ xóa nó khỏi các đơn hàng hiện có.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={deleting}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;