import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section
        className="h-[600px] w-full bg-cover bg-center"
        style={{ backgroundImage: "url('./assets/images/header-bg.jpeg')" }}>
        <div className="mx-auto flex h-full max-w-[1200px] items-center px-5">
          <div className="sm:w-2/3 md:w-1/2">
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Best Furniture <br /> For Your Home
            </h1>
            <p className="mt-2 text-white sm:mt-4 sm:text-lg">
              Find the perfect furniture for your home from our wide collection.
            </p>
            <Link
              to="/catalog"
              className="mt-4 inline-block rounded bg-amber-400 px-8 py-3 text-center font-bold text-gray-900 transition duration-300 hover:bg-yellow-300 sm:mt-6">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-[1200px] px-5 py-10">
        <h2 className="mb-6 text-center text-2xl font-bold md:text-3xl">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-lg">
            <img
              src="./assets/images/living-room.png"
              alt="Living Room"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <h3 className="text-xl font-bold text-white">Living Room</h3>
            </div>
            <Link to="/catalog" className="absolute inset-0">
              <span className="sr-only">Shop Living Room</span>
            </Link>
          </div>

          <div className="group relative overflow-hidden rounded-lg">
            <img
              src="./assets/images/bedroom.png"
              alt="Bedroom"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <h3 className="text-xl font-bold text-white">Bedroom</h3>
            </div>
            <Link to="/catalog" className="absolute inset-0">
              <span className="sr-only">Shop Bedroom</span>
            </Link>
          </div>

          <div className="group relative overflow-hidden rounded-lg">
            <img
              src="./assets/images/kitchen.png"
              alt="Kitchen"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <h3 className="text-xl font-bold text-white">Kitchen</h3>
            </div>
            <Link to="/catalog" className="absolute inset-0">
              <span className="sr-only">Shop Kitchen</span>
            </Link>
          </div>

          <div className="group relative overflow-hidden rounded-lg">
            <img
              src="./assets/images/outdoors.png"
              alt="Outdoors"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <h3 className="text-xl font-bold text-white">Outdoors</h3>
            </div>
            <Link to="/catalog" className="absolute inset-0">
              <span className="sr-only">Shop Outdoors</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-[1200px] px-5 py-10">
        <h2 className="mb-6 text-center text-2xl font-bold md:text-3xl">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Product Card 1 */}
          <div className="group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg">
            <div className="relative mb-4 overflow-hidden rounded-lg">
              <img
                src="./assets/images/product-sofa.png"
                alt="Modern Sofa"
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
            <h3 className="mb-2 text-lg font-medium">Modern Sofa</h3>
            <div className="mb-2 flex items-center">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5">
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">(24 reviews)</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xl font-bold">$599.99</span>
              <span className="text-sm text-gray-500">In stock</span>
            </div>
            <Link
              to="/product-overview"
              className="block rounded bg-amber-400 px-4 py-2 text-center font-bold text-gray-900 transition hover:bg-yellow-300">
              View Details
            </Link>
          </div>

          {/* Product Card 2 */}
          <div className="group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg">
            <div className="relative mb-4 overflow-hidden rounded-lg">
              <img
                src="./assets/images/product-chair.png"
                alt="Accent Chair"
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
            <h3 className="mb-2 text-lg font-medium">Accent Chair</h3>
            <div className="mb-2 flex items-center">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5">
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">(18 reviews)</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xl font-bold">$249.99</span>
              <span className="text-sm text-gray-500">In stock</span>
            </div>
            <Link
              to="/product-overview"
              className="block rounded bg-amber-400 px-4 py-2 text-center font-bold text-gray-900 transition hover:bg-yellow-300">
              View Details
            </Link>
          </div>

          {/* Product Card 3 */}
          <div className="group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg">
            <div className="relative mb-4 overflow-hidden rounded-lg">
              <img
                src="./assets/images/product-table.png"
                alt="Coffee Table"
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
            <h3 className="mb-2 text-lg font-medium">Coffee Table</h3>
            <div className="mb-2 flex items-center">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5">
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">(32 reviews)</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xl font-bold">$349.99</span>
              <span className="text-sm text-gray-500">In stock</span>
            </div>
            <Link
              to="/product-overview"
              className="block rounded bg-amber-400 px-4 py-2 text-center font-bold text-gray-900 transition hover:bg-yellow-300">
              View Details
            </Link>
          </div>

          {/* Product Card 4 */}
          <div className="group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg">
            <div className="relative mb-4 overflow-hidden rounded-lg">
              <img
                src="./assets/images/product-matrass.png"
                alt="Memory Foam Mattress"
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
            <h3 className="mb-2 text-lg font-medium">Memory Foam Mattress</h3>
            <div className="mb-2 flex items-center">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5">
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">(42 reviews)</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xl font-bold">$799.99</span>
              <span className="text-sm text-gray-500">In stock</span>
            </div>
            <Link
              to="/product-overview"
              className="block rounded bg-amber-400 px-4 py-2 text-center font-bold text-gray-900 transition hover:bg-yellow-300">
              View Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
