import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Building, BookOpen, Calendar, Activity, MapPin } from "lucide-react";
import { api } from "../../services/api";
import Loading from "../../components/admin/Loading";
import AuditLogTable from "../../components/admin/AuditLogTable";

const PublisherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchPublisher();
  }, [id]);

  const fetchPublisher = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/publishers/${id}`);
      setPublisher(response.data);
    } catch (err) {
      setError('Failed to fetch publisher details');
      console.error('Error fetching publisher:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/publishers/${id}`);
      navigate('/admin/publishers', { 
        state: { message: 'Publisher deleted successfully' } 
      });
    } catch (err) {
      console.error('Error deleting publisher:', err);
      alert('Failed to delete publisher');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!publisher) return <div className="text-gray-600 p-4">Publisher not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/publishers')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{publisher.name}</h1>
                <p className="text-gray-600 mt-1">Publisher Details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/admin/publishers/${id}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building className="w-4 h-4 inline mr-2" />
                Details
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Audit Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Publisher Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Publisher Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{publisher.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{publisher.id}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Address
                  </label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-md min-h-[100px]">
                    {publisher.address || 'No address available'}
                  </div>
                </div>
              </div>

              {/* Books by this Publisher */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Books by {publisher.name}
                </h2>
                {publisher.books && publisher.books.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publisher.books.map((book) => (
                      <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          {book.image && (
                            <img
                              src={book.image_url}
                              alt={book.title}
                              className="w-16 h-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{book.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{book.sku}</p>
                            <p className="text-sm text-green-600 font-medium mt-1">
                              ${book.price}
                            </p>
                            <Link
                              to={`/admin/books/${book.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                            >
                              View Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No books found for this publisher.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Books</span>
                    <span className="font-semibold text-gray-900">
                      {publisher.books ? publisher.books.length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Publisher ID</span>
                    <span className="font-semibold text-gray-900">#{publisher.id}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Contact Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm text-gray-600">Publisher Name</span>
                    <span className="text-gray-900">{publisher.name}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Address</span>
                    <span className="text-gray-900">
                      {publisher.address || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timestamps
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm text-gray-600">Created</span>
                    <span className="text-gray-900">
                      {new Date(publisher.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Last Updated</span>
                    <span className="text-gray-900">
                      {new Date(publisher.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditLogTable 
            modelType="Publisher" 
            modelId={id}
            className="mt-6"
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{publisher.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublisherDetail;