import React, { useState } from "react";
import { Link } from "react-router-dom";

const WishlistPage = () => {
  // Sample wishlist data
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "Modern Accent Chair",
      image: "/images/products/chair-1.jpg",
      price: 249.99,
      originalPrice: 329.99,
      inStock: true,
      rating: 4.5,
      reviewCount: 24,
    },
    {
      id: 2,
      name: "Wooden Coffee Table",
      image: "/images/products/table-1.jpg",
      price: 399.99,
      originalPrice: null,
      inStock: true,
      rating: 5,
      reviewCount: 12,
    },
    {
      id: 3,
      name: "Minimalist Floor Lamp",
      image: "/images/products/lamp-1.jpg",
      price: 149.99,
      originalPrice: 199.99,
      inStock: false,
      rating: 4,
      reviewCount: 8,
    },
  ]);

  // Function to remove item from wishlist
  const removeFromWishlist = (itemId) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== itemId));
  };

  // Function to render star ratings
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          className="h-5 w-5 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="h-5 w-5 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20">
          <defs>
            <linearGradient
              id="half-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-gradient)"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    }

    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="h-5 w-5 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
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
            <li className="text-amber-500">Wishlist</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        <h1 className="mb-8 text-3xl font-bold">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
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
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <h2 className="mb-2 text-xl font-bold">Your wishlist is empty</h2>
            <p className="mb-6 text-gray-600">
              Add items you love to your wishlist. Review them anytime and
              easily move them to the cart.
            </p>
            <Link
              to="/catalog"
              className="inline-block rounded bg-amber-400 px-6 py-2 font-bold text-gray-900 transition hover:bg-yellow-300">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 text-left">
                <tr>
                  <th className="pb-4 pr-4">Product</th>
                  <th className="pb-4 pr-4">Price</th>
                  <th className="pb-4 pr-4">Stock Status</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wishlistItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 pr-4">
                      <div className="flex items-center">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/product/${item.id}`}
                            className="font-medium text-gray-900 hover:text-amber-500">
                            {item.name}
                          </Link>
                          <div className="mt-1 flex items-center">
                            <div className="flex">
                              {renderStarRating(item.rating)}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              ({item.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div>
                        <span className="font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </span>
                        {item.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          item.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {item.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <button
                          className={`rounded px-4 py-2 text-sm font-medium ${
                            item.inStock
                              ? "bg-amber-400 text-gray-900 hover:bg-yellow-300"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={!item.inStock}>
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="rounded border border-gray-300 px-2 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          title="Remove from wishlist">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {wishlistItems.length > 0 && (
          <div className="mt-8 flex justify-between">
            <Link
              to="/catalog"
              className="rounded border border-gray-300 px-6 py-2 font-medium hover:bg-gray-50">
              Continue Shopping
            </Link>
            <button
              onClick={() => setWishlistItems([])}
              className="rounded border border-red-300 px-6 py-2 font-medium text-red-600 hover:bg-red-50">
              Clear Wishlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
