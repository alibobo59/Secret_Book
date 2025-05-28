import React from "react";
import { Link } from "react-router-dom";

const CheckoutConfirmationPage = () => {
  // Sample order data
  const orderNumber = "#ORD-12345";
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
            <li className="text-gray-500">Checkout</li>
          </ul>
        </div>
      </section>

      <div className="flex-grow">
        <section className="mt-20 px-4">
          <div className="flex flex-col">
            <p className="text-center text-3xl font-bold">
              We Accepted your order!
            </p>
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="mx-auto my-3 h-[60px] w-[60px] text-green-500">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg">
                Thank you for your purchase! Your order has been received and is
                now being processed.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-[600px] rounded-lg border border-gray-200 p-6">
              <div className="mb-6 border-b border-gray-200 pb-6">
                <h2 className="mb-2 text-xl font-bold">Order Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number:</p>
                    <p className="font-medium">{orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date:</p>
                    <p className="font-medium">{orderDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email:</p>
                    <p className="font-medium">john.doe@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total:</p>
                    <p className="font-medium">$1,280.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method:</p>
                    <p className="font-medium">Credit Card (Visa)</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 font-bold">Shipping Address</h3>
                <p>John Doe</p>
                <p>123 Main Street, Apt 4B</p>
                <p>New York, NY 10001</p>
                <p>United States</p>
                <p>Phone: (212) 555-1234</p>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 font-bold">Shipping Method</h3>
                <p>Standard Shipping (5-7 business days)</p>
              </div>

              <div className="text-center">
                <p className="mb-4 text-sm text-gray-500">
                  You will receive an email confirmation shortly at
                  john.doe@example.com
                </p>
                <Link
                  to="/account"
                  className="inline-block rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50">
                  View Order History
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-8 flex max-w-[600px] justify-between">
              <Link
                to="/"
                className="rounded bg-amber-400 px-6 py-2 font-bold text-gray-900 transition hover:bg-yellow-300">
                Continue Shopping
              </Link>
              <Link
                to="/contact"
                className="rounded border border-gray-300 px-6 py-2 font-medium hover:bg-gray-50">
                Need Help?
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CheckoutConfirmationPage;
