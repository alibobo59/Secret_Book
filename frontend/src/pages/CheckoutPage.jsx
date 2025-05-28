import React, { useState } from "react";
import { Link } from "react-router-dom";

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    paymentMethod: "credit-card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveInfo: false,
  });

  // Sample cart data
  const cartItems = [
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
  ];

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Shipping cost
  const shipping = 25.0;

  // Calculate total
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process checkout (would typically send to an API)
    console.log("Checkout data:", formData);
    alert("Order placed successfully!");
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
            <li className="flex items-center">
              <Link to="/cart" className="text-gray-600 hover:text-amber-500">
                Cart
              </Link>
              <span className="mx-2 text-gray-500">/</span>
            </li>
            <li className="text-amber-500">Checkout</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Shipping Information */}
              <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-bold">Shipping Information</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="zipCode"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="mb-1 block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none">
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-bold">Payment Method</h2>

                <div className="mb-4">
                  <div className="mb-2 flex items-center">
                    <input
                      type="radio"
                      id="credit-card"
                      name="paymentMethod"
                      value="credit-card"
                      checked={formData.paymentMethod === "credit-card"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                    />
                    <label
                      htmlFor="credit-card"
                      className="ml-2 text-sm font-medium text-gray-700">
                      Credit Card
                    </label>
                  </div>

                  {formData.paymentMethod === "credit-card" && (
                    <div className="ml-6 mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="cardNumber"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="XXXX XXXX XXXX XXXX"
                          required
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="cardName"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          Name on Card *
                        </label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="expiryDate"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cvv"
                          className="mb-1 block text-sm font-medium text-gray-700">
                          CVV *
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="XXX"
                          required
                          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-2 flex items-center">
                  <input
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === "paypal"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                  />
                  <label
                    htmlFor="paypal"
                    className="ml-2 text-sm font-medium text-gray-700">
                    PayPal
                  </label>
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="saveInfo"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                  />
                  <label
                    htmlFor="saveInfo"
                    className="ml-2 text-sm text-gray-700">
                    Save this information for next time
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded bg-amber-400 py-3 font-bold text-gray-900 transition hover:bg-yellow-300 sm:w-auto sm:px-8">
                Place Order
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

              <div className="mb-6 max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="mb-4 flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4 border-t border-gray-200 pt-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6 flex justify-between border-t border-gray-200 pt-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
