import React, { useState } from "react";
import { Link } from "react-router-dom";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Sample order history data
  const orders = [
    {
      id: "#ORD-12345",
      date: "June 12, 2023",
      status: "Delivered",
      total: 949.97,
      items: 3,
    },
    {
      id: "#ORD-12346",
      date: "May 28, 2023",
      status: "Processing",
      total: 599.99,
      items: 1,
    },
    {
      id: "#ORD-12347",
      date: "April 15, 2023",
      status: "Delivered",
      total: 349.99,
      items: 2,
    },
  ];

  // Sample address data
  const addresses = [
    {
      id: 1,
      type: "Shipping",
      name: "John Doe",
      address: "123 Main St, Apt 4B",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
      phone: "(212) 555-1234",
      isDefault: true,
    },
    {
      id: 2,
      type: "Billing",
      name: "John Doe",
      address: "456 Park Ave",
      city: "New York",
      state: "NY",
      zipCode: "10022",
      country: "United States",
      phone: "(212) 555-5678",
      isDefault: true,
    },
  ];

  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle register form input changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: value,
    });
  };

  // Handle login form submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted:", loginForm);
    // In a real application, you would validate and authenticate the user here
    setIsLoggedIn(true);
  };

  // Handle register form submission
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log("Register form submitted:", registerForm);
    // In a real application, you would validate and register the user here
    setIsLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-gray-100 py-4">
        <div className="mx-auto max-w-[1200px] px-5">
          <ul className="flex items-center">
            <li className="flex items-center">
              <Link to="/" className="text-gray-600 hover:text-amber-500">
                Home
              </Link>
              <span className="mx-2 text-gray-500">/</span>
            </li>
            <li className="text-amber-500">My Account</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        <h1 className="mb-8 text-3xl font-bold">My Account</h1>

        {!isLoggedIn ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Login Form */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
              <h2 className="mb-6 text-2xl font-bold">Login</h2>
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="login-email"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="login-password"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember-me"
                      name="rememberMe"
                      checked={loginForm.rememberMe}
                      onChange={handleLoginChange}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-amber-500 hover:text-amber-600">
                    Forgot your password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full rounded bg-amber-400 py-2 font-bold text-gray-900 transition hover:bg-yellow-300">
                  Login
                </button>
              </form>
            </div>

            {/* Register Form */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
              <h2 className="mb-6 text-2xl font-bold">Register</h2>
              <form onSubmit={handleRegisterSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="register-name"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="register-email"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="register-password"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="register-confirm-password"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="register-confirm-password"
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded bg-amber-400 py-2 font-bold text-gray-900 transition hover:bg-yellow-300">
                  Register
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-bold text-lg">Account Navigation</h2>
                </div>
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`p-4 text-left ${
                      activeTab === "dashboard"
                        ? "bg-amber-50 text-amber-500 font-medium"
                        : "hover:bg-gray-50"
                    }`}>
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`p-4 text-left ${
                      activeTab === "orders"
                        ? "bg-amber-50 text-amber-500 font-medium"
                        : "hover:bg-gray-50"
                    }`}>
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className={`p-4 text-left ${
                      activeTab === "addresses"
                        ? "bg-amber-50 text-amber-500 font-medium"
                        : "hover:bg-gray-50"
                    }`}>
                    Addresses
                  </button>
                  <button
                    onClick={() => setActiveTab("account-details")}
                    className={`p-4 text-left ${
                      activeTab === "account-details"
                        ? "bg-amber-50 text-amber-500 font-medium"
                        : "hover:bg-gray-50"
                    }`}>
                    Account Details
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-4 text-left text-red-500 hover:bg-gray-50">
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                  <div>
                    <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>
                    <p className="mb-4">
                      Hello <strong>John Doe</strong> (not John?{" "}
                      <button
                        onClick={handleLogout}
                        className="text-amber-500 hover:text-amber-600">
                        Log out
                      </button>
                      )
                    </p>
                    <p className="mb-6">
                      From your account dashboard you can view your recent
                      orders, manage your shipping and billing addresses, and
                      edit your password and account details.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border border-gray-200 p-4 hover:border-amber-400 hover:shadow-md transition">
                        <h3 className="mb-2 font-bold">Recent Orders</h3>
                        <p className="text-gray-600 mb-2">
                          View and track your recent purchases
                        </p>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="text-amber-500 hover:text-amber-600 font-medium">
                          View Orders →
                        </button>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 hover:border-amber-400 hover:shadow-md transition">
                        <h3 className="mb-2 font-bold">Shipping Addresses</h3>
                        <p className="text-gray-600 mb-2">
                          Manage your shipping and billing addresses
                        </p>
                        <button
                          onClick={() => setActiveTab("addresses")}
                          className="text-amber-500 hover:text-amber-600 font-medium">
                          View Addresses →
                        </button>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 hover:border-amber-400 hover:shadow-md transition">
                        <h3 className="mb-2 font-bold">Account Details</h3>
                        <p className="text-gray-600 mb-2">
                          Update your profile and password
                        </p>
                        <button
                          onClick={() => setActiveTab("account-details")}
                          className="text-amber-500 hover:text-amber-600 font-medium">
                          Edit Details →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div>
                    <h2 className="mb-6 text-2xl font-bold">Order History</h2>

                    {orders.length === 0 ? (
                      <p>You haven't placed any orders yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-gray-200 text-left">
                            <tr>
                              <th className="pb-3 pr-4">Order</th>
                              <th className="pb-3 pr-4">Date</th>
                              <th className="pb-3 pr-4">Status</th>
                              <th className="pb-3 pr-4">Total</th>
                              <th className="pb-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => (
                              <tr key={order.id}>
                                <td className="py-4 pr-4">{order.id}</td>
                                <td className="py-4 pr-4">{order.date}</td>
                                <td className="py-4 pr-4">
                                  <span
                                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                      order.status === "Delivered"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-4 pr-4">
                                  ${order.total.toFixed(2)} for {order.items}{" "}
                                  {order.items === 1 ? "item" : "items"}
                                </td>
                                <td className="py-4">
                                  <button className="text-amber-500 hover:text-amber-600">
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <div>
                    <h2 className="mb-6 text-2xl font-bold">Your Addresses</h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-lg border border-gray-200 p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-bold">
                              {address.type} Address
                            </h3>
                            {address.isDefault && (
                              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="mb-4 text-gray-700">
                            <p>{address.name}</p>
                            <p>{address.address}</p>
                            <p>
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p>{address.country}</p>
                            <p>Phone: {address.phone}</p>
                          </div>

                          <div className="flex space-x-2">
                            <button className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
                              Edit
                            </button>
                            {!address.isDefault && (
                              <button className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 p-6">
                        <button className="flex items-center text-amber-500 hover:text-amber-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="mr-2 h-5 w-5">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                          Add New Address
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Details Tab */}
                {activeTab === "account-details" && (
                  <div>
                    <h2 className="mb-6 text-2xl font-bold">Account Details</h2>

                    <form>
                      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="first-name"
                            className="mb-1 block text-sm font-medium text-gray-700">
                            First Name *
                          </label>
                          <input
                            type="text"
                            id="first-name"
                            name="firstName"
                            defaultValue="John"
                            required
                            className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="last-name"
                            className="mb-1 block text-sm font-medium text-gray-700">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            id="last-name"
                            name="lastName"
                            defaultValue="Doe"
                            required
                            className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="display-name"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          Display Name *
                        </label>
                        <input
                          type="text"
                          id="display-name"
                          name="displayName"
                          defaultValue="John Doe"
                          required
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          This will be how your name appears in the account
                          section and in reviews.
                        </p>
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="email"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          defaultValue="john.doe@example.com"
                          required
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <h3 className="mb-4 mt-8 text-xl font-bold">
                        Password Change
                      </h3>

                      <div className="mb-4">
                        <label
                          htmlFor="current-password"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          Current Password (leave blank to leave unchanged)
                        </label>
                        <input
                          type="password"
                          id="current-password"
                          name="currentPassword"
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="new-password"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          New Password (leave blank to leave unchanged)
                        </label>
                        <input
                          type="password"
                          id="new-password"
                          name="newPassword"
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="confirm-password"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirm-password"
                          name="confirmPassword"
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded bg-amber-400 px-6 py-2 font-bold text-gray-900 transition hover:bg-yellow-300">
                        Save Changes
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
