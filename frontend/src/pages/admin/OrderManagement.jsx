import React, { useState } from "react";
import { PageHeader, Table, ActionButtons } from "../../components/admin";

/**
 * Order management component for the admin dashboard
 */
const OrderManagement = () => {
  // Mock order data - in a real app, this would come from a context or API
  const orders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      date: "2023-07-15",
      total: 125.99,
      status: "Delivered",
      items: 3,
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      date: "2023-07-14",
      total: 89.95,
      status: "Processing",
      items: 2,
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      date: "2023-07-13",
      total: 45.5,
      status: "Shipped",
      items: 1,
    },
    {
      id: "ORD-004",
      customer: "Alice Williams",
      date: "2023-07-12",
      total: 210.75,
      status: "Delivered",
      items: 4,
    },
    {
      id: "ORD-005",
      customer: "Charlie Brown",
      date: "2023-07-11",
      total: 65.25,
      status: "Cancelled",
      items: 2,
    },
  ];

  // Define columns for the orders table
  const columns = [
    { id: "id", label: "Order ID", sortable: false },
    { id: "customer", label: "Customer", sortable: false },
    { id: "date", label: "Date", sortable: false },
    { id: "items", label: "Items", sortable: false },
    { id: "total", label: "Total", sortable: false },
    { id: "status", label: "Status", sortable: false },
    { id: "actions", label: "Actions", sortable: false },
  ];

  // Get status badge color based on order status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Shipped":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Order Management" hideAddButton />

      <Table
        columns={columns}
        data={orders}
        renderRow={(order) => (
          <tr
            key={order.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {order.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {order.customer}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {order.date}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {order.items}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              ${order.total.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                  order.status
                )}`}>
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <ActionButtons
                onEdit={() => console.log(`View order ${order.id}`)}
                onDelete={() => console.log(`Cancel order ${order.id}`)}
                hideDelete={
                  order.status === "Delivered" || order.status === "Cancelled"
                }
              />
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default OrderManagement;
