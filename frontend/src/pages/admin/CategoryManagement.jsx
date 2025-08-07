import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Plus, Edit, Trash2 } from "lucide-react";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/categories");
      console.log("Categories raw response:", response.data); // Debug log
      // Unwrap data property if present, fallback to response.data or empty array
      const categoriesData = Array.isArray(response.data.data)
        ? response.data.data
        : response.data || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError("Không thể tải danh sách danh mục.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        const response = await api.put(`/categories/${editingId}`, form);
        setCategories(
          categories.map((cat) => (cat.id === editingId ? response.data : cat))
        );
        setSuccess("Cập nhật danh mục thành công.");
        setEditingId(null);
      } else {
        const response = await api.post("/categories", form);
        setCategories([...categories, response.data]);
        setSuccess("Thêm danh mục thành công.");
      }
      setForm({ name: "" });
    } catch (err) {
      setError("Không thể lưu danh mục.");
    }
  };

  const handleEdit = (category) => {
    setForm({ name: category.name });
    setEditingId(category.id);
    setSuccess(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      setError(null);
      setSuccess(null);
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter((cat) => cat.id !== id));
        setSuccess("Xóa danh mục thành công.");
      } catch (err) {
        setError("Không thể xóa danh mục.");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Quản Lý Danh Mục
      </h2>
      {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-500 dark:text-green-400 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            placeholder="Tên Danh Mục"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-amber-600 dark:bg-amber-700 text-white px-4 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-800 flex items-center gap-2">
            {editingId ? "Cập Nhật" : "Thêm"} Danh Mục
          </button>
        </div>
      </form>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Đang tải danh mục...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Không tìm thấy danh mục nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Tên Danh Mục
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map(
                (
                  category // Removed ?. since we ensure it's an array
                ) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 mr-4">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
