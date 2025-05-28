import React, { useState } from "react";
import { Link } from "react-router-dom";

const CatalogPage = () => {
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState("grid");

  // Sample product data
  const products = [
    {
      id: 1,
      name: "Modern Sofa",
      category: "Living Room",
      price: 599.99,
      image: "/assets/images/product-sofa.png",
      rating: 4.5,
      reviews: 38,
      inStock: true,
    },
    {
      id: 2,
      name: "Accent Chair",
      category: "Living Room",
      price: 249.99,
      image: "/assets/images/product-chair.png",
      rating: 4.2,
      reviews: 24,
      inStock: true,
    },
    {
      id: 3,
      name: "Coffee Table",
      category: "Living Room",
      price: 349.99,
      image: "/assets/images/product-table.png",
      rating: 4.8,
      reviews: 32,
      inStock: true,
    },
    {
      id: 4,
      name: "Memory Foam Mattress",
      category: "Bedroom",
      price: 799.99,
      image: "/assets/images/product-matrass.png",
      rating: 4.7,
      reviews: 42,
      inStock: true,
    },
    {
      id: 5,
      name: "Sectional Sofa",
      category: "Living Room",
      price: 1299.99,
      image: "/assets/images/product-bigsofa.png",
      rating: 4.6,
      reviews: 28,
      inStock: true,
    },
    {
      id: 6,
      name: "Kitchen Island",
      category: "Kitchen",
      price: 899.99,
      image: "/assets/images/kitchen.png",
      rating: 4.4,
      reviews: 18,
      inStock: true,
    },
  ];

  // Filter categories
  const categories = [
    { name: "Bedroom", count: 12 },
    { name: "Sofa", count: 15 },
    { name: "Office", count: 14 },
    { name: "Outdoor", count: 8 },
  ];

  // Price ranges
  const priceRanges = [
    { range: "Under $100", count: 5 },
    { range: "$100 - $300", count: 12 },
    { range: "$300 - $500", count: 15 },
    { range: "$500 - $1000", count: 8 },
    { range: "Over $1000", count: 3 },
  ];

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < Math.floor(rating) ? "currentColor" : "none"}
          stroke={i >= Math.floor(rating) ? "currentColor" : "none"}
          className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return <div className="flex text-amber-400">{stars}</div>;
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
            <li className="text-amber-500">Catalog</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Filters - Hidden on mobile */}
          <section className="hidden w-[300px] flex-shrink-0 px-4 lg:block">
            <div className="flex border-b pb-5">
              <div className="w-full">
                <p className="mb-3 font-medium">CATEGORIES</p>

                {categories.map((category, index) => (
                  <div key={index} className="flex w-full justify-between">
                    <div className="flex items-center justify-center">
                      <input type="checkbox" />
                      <p className="ml-4">{category.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">({category.count})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b py-5">
              <p className="mb-3 font-medium">PRICE</p>

              {priceRanges.map((price, index) => (
                <div key={index} className="flex w-full justify-between">
                  <div className="flex items-center justify-center">
                    <input type="checkbox" />
                    <p className="ml-4">{price.range}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">({price.count})</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b py-5">
              <p className="mb-3 font-medium">CUSTOMER RATINGS</p>

              <div className="flex w-full justify-between">
                <div className="flex items-center justify-center">
                  <input type="checkbox" />
                  <div className="ml-4 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4 text-amber-400">
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">(12)</p>
                </div>
              </div>

              <div className="flex w-full justify-between">
                <div className="flex items-center justify-center">
                  <input type="checkbox" />
                  <div className="ml-4 flex">
                    {[1, 2, 3, 4].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4 text-amber-400">
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-4 w-4 text-gray-300">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">(8)</p>
                </div>
              </div>
            </div>

            <div className="py-5">
              <button className="w-full rounded bg-amber-400 py-2 font-bold text-gray-900 transition hover:bg-yellow-300">
                Apply Filters
              </button>
            </div>
          </section>

          {/* Main Content */}
          <section className="flex-grow">
            {/* Sort and View Controls */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 focus:border-amber-500 focus:outline-none">
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600">View:</span>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded p-1 ${
                    viewMode === "grid" ? "bg-amber-400" : "bg-gray-200"
                  }`}>
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
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded p-1 ${
                    viewMode === "list" ? "bg-amber-400" : "bg-gray-200"
                  }`}>
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
                      d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div
              className={`${
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-6"
              }`}>
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`${
                    viewMode === "grid" ? "flex flex-col" : "flex gap-4"
                  } group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg`}>
                  <div
                    className={`${
                      viewMode === "grid" ? "w-full" : "w-1/3"
                    } relative mb-4 overflow-hidden rounded-lg`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute right-2 top-2 flex flex-col gap-2">
                      <button className="rounded-full bg-white p-2 shadow-md transition hover:bg-gray-100">
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
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div
                    className={`${
                      viewMode === "grid" ? "" : "w-2/3"
                    } flex flex-col`}>
                    <span className="text-sm text-gray-500">
                      {product.category}
                    </span>
                    <h3 className="mb-2 text-lg font-medium">{product.name}</h3>
                    <div className="mb-2 flex items-center">
                      {renderStars(product.rating)}
                      <span className="ml-2 text-gray-600">
                        ({product.reviews} reviews)
                      </span>
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xl font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.inStock ? "In stock" : "Out of stock"}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <Link
                        to="/product-overview"
                        className="block rounded bg-amber-400 px-4 py-2 text-center font-bold text-gray-900 transition hover:bg-yellow-300">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="rounded-md bg-amber-400 px-3 py-2 text-sm font-medium text-gray-900">
                  1
                </button>
                <button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
