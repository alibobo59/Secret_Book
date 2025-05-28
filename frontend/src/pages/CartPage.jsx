import React, { useState } from "react";
import { Link } from "react-router-dom";

const CartPage = () => {
  // Sample cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Modern Sofa",
      price: 599.99,
      image: "/assets/images/product-sofa.png",
      quantity: 1,
    },
    {
      id: 3,
      name: "Coffee Table",
      price: 349.99,
      image: "/assets/images/product-table.png",
      quantity: 2,
    },
  ]);

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Shipping cost
  const shipping = 25.0;

  // Calculate total
  const total = subtotal + shipping;

  // Update quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
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
            <li className="text-amber-500">Shopping Cart</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="mx-auto mb-4 h-16 w-16 text-gray-400">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            <h2 className="mb-2 text-xl font-medium">Your cart is empty</h2>
            <p className="mb-6 text-gray-600">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              to="/catalog"
              className="inline-block rounded bg-amber-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-yellow-300">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-4 font-medium text-gray-700">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-gray-200 p-4 last:border-b-0">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <div className="flex items-center">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex flex-col">
                            <h3 className="text-base font-medium text-gray-900">
                              <Link
                                to="/product-overview"
                                className="hover:text-amber-500">
                                {item.name}
                              </Link>
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="mt-1 text-left text-sm font-medium text-red-500 hover:text-red-700">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="font-medium">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-center">
                          <div className="flex w-24 items-center">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="h-8 w-8 border border-gray-300 bg-gray-100 text-center text-gray-600 hover:bg-gray-200">
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="h-8 w-8 border-y border-gray-300 bg-white text-center text-gray-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="h-8 w-8 border border-gray-300 bg-gray-100 text-center text-gray-600 hover:bg-gray-200">
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between">
                <Link
                  to="/catalog"
                  className="flex items-center text-amber-500 hover:text-amber-600">
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
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                  Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-red-500 hover:text-red-700">
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
                <div className="mb-4 border-b border-gray-200 pb-4">
                  <div className="mb-2 flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mb-6 flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full rounded bg-amber-400 py-3 text-center font-bold text-gray-900 transition hover:bg-yellow-300">
                  Proceed to Checkout
                </Link>
              </div>

              <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-medium">Have a coupon?</h3>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="w-full rounded-l border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="rounded-r bg-amber-400 px-4 py-2 font-medium text-gray-900 transition hover:bg-yellow-300">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
