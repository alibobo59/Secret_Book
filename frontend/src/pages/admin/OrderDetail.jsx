import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Package, User, CreditCard, Calendar, Activity, MapPin, Phone, Mail } from "lucide-react";
import { api } from "../../services/api";
import Loading from "../../components/admin/Loading";
import AuditLogTable from "../../components/admin/AuditLogTable";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/admin/orders/${id}`);
      navigate('/admin/orders', { 
        state: { message: 'Order deleted successfully' } 
      });
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!order) return <div className="text-gray-600 p-4">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/orders')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
                  <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">Order Details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/admin/orders/${id}/edit`}
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
                <Package className="w-4 h-4 inline mr-2" />
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
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items
                </h2>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {item.book?.image && (
                              <img
                                src={item.book.image}
                                alt={item.book.title}
                                className="w-16 h-20 object-cover rounded-md mr-4"
                              />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {item.book ? (
                                  <Link
                                    to={`/admin/books/${item.book.id}`}
                                    className="hover:text-blue-600"
                                  >
                                    {item.book.title}
                                  </Link>
                                ) : (
                                  'Book not found'
                                )}
                              </h3>
                              {item.book?.author && (
                                <p className="text-sm text-gray-600 mt-1">
                                  by {item.book.author.name}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 mt-1">
                                SKU: {item.book?.sku || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${item.price} × {item.quantity}
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No items found for this order.</p>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {order.user ? (
                        <Link
                          to={`/admin/users/${order.user.id}`}
                          className="hover:text-blue-600"
                        >
                          {order.user.name}
                        </Link>
                      ) : (
                        order.customer_name || 'N/A'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {order.user?.email || order.customer_email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Phone
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {order.customer_phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Shipping Address
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {order.shipping_address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {order.payment_method || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {order.transaction_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {order.payment_date ? new Date(order.payment_date).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${order.subtotal || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${order.tax || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${order.shipping || '0.00'}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-green-600">${order.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm text-gray-600 mb-1">Current Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600 mb-1">Payment Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Order Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm text-gray-600">Order Number</span>
                    <span className="text-gray-900">#{order.order_number}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Order ID</span>
                    <span className="text-gray-900">#{order.id}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Order Date</span>
                    <span className="text-gray-900">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Last Updated</span>
                    <span className="text-gray-900">
                      {new Date(order.updated_at).toLocaleString()}
                    </span>
                  </div>
                  {order.shipped_at && (
                    <div>
                      <span className="block text-sm text-gray-600">Shipped Date</span>
                      <span className="text-gray-900">
                        {new Date(order.shipped_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {order.delivered_at && (
                    <div>
                      <span className="block text-sm text-gray-600">Delivered Date</span>
                      <span className="text-gray-900">
                        {new Date(order.delivered_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditLogTable 
            modelType="App\\Models\\Order" 
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
                Are you sure you want to delete order "#{order.order_number}"? This action cannot be undone and will also delete all associated order items.
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

export default OrderDetail;