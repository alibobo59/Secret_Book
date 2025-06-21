import React, { useState, useEffect } from "react";
import { PageHeader, Table, SearchFilter, Modal } from "../../components/admin";
import {
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";

// Fake order data
const fakeOrders = [
  {
    id: "ORD001",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    createdAt: "2025-06-15T10:30:00Z",
    updatedAt: "2025-06-15T12:45:00Z",
    total: 59.98,
    status: "pending",
    paymentMethod: "COD",
    contactInfo: { phone: "+1-555-123-4567" },
    shippingAddress: {
      firstName: "John",
      lastName: "Doe",
      address: "123 Maple Street",
      city: "Springfield",
      postalCode: "62701",
    },
    items: [
      {
        bookId: "BOOK001",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        bookImage: "https://example.com/images/gatsby.jpg",
        price: 29.99,
        quantity: 2,
      },
    ],
    notes: "Please deliver before noon.",
  },
  {
    id: "ORD002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    createdAt: "2025-06-14T14:20:00Z",
    updatedAt: "2025-06-15T09:10:00Z",
    total: 89.97,
    status: "processing",
    paymentMethod: "COD",
    contactInfo: { phone: "+1-555-987-6543" },
    shippingAddress: {
      firstName: "Jane",
      lastName: "Smith",
      address: "456 Oak Avenue",
      city: "Metropolis",
      postalCode: "10001",
    },
    items: [
      {
        bookId: "BOOK002",
        title: "1984",
        author: "George Orwell",
        bookImage: "https://example.com/images/1984.jpg",
        price: 29.99,
        quantity: 3,
      },
    ],
    notes: "Gift wrap requested.",
  },
  {
    id: "ORD003",
    customerName: "Alice Johnson",
    customerEmail: "alice.johnson@example.com",
    createdAt: "2025-06-13T08:15:00Z",
    updatedAt: "2025-06-14T16:30:00Z",
    total: 45.98,
    status: "shipped",
    paymentMethod: "COD",
    contactInfo: { phone: "+1-555-456-7890" },
    shippingAddress: {
      firstName: "Alice",
      lastName: "Johnson",
      address: "789 Pine Road",
      city: "Gotham",
      postalCode: "07001",
    },
    items: [
      {
        bookId: "BOOK003",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        bookImage: "https://example.com/images/pride.jpg",
        price: 22.99,
        quantity: 2,
      },
    ],
  },
  {
    id: "ORD004",
    customerName: "Bob Williams",
    customerEmail: "bob.williams@example.com",
    createdAt: "2025-06-12T16:45:00Z",
    updatedAt: "2025-06-13T10:20:00Z",
    total: 119.96,
    status: "delivered",
    paymentMethod: "COD",
    contactInfo: { phone: "+1-555-321-0987" },
    shippingAddress: {
      firstName: "Bob",
      lastName: "Williams",
      address: "321 Elm Street",
      city: "Star City",
      postalCode: "90001",
    },
    items: [
      {
        bookId: "BOOK004",
        title: "Dune",
        author: "Frank Herbert",
        bookImage: "https://example.com/images/dune.jpg",
        price: 29.99,
        quantity: 4,
      },
    ],
    notes: "Leave package at front door.",
  },
  {
    id: "ORD005",
    customerName: "Carol Brown",
    customerEmail: "carol.brown@example.com",
    createdAt: "2025-06-11T11:00:00Z",
    updatedAt: "2025-06-11T15:30:00Z",
    total: 29.99,
    status: "cancelled",
    paymentMethod: "COD",
    contactInfo: { phone: "+1-555-654-3210" },
    shippingAddress: {
      firstName: "Carol",
      lastName: "Brown",
      address: "654 Cedar Lane",
      city: "Central City",
      postalCode: "20001",
    },
    items: [
      {
        bookId: "BOOK005",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        bookImage: "https://example.com/images/mockingbird.jpg",
        price: 29.99,
        quantity: 1,
      },
    ],
    notes: "Cancelled due to change of mind.",
  },
];

const OrderManagement = () => {
  const [orders, setOrders] = useState(fakeOrders);
  const [filteredOrders, setFilteredOrders] = useState(fakeOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Filter and search orders
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt" || sortField === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setLoading(true);
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      // Update local state
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      setOrders(updatedOrders);

      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "shipped":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const columns = [
    { id: "id", label: "Order ID", sortable: true },
    { id: "customerName", label: "Customer", sortable: true },
    { id: "createdAt", label: "Date", sortable: true },
    { id: "total", label: "Total", sortable: true },
    { id: "status", label: "Status", sortable: false },
    { id: "paymentMethod", label: "Payment", sortable: false },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Order Management" hideAddButton />

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search orders, customers..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={statusOptions}
        filterPlaceholder="All Statuses"
      />

      <Table
        columns={columns}
        data={filteredOrders}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        renderRow={(order) => (
          <tr
            key={order.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {order.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {order.customerName}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {order.customerEmail}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {new Date(order.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              ${order.total.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  order.status
                )}`}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <CreditCard className="h-3 w-3" />
                COD
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="View Details">
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleUpdateStatus(order)}
                  className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                  title="Update Status">
                  <Package className="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* View Order Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Order Details - ${selectedOrder?.id}`}>
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order ID
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedOrder.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Amount
                </label>
                <p className="text-gray-900 dark:text-white font-semibold">
                  ${selectedOrder.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedOrder.customerEmail}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedOrder.contactInfo?.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Shipping Address
              </h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div className="text-gray-700 dark:text-gray-300">
                  <p>
                    {selectedOrder.shippingAddress?.firstName}{" "}
                    {selectedOrder.shippingAddress?.lastName}
                  </p>
                  <p>{selectedOrder.shippingAddress?.address}</p>
                  <p>
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Order Items
              </h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.bookId}
                    className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <img
                      src={item.bookImage}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {item.author}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            {selectedOrder.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Order Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {selectedOrder.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Order Status"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
              onClick={handleStatusUpdate}
              disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        }>
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order ID: {selectedOrder.id}
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Status: {selectedOrder.status}
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Changing the order status will notify the customer via email.
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
