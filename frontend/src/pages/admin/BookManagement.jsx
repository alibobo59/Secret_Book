import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Plus, Edit, Trash2 } from "lucide-react";

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    isbn: "",
    price: "",
    category_id: "",
    author_id: "",
    publisher_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, catRes, authRes, pubRes] = await Promise.all([
        api.get("/books"),
        api.get("/categories"),
        api.get("/authors"),
        api.get("/publishers"),
      ]);
      setBooks(booksRes.data);
      setCategories(catRes.data);
      setAuthors(authRes.data);
      setPublishers(pubRes.data);
    } catch (err) {
      setError("Failed to fetch data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        category_id: parseInt(form.category_id),
        author_id: parseInt(form.author_id),
        publisher_id: parseInt(form.publisher_id),
      };
      if (editingId) {
        const response = await api.put(`/books/${editingId}`, payload);
        setBooks(
          books.map((book) => (book.id === editingId ? response.data : book))
        );
        setEditingId(null);
      } else {
        const response = await api.post("/books", payload);
        setBooks([...books, response.data]);
      }
      setForm({
        title: "",
        isbn: "",
        price: "",
        category_id: "",
        author_id: "",
        publisher_id: "",
      });
    } catch (err) {
      setError("Failed to save book");
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      isbn: book.isbn,
      price: book.price.toString(),
      category_id: book.category_id.toString(),
      author_id: book.author_id.toString(),
      publisher_id: book.publisher_id.toString(),
    });
    setEditingId(book.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await api.delete(`/books/${id}`);
        setBooks(books.filter((book) => book.id !== id));
      } catch (err) {
        setError("Failed to delete book");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Book Management
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Book Title"
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required
        />
        <input
          type="text"
          value={form.isbn}
          onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          placeholder="ISBN"
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required
        />
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Price"
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required
          step="0.01"
        />
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={form.author_id}
          onChange={(e) => setForm({ ...form, author_id: e.target.value })}
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required>
          <option value="">Select Author</option>
          {authors.map((auth) => (
            <option key={auth.id} value={auth.id}>
              {auth.name}
            </option>
          ))}
        </select>
        <select
          value={form.publisher_id}
          onChange={(e) => setForm({ ...form, publisher_id: e.target.value })}
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required>
          <option value="">Select Publisher</option>
          {publishers.map((pub) => (
            <option key={pub.id} value={pub.id}>
              {pub.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 md:col-span-2">
          {editingId ? "Update" : "Add"} Book
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                ISBN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Price
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
                  {book.isbn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  ${book.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {book.category?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {book.author?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {book.publisher?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleEdit(book)}
                    className="text-amber-600 hover:text-amber-800 mr-4">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
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

export default BookManagement;
