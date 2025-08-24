import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBook } from '../../contexts/BookContext';
import { ArrowLeft, Save, X } from 'lucide-react';
import { api } from '../../services/api';

const BulkUpdateBooks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken, hasRole } = useAuth();
  const { books, categories, authors, publishers, setBooks } = useBook();
  
  const selectedBookIds = location.state?.selectedBookIds || [];
  const selectedBooksData = books.filter(book => selectedBookIds.includes(book.id));
  
  const [booksData, setBooksData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!hasRole(['admin'])) {
      setError('Bạn không có quyền truy cập trang này.');
      navigate('/admin');
    }
    
    if (selectedBookIds.length === 0) {
      navigate('/admin/books');
    }

    // Initialize form data for each selected book
    const initialData = {};
    selectedBooksData.forEach(book => {
      initialData[book.id] = {
        title: book.title || '',
        sku: book.sku || '',
        description: book.description || '',
        price: book.price || '',
        stock_quantity: book.stock_quantity || '',
        category_id: book.category_id || '',
        author_id: book.author_id || '',
        publisher_id: book.publisher_id || ''
      };
    });
    setBooksData(initialData);
  }, [hasRole, selectedBookIds.length, navigate, selectedBooksData]);

  if (!selectedBookIds || selectedBookIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Cập Nhật Hàng Loạt Sách
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Không có sách nào được chọn để cập nhật hàng loạt. Vui lòng quay lại trang quản lý sách và chọn sách để cập nhật.
            </p>
            <button
              onClick={() => navigate('/admin/books')}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Quay Lại Quản Lý Sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (bookId, field, value) => {
    setBooksData(prev => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasRole(['admin'])) {
      setError('Chỉ quản trị viên mới có thể cập nhật hàng loạt.');
      return;
    }

    // Prepare updates for each book
    const bookUpdates = [];
    Object.entries(booksData).forEach(([bookId, bookData]) => {
      // Filter out empty values for each book
      const updates = Object.fromEntries(
        Object.entries(bookData).filter(([key, value]) => value !== '' && value !== null)
      );
      
      if (Object.keys(updates).length > 0) {
        bookUpdates.push({
          id: parseInt(bookId),
          updates: updates
        });
      }
    });

    if (bookUpdates.length === 0) {
      setError('Vui lòng cung cấp ít nhất một trường để cập nhật cho ít nhất một cuốn sách.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/books/bulk-update', {
        books: bookUpdates
      }, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSuccess(`Đã cập nhật thành công ${bookUpdates.length} sách.`);
        setError('');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/admin/books');
        }, 2000);
      }
    } catch (err) {
      console.error('Bulk update error:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật sách.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/books');
  };

  if (!hasRole(['admin'])) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <p className="text-red-500">Chỉ quản trị viên mới có thể truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Cập Nhật Hàng Loạt ({selectedBookIds.length} đã chọn)
          </h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Chỉnh Sửa Từng Sách ({selectedBooksData.length} sách)
          </h3>
          
          {selectedBooksData.map(book => (
            <div key={book.id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {book.title}
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {book.id} | SKU: {book.sku}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiêu Đề
                  </label>
                  <input
                    type="text"
                    value={booksData[book.id]?.title || ''}
                    onChange={(e) => handleInputChange(book.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-gray-200"
                    placeholder="Nhập tiêu đề sách"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={booksData[book.id]?.sku || ''}
                    onChange={(e) => handleInputChange(book.id, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-gray-200"
                    placeholder="Nhập mã SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={booksData[book.id]?.price || ''}
                    onChange={(e) => handleInputChange(book.id, 'price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-gray-200"
                    placeholder="Nhập giá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số Lượng Tồn Kho
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={booksData[book.id]?.stock_quantity || ''}
                    onChange={(e) => handleInputChange(book.id, 'stock_quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-gray-200"
                    placeholder="Nhập số lượng tồn kho"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Danh Mục
                  </label>
                  <select
                    value={booksData[book.id]?.category_id || ''}
                    onChange={(e) => handleInputChange(book.id, 'category_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-gray-200"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tác Giả
                  </label>
                  <select
                    value={booksData[book.id]?.author_id || ''}
                    onChange={(e) => handleInputChange(book.id, 'author_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-gray-200"
                  >
                    <option value="">Chọn tác giả</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nhà Xuất Bản
                  </label>
                  <select
                    value={booksData[book.id]?.publisher_id || ''}
                    onChange={(e) => handleInputChange(book.id, 'publisher_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-gray-200"
                  >
                    <option value="">Chọn nhà xuất bản</option>
                    {publishers.map(publisher => (
                      <option key={publisher.id} value={publisher.id}>
                        {publisher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô Tả
                </label>
                <textarea
                  rows={3}
                  value={booksData[book.id]?.description || ''}
                  onChange={(e) => handleInputChange(book.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-600 dark:text-gray-200"
                  placeholder="Nhập mô tả sách"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <X size={18} />
            <span>Hủy</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save size={18} />
            <span>{loading ? 'Đang cập nhật...' : 'Cập Nhật Sách'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkUpdateBooks;