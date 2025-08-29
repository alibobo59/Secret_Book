import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../../services/api";
import Loading from "../../components/admin/Loading";

const AuthorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuthor();
  }, [id]);

  const fetchAuthor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/authors/${id}`);
      setAuthor(response.data);
    } catch (err) {
      setError("Failed to fetch author details");
      console.error("Error fetching author:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!author) return <div className="text-gray-600 p-4">Author not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/admin/authors")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{author.name}</h1>
        </div>

        {/* Author Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Author Information</h2>
          <p><strong>ID:</strong> {author.id}</p>
          <p className="mt-2"><strong>Biography:</strong> {author.bio || "No biography available"}</p>
        </div>
      </div>
    </div>
  );
};
useEffect(() => {
    fetchAuthor();
  }, [id]);

  const fetchAuthor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/authors/${id}`);
      setAuthor(response.data);
    } catch (err) {
      setError("Failed to fetch author details");
      console.error("Error fetching author:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/authors/${id}`);
      navigate("/admin/authors", {
        state: { message: "Author deleted successfully" },
      });
    } catch (err) {
      console.error("Error deleting author:", err);
      alert("Failed to delete author");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!author) return <div className="text-gray-600 p-4">Author not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/admin/authors")}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
              <p className="text-gray-600 mt-1">Author Details</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/admin/authors/${id}/edit`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "audit"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Audit Logs
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Author Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Author Information</h2>
                <p><strong>ID:</strong> {author.id}</p>
                <p className="mt-2"><strong>Biography:</strong> {author.bio || "No biography available"}</p>
              </div>

              {/* Books */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-semibold flex items-center mb-4">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Books by {author.name}
                </h2>
                {author.books && author.books.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {author.books.map((book) => (
                      <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                        <div className="flex items-start space-x-3">
                          {book.image_url && (
                            <img src={book.image_url} alt={book.title} className="w-16 h-20 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{book.title}</h3>
                            <p className="text-sm text-gray-600">{book.sku}</p>
                            <p className="text-sm text-green-600 font-medium">${book.price}</p>
                            <Link to={`/admin/books/${book.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                              View Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No books found for this author.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <p>Total Books: {author.books ? author.books.length : 0}</p>
                <p>Author ID: #{author.id}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timestamps
                </h3>
                <p>Created: {new Date(author.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(author.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <AuditLogTable modelType="Author" modelId={id} className="mt-6" />
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-6">Are you sure you want to delete "{author.name}"? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Author Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Author Information</h2>
                <p><strong>ID:</strong> {author.id}</p>
                <p className="mt-2"><strong>Biography:</strong> {author.bio || "No biography available"}</p>
              </div>

              {/* Books */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-semibold flex items-center mb-4">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Books by {author.name}
                </h2>
                {author.books && author.books.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {author.books.map((book) => (
                      <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                        <div className="flex items-start space-x-3">
                          {book.image_url && (
                            <img src={book.image_url} alt={book.title} className="w-16 h-20 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{book.title}</h3>
                            <p className="text-sm text-gray-600">{book.sku}</p>
                            <p className="text-sm text-green-600 font-medium">${book.price}</p>
                            <Link to={`/admin/books/${book.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                              View Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No books found for this author.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <p>Total Books: {author.books ? author.books.length : 0}</p>
                <p>Author ID: #{author.id}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timestamps
                </h3>
                <p>Created: {new Date(author.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(author.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <AuditLogTable modelType="Author" modelId={id} className="mt-6" />
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-6">Are you sure you want to delete "{author.name}"? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

export default AuthorDetail;