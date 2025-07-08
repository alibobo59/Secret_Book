import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../services/api";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Loading } from "../../components/admin";

const AuthorManagement = () => {
  const { loading: authLoading, user, hasRole } = useOutletContext(); // authLoading from AdminLayout
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState({ name: "", bio: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false); // Separate loading state for data fetching

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLocalLoading(true); // Start local loading for fetch
    try {
      const response = await api.get("/authors");
      console.log("API Response:", response.data);
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from API");
      }
      setAuthors(data);
      setError(null); // Clear error on success
    } catch (err) {
      setError("Không thể tải danh sách tác giả: " + (err.message || err));
      console.error("Fetch error:", err);
      setAuthors([]); // Fallback to empty array
    } finally {
      setLocalLoading(false); // Stop local loading immediately
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true); // Start local loading for submit
    try {
      if (editingId) {
        const response = await api.put(`/authors/${editingId}`, form);
        setAuthors(
          authors.map((auth) => (auth.id === editingId ? response.data : auth))
        );
        setEditingId(null);
      } else {
        const response = await api.post("/authors", form);
        setAuthors([...authors, response.data]);
      }
      setForm({ name: "", bio: "" });
      setError(null); // Clear error on success
    } catch (err) {
      setError("Không thể lưu tác giả: " + (err.message || err));
      console.error("Save error:", err);
    } finally {
      setLocalLoading(false); // Stop local loading immediately
    }
  };

  const handleEdit = (author) => {
    setForm({ name: author.name, bio: author.bio || "" });
    setEditingId(author.id);
    setError(null); // Clear error
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tác giả này không?")) {
      setLocalLoading(true); // Start local loading for delete
      try {
        await api.delete(`/authors/${id}`);
        setAuthors(authors.filter((auth) => auth.id !== id));
        setError(null); // Clear error on success
      } catch (err) {
        setError("Không thể xóa tác giả: " + (err.message || err));
        console.error("Delete error:", err);
      } finally {
        setLocalLoading(false); // Stop local loading immediately
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Quản Lý Tác Giả
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
        {!hasRole(["admin"]) && !error && (
          <p className="text-red-500 mb-4">Chỉ quản trị viên mới có thể quản lý tác giả.</p>
        )}
      {(hasRole(["admin"]) || authLoading) && (
        <>
          {localLoading && <Loading />} {/* Local loading only */}
          {!localLoading && (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tên tác giả"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
              />
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tiểu sử tác giả"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
              />
              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                disabled={localLoading}>
                {editingId ? "Cập Nhật" : "Thêm"} Tác Giả
              </button>
            </form>
          )}
          {!localLoading && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Tiểu sử
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {authors.map((author) => (
                    <tr key={author.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {author.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {author.bio || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleEdit(author)}
                          className="text-amber-600 hover:text-amber-800 mr-4"
                          disabled={localLoading}>
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(author.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={localLoading}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuthorManagement;
