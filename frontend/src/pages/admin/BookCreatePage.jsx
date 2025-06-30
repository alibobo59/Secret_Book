import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBook } from '../../contexts/BookContext';
import { useChangelog } from '../../contexts/ChangelogContext';
import { useToast } from '../../contexts/ToastContext';
import { PageHeader, FormField } from '../../components/admin';
import VariationManager from '../../components/variations/VariationManager';
import {
  ArrowLeft,
  Save,
  Upload,
  Image,
  AlertCircle,
  Package,
} from 'lucide-react';

const BookCreatePage = () => {
  const navigate = useNavigate();
  const { categories, addBook } = useBook();
  const { addChangelogEntry } = useChangelog();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    isbn: '',
    published_date: '',
    cover_image: '',
    pages: '',
    language: 'English',
    format: 'Paperback',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdBookId, setCreatedBookId] = useState(null);
  const [variations, setVariations] = useState([]);

  const tabs = [
    { id: 'basic', label: 'Thông Tin Cơ Bản', icon: Package },
    { id: 'variations', label: 'Biến Thể', icon: Package, disabled: !createdBookId },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Tiêu đề là bắt buộc';
    if (!formData.author.trim()) newErrors.author = 'Tác giả là bắt buộc';
    if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
    if (!formData.price || parseInt(formData.price) <= 0) newErrors.price = 'Giá hợp lệ là bắt buộc';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Số lượng tồn kho hợp lệ là bắt buộc';
    if (!formData.category_id) newErrors.category_id = 'Danh mục là bắt buộc';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN là bắt buộc';
    if (!formData.published_date) newErrors.published_date = 'Publication date is required';
    if (!formData.cover_image.trim()) newErrors.cover_image = 'Cover image URL is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.showError('Lỗi Xác Thực', 'Vui lòng sửa các lỗi trong biểu mẫu trước khi gửi.');
      return;
    }
    
    setLoading(true);
    try {
      const bookData = {
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
        pages: formData.pages ? parseInt(formData.pages) : null,
      };
      
      const newBook = await addBook(bookData);
      setCreatedBookId(newBook.id);
      
      // Add changelog entry
      addChangelogEntry(
        'book',
        newBook.id,
        'create',
        `Created new book: ${newBook.title}`,
        null,
        newBook
      );
      
      // Show success toast
      toast.showSuccess(
        'Tạo Sách Thành Công',
        `"${newBook.title}" đã được thêm vào kho.`,
        {
          actionText: 'Xem Sách',
          actionUrl: `/admin/books/${newBook.id}`,
        }
      );
      
      // Switch to variations tab
      setActiveTab('variations');
    } catch (error) {
      console.error('Failed to create book:', error);
      toast.showError('Tạo Thất Bại', 'Không thể tạo sách. Vui lòng thử lại.');
      setErrors({ submit: 'Không thể tạo sách. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFinish = () => {
    if (createdBookId) {
      navigate(`/admin/books/${createdBookId}`);
    } else {
      navigate('/admin/books');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/books')}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHeader title="Tạo Sách Mới" hideAddButton />
      </div>

      {/* Progress Indicator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isCompleted = tab.id === 'basic' && createdBookId;
            const isDisabled = tab.disabled;
            
            return (
              <div key={tab.id} className="flex items-center">
                <button
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
                      : isCompleted
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                      : isDisabled
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                  {isCompleted && <span className="text-xs">✓</span>}
                </button>
                {index < tabs.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Alert */}
            {errors.submit && (
              <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
                <AlertCircle className="w-5 h-5 mr-2" />
                {errors.submit}
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Tiêu Đề"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  required
                />
                <FormField
                  label="Tác Giả"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  error={errors.author}
                  required
                />
                <div className="md:col-span-2">
                  <FormField
                    label="Mô Tả"
                    type="textarea"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    error={errors.description}
                    required
                    inputProps={{ rows: 4 }}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Pricing & Inventory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Giá ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  error={errors.price}
                  required
                />
                <FormField
                  label="Tồn Kho"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  error={errors.stock}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Danh Mục <span className="text-red-500">*</span>
                </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white ${
                      errors.category_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.category_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Publication Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Publication Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="ISBN"
                  value={formData.isbn}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
                  error={errors.isbn}
                  required
                />
                <FormField
                  label="Ngày Xuất Bản"
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => handleInputChange('published_date', e.target.value)}
                  error={errors.published_date}
                  required
                />
                <FormField
                  label="Pages"
                  type="number"
                  min="1"
                  value={formData.pages}
                  onChange={(e) => handleInputChange('pages', e.target.value)}
                  error={errors.pages}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngôn Ngữ
                </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Italian">Italian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày Xuất Bản
                </label>
                  <select
                    value={formData.format}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Paperback">Paperback</option>
                    <option value="Hardcover">Hardcover</option>
                    <option value="eBook">eBook</option>
                    <option value="Audiobook">Audiobook</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Cover Image
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    label="Cover Image URL"
                    value={formData.cover_image}
                    onChange={(e) => handleInputChange('cover_image', e.target.value)}
                    error={errors.cover_image}
                    placeholder="https://example.com/book-cover.jpg"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter a direct URL to the book cover image
                  </p>
                </div>
                <div>
                  {formData.cover_image && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Preview
                      </label>
                      <div className="w-32 h-40 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <img
                          src={formData.cover_image}
                          alt="Xem Trước Bìa Sách"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" style={{ display: 'none' }}>
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/books')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Đang Tạo...' : 'Tạo Sách'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'variations' && createdBookId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <VariationManager
            bookId={createdBookId}
            bookTitle={formData.title}
            mainBookImage={formData.cover_image}
            onVariationsChange={setVariations}
          />
          
          {/* Finish Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Hoàn Thành & Xem Sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCreatePage;