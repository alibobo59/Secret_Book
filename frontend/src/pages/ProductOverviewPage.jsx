import React, { useState } from "react";
import { Link } from "react-router-dom";

const ProductOverviewPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);

  // Sample product data
  const product = {
    id: 1,
    name: "Modern Sofa",
    category: "Living Room",
    price: 599.99,
    oldPrice: 799.99,
    description:
      "This modern sofa combines style and comfort with its sleek design and premium materials. Perfect for contemporary living spaces, it features high-density foam cushions and a sturdy hardwood frame for lasting durability.",
    features: [
      "Premium fabric upholstery",
      "High-density foam cushions",
      "Solid hardwood frame",
      "Removable and washable covers",
      "Easy assembly required",
    ],
    specifications: {
      dimensions: '84" W x 38" D x 34" H',
      weight: "120 lbs",
      material: "Polyester blend fabric, hardwood",
      colors: "Gray, Blue, Beige",
      warranty: "2 years limited",
    },
    images: [
      "/assets/images/product-sofa.png",
      "/assets/images/product-sofa-2.png",
      "/assets/images/product-sofa-3.png",
      "/assets/images/product-sofa-4.png",
    ],
    rating: 4.5,
    reviews: 38,
    inStock: true,
    sku: "MS-LR-001",
    relatedProducts: [
      {
        id: 2,
        name: "Accent Chair",
        price: 249.99,
        image: "/assets/images/product-chair.png",
        rating: 4.2,
      },
      {
        id: 3,
        name: "Coffee Table",
        price: 349.99,
        image: "/assets/images/product-table.png",
        rating: 4.8,
      },
      {
        id: 5,
        name: "Sectional Sofa",
        price: 1299.99,
        image: "/assets/images/product-bigsofa.png",
        rating: 4.6,
      },
    ],
  };

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

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
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
              <Link
                to="/catalog"
                className="text-gray-600 hover:text-amber-500">
                Catalog
              </Link>
              <span className="mx-2 text-gray-500">/</span>
            </li>
            <li className="text-amber-500">{product.name}</li>
          </ul>
        </div>
      </section>

      {/* Product Overview */}
      <section className="mx-auto max-w-[1200px] px-5 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Product Images */}
          <div>
            <div className="mb-4 overflow-hidden rounded-lg">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-[400px] w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer overflow-hidden rounded-lg border-2 ${
                    activeImage === index
                      ? "border-amber-400"
                      : "border-transparent"
                  }`}
                  onClick={() => setActiveImage(index)}>
                  <img
                    src={image}
                    alt={`${product.name} - View ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <p className="mb-4 text-gray-600">{product.category}</p>

            <div className="mb-4 flex items-center">
              {renderStars(product.rating)}
              <span className="ml-2 text-gray-600">
                ({product.reviews} reviews)
              </span>
            </div>

            <div className="mb-6 flex items-center">
              <span className="text-3xl font-bold">
                ${product.price.toFixed(2)}
              </span>
              {product.oldPrice && (
                <span className="ml-3 text-xl text-gray-500 line-through">
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
              {product.oldPrice && (
                <span className="ml-3 rounded bg-red-500 px-2 py-1 text-sm text-white">
                  Save ${(product.oldPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mb-6">
              <p className="mb-2 text-gray-700">
                Availability:
                <span
                  className={
                    product.inStock ? "text-green-600" : "text-red-600"
                  }>
                  {product.inStock ? " In Stock" : " Out of Stock"}
                </span>
              </p>
              <p className="text-gray-700">SKU: {product.sku}</p>
            </div>

            <div className="mb-6">
              <label htmlFor="quantity" className="mb-2 block font-medium">
                Quantity
              </label>
              <div className="flex w-32 items-center">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  className="h-10 w-10 border border-gray-300 bg-gray-100 text-center text-gray-600 hover:bg-gray-200">
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="h-10 w-12 border-y border-gray-300 bg-white text-center text-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={incrementQuantity}
                  className="h-10 w-10 border border-gray-300 bg-gray-100 text-center text-gray-600 hover:bg-gray-200">
                  +
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              <button className="flex items-center justify-center rounded bg-amber-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-yellow-300">
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
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
                Add to Cart
              </button>
              <button className="flex items-center justify-center rounded border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100">
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
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                Add to Wishlist
              </button>
            </div>

            <div className="mb-6 border-t border-gray-200 pt-6">
              <div className="flex space-x-4">
                <button
                  className={`border-b-2 pb-2 font-medium ${
                    activeTab === "description"
                      ? "border-amber-400 text-amber-500"
                      : "border-transparent text-gray-600"
                  }`}
                  onClick={() => setActiveTab("description")}>
                  Description
                </button>
                <button
                  className={`border-b-2 pb-2 font-medium ${
                    activeTab === "features"
                      ? "border-amber-400 text-amber-500"
                      : "border-transparent text-gray-600"
                  }`}
                  onClick={() => setActiveTab("features")}>
                  Features
                </button>
                <button
                  className={`border-b-2 pb-2 font-medium ${
                    activeTab === "specifications"
                      ? "border-amber-400 text-amber-500"
                      : "border-transparent text-gray-600"
                  }`}
                  onClick={() => setActiveTab("specifications")}>
                  Specifications
                </button>
              </div>

              <div className="mt-4">
                {activeTab === "description" && (
                  <p className="text-gray-700">{product.description}</p>
                )}

                {activeTab === "features" && (
                  <ul className="list-inside list-disc space-y-2 text-gray-700">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                )}

                {activeTab === "specifications" && (
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Dimensions:</strong>{" "}
                      {product.specifications.dimensions}
                    </p>
                    <p>
                      <strong>Weight:</strong> {product.specifications.weight}
                    </p>
                    <p>
                      <strong>Material:</strong>{" "}
                      {product.specifications.material}
                    </p>
                    <p>
                      <strong>Available Colors:</strong>{" "}
                      {product.specifications.colors}
                    </p>
                    <p>
                      <strong>Warranty:</strong>{" "}
                      {product.specifications.warranty}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="mx-auto max-w-[1200px] px-5 py-8">
        <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {product.relatedProducts.map((relatedProduct) => (
            <div
              key={relatedProduct.id}
              className="group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg">
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
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
              <h3 className="mb-2 text-lg font-medium">
                {relatedProduct.name}
              </h3>
              <div className="mb-2 flex items-center">
                {renderStars(relatedProduct.rating)}
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xl font-bold">
                  ${relatedProduct.price.toFixed(2)}
                </span>
              </div>
              <Link
                to={`/product-overview?id=${relatedProduct.id}`}
                className="block rounded bg-amber-400 px-4 py-2 text-center font-bold text-gray-900 transition hover:bg-yellow-300">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductOverviewPage;
