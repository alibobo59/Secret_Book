import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBook } from "../../contexts/BookContext";
import { api } from "../../services/api";
import { Plus, Edit, Trash2 } from "lucide-react";

const BookManagement = () => {
  const { user, getToken, hasRole, loading: authLoading } = useAuth();
  const { books, categories, setBooks, authors, publishers } = useBook();
  const [form, setForm] = useState({
    title: "",
    published_year: "",
    category_id: "",
    author_id: "",
    publisher_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Check admin role on mount
  useEffect(() => {
    if (!authLoading && !hasRole(["admin"])) {
      setError("Only admins can manage books.");
    }
  }, [authLoading, hasRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasRole(["admin"])) {
      setError("Only admins can manage books.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Authentication token is missing. Please log in.");
      return;
    }

    try {
      const payload = {
        title: form.title,
        published_year: parseInt(form.published_year),
        category_id: parseInt(form.category_id),
        author_id: parseInt(form.author_id),
        publisher_id: parseInt(form.publisher_id),
      };
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      setValidationErrors({}); // Clear previous validation errors

      if (editingId) {
        const response = await api.put(`/books/${editingId}`, payload, config);
        setBooks(
          books.map((book) =>
            book.id === editingId ? response.data.data : book
          )
        );
        setEditingId(null);
      } else {
        const response = await api.post("/books", payload, config);
        setBooks([...books, response.data.data]);
      }

      // Reset form after successful submission
      setForm({
        title: "",
        published_year: "",
        category_id: "",
        author_id: "",
        publisher_id: "",
      });
      setError(null); // Clear any previous errors
    } catch (err) {
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.error || {});
        setError("Please correct the form errors.");
      } else {
        const message = err.response?.data?.error || "Failed to save book";
        setError(message);
      }
    }
  };

  const handleEdit = (book) => {
    if (!hasRole(["admin"])) {
      setError("Only admins can edit books.");
      return;
    }
    setForm({
      title: book.title,
      published_year: book.published_year?.toString() || "",
      category_id: book.category_id?.toString() || "",
      author_id: book.author_id?.toString() || "",
      publisher_id: book.publisher_id?.toString() || "",
    });
    setEditingId(book.id);
    setError(null); // Clear any previous errors
    setValidationErrors({});
  };

  const handleDelete = async (id) => {
    if (!hasRole(["admin"])) {
      setError("Only admins can delete books.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("Authentication token is missing. Please log in.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        await api.delete(`/books/${id}`, config);
        setBooks(books.filter((book) => book.id !== id));
        setError(null); // Clear any previous errors
      } catch (err) {
        const message = err.response?.data?.error || "Failed to delete book";
        setError(message);
      }
    }
  };

  if (authLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Book Management
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!hasRole(["admin"]) && !error && (
        <p className="text-red-500 mb-4">Only admins can manage books.</p>
      )}
      {hasRole(["admin"]) && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Book Title"
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 w-full"
              required
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm">
                {validationErrors.title[0]}
              </p>
            )}
          </div>
          <div>
            <input
              type="number"
              value={form.published_year}
              onChange={(e) =>
                setForm({ ...form, published_year: e.target.value })
              }
              placeholder="Published Year"
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 w-full"
              required
              min="1000"
              max={new Date().getFullYear()}
            />
            {validationErrors.published_year && (
              <p className="text-red-500 text-sm">
                {validationErrors.published_year[0]}
              </p>
            )}
          </div>
          <div>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 w-full"
              required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {validationErrors.category_id && (
              <p className="text-red-500 text-sm">
                {validationErrors.category_id[0]}
              </p>
            )}
          </div>
          <div>
            <select
              value={form.author_id}
              onChange={(e) => setForm({ ...form, author_id: e.target.value })}
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 w-full"
              required>
              <option value="">Select Author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            {validationErrors.author_id && (
              <p className="text-red-500 text-sm">
                {validationErrors.author_id[0]}
              </p>
            )}
          </div>
          <div>
            <select
              value={form.publisher_id}
              onChange={(e) =>
                setForm({ ...form, publisher_id: e.target.value })
              }
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 w-full"
              required>
              <option value="">Select Publisher</option>
              {publishers.map((publisher) => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </select>
            {validationErrors.publisher_id && (
              <p className="text-red-500 text-sm">
                {validationErrors.publisher_id[0]}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 md:col-span-2">
            {editingId ? "Update" : "Add"} Book
          </button>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Published Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Publisher
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {books.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {book.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {book.published_year || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {book.category?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {book.author?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {book.publisher?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleEdit(book)}
                    className="text-amber-600 hover:text-amber-800 mr-4"
                    disabled={!hasRole(["admin"])}>
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="text-red-600 hover:text-red-800"
                    disabled={!hasRole(["admin"])}>
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

export default BookManagement;
