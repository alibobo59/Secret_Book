import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Plus, Edit, Trash2 } from "lucide-react";

const AuthorManagement = () => {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState({ name: "", bio: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await api.get("/authors");
      setAuthors(response.data);
    } catch (err) {
      setError("Failed to fetch authors");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      setError("Failed to save author");
    }
  };

  const handleEdit = (author) => {
    setForm({ name: author.name, bio: author.bio || "" });
    setEditingId(author.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this author?")) {
      try {
        await api.delete(`/authors/${id}`);
        setAuthors(authors.filter((auth) => auth.id !== id));
      } catch (err) {
        setError("Failed to delete author");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Author Management
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Author Name"
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required
        />
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Author Bio"
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
        />
        <button
          type="submit"
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
          {editingId ? "Update" : "Add"} Author
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Bio
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
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
                    className="text-amber-600 hover:text-amber-800 mr-4">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(author.id)}
                    className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorManagement;
