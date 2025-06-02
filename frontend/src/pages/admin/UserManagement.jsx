import React, { useState } from "react";
import { PageHeader, Table, ActionButtons } from "../../components/admin";

/**
 * User management component for the admin dashboard
 */
const UserManagement = () => {
  // Mock user data - in a real app, this would come from a context or API
  const users = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      status: "Active",
      lastLogin: "2023-07-15",
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@example.com",
      role: "Customer",
      status: "Active",
      lastLogin: "2023-07-14",
    },
    {
      id: 3,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Customer",
      status: "Active",
      lastLogin: "2023-07-13",
    },
    {
      id: 4,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "Customer",
      status: "Inactive",
      lastLogin: "2023-06-30",
    },
    {
      id: 5,
      name: "Alice Williams",
      email: "alice@example.com",
      role: "Customer",
      status: "Active",
      lastLogin: "2023-07-10",
    },
  ];

  // Handle adding a new user
  const handleAddUser = () => {
    // Implementation would go here
    console.log("Add new user");
  };

  // Define columns for the users table
  const columns = [
    { id: "id", label: "ID", sortable: false },
    { id: "name", label: "Name", sortable: false },
    { id: "email", label: "Email", sortable: false },
    { id: "role", label: "Role", sortable: false },
    { id: "status", label: "Status", sortable: false },
    { id: "lastLogin", label: "Last Login", sortable: false },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        onAddNew={handleAddUser}
        addNewLabel="Add New User"
      />

      <Table
        columns={columns}
        data={users}
        renderRow={(user) => (
          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {user.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {user.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {user.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === "Admin"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}>
                {user.role}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.status === "Active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}>
                {user.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {user.lastLogin}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <ActionButtons
                onEdit={() => console.log(`Edit user ${user.id}`)}
                onDelete={() => console.log(`Delete user ${user.id}`)}
              />
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default UserManagement;
