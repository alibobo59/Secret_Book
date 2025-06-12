import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBook } from "../../contexts/BookContext";
import { api } from "../../services/api";
import { Loading } from "../../components/admin";

const BookEdit = () => {
  const { loading, error, setError } = useOutletContext();
  const { user, getToken, hasRole } = useAuth();
  const { id } = useParams();
  const { books, categories, authors, publishers, setBooks } = useBook();
  const [form, setForm] = useState({
    title: "",
    published_year: "",
    category_id: "",
    author_id: "",
    publisher_id: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    setLocalLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication token is missing. Please log in.");
        return;
      }
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await api.get(`/books/${id}`, config);
      console.log("API Response for Edit:", response.data);
      const bookData = response.data.data || response.data;
      setForm({
        title: bookData.title || "",
        published_year: bookData.published_year?.toString() || "",
        category_id: bookData.category_id?.toString() || "",
        author_id: bookData.author_id?.toString() || "",
        publisher_id: bookData.publisher_id?.toString() || "",
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch book: " + (err.message || err));
      console.error("Fetch error:", err);
      setForm({
        title: "",
        published_year: "",
        category_id: "",
        author_id: "",
        publisher_id: "",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasRole(["admin"])) {
      setError("Only admins can edit books.");
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

      setValidationErrors({});

      const response = await api.put(`/books/${id}`, payload, config);
      setBooks(
        books.map((book) =>
          book.id === parseInt(id) ? response.data.data : book
        )
      );
      setError(null);
      navigate("/admin/books");
    } catch (err) {
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.error || {});
        setError("Please correct the form errors.");
      } else {
        const message = err.response?.data?.error || "Failed to update book";
        setError(message);
      }
    } finally {
      setLocalLoading(false);
    }
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
        Edit Book
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!hasRole(["admin"]) && !error && (
        <p className="text-red-500 mb-4">Only admins can edit books.</p>
      )}
      {hasRole(["admin"]) && (
        <>
          {localLoading && <Loading />}
          {!localLoading && (
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
                  onChange={(e) =>
                    setForm({ ...form, author_id: e.target.value })
                  }
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
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 md:col-span-2"
                disabled={localLoading}>
                Update Book
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default BookEdit;
