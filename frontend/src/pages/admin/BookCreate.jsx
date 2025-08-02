import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBook } from "../../contexts/BookContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";
import { Loading, RichTextEditor } from "../../components/admin";

const BookCreate = () => {
  const { loading } = useOutletContext();
  const { user, getToken, hasRole } = useAuth();
  const { categories, authors, publishers, books, setBooks } = useBook();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  // Trạng thái lỗi cục bộ
  const [error, setError] = useState(null);

  const [isVariableProduct, setIsVariableProduct] = useState(false);
  const [attributes, setAttributes] = useState([{ name: "", values: "" }]);
  const [attributeErrors, setAttributeErrors] = useState([]);
  const [form, setForm] = useState({
    title: "",
    sku: "",
    description: "",
    price: "",
    stock_quantity: "",
    category_id: "",
    author_id: "",
    publisher_id: "",
    image: null,
    variations: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [variationPreviews, setVariationPreviews] = useState({});

  // Chuyển đổi giữa sản phẩm đơn giản và sản phẩm biến thể
  const toggleProductType = () => {
    setIsVariableProduct(!isVariableProduct);
    setForm({ ...form, variations: [], stock_quantity: "" });
    setAttributes([{ name: "", values: "" }]);
    setAttributeErrors([]);
    setVariationPreviews({}); // Xóa tất cả preview của variations
  };

  // Xử lý thay đổi thuộc tính
  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = attributes.map((attr, i) =>
      i === index ? { ...attr, [field]: value } : attr
    );
    setAttributes(updatedAttributes);
    validateAttributes(updatedAttributes);
  };

  // Xác thực thuộc tính
  const validateAttributes = (attrs) => {
    const errors = [];
    const names = attrs.map((attr) => attr.name.trim().toLowerCase());
    attrs.forEach((attr, index) => {
      const err = {};
      if (!attr.name.trim()) {
        err.name = "Tên thuộc tính là bắt buộc.";
      } else if (
        names.filter((name) => name === attr.name.trim().toLowerCase()).length >
        1
      ) {
        err.name = "Tên thuộc tính bị trùng lặp.";
      }
      if (!attr.values.trim()) {
        err.values = "Giá trị thuộc tính là bắt buộc.";
      }
      if (Object.keys(err).length > 0) {
        errors[index] = err;
      }
    });
    setAttributeErrors(errors);
    return errors.length === 0;
  };

  // Thêm thuộc tính mới
  const addAttribute = () => {
    setAttributes([...attributes, { name: "", values: "" }]);
  };

  // Xóa thuộc tính
  const removeAttribute = (index) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
    validateAttributes(updatedAttributes);
  };

  // Tạo biểu mẫu biến thể dựa trên thuộc tính
  const generateVariationsForm = () => {
    if (!validateAttributes(attributes)) {
      setError("Vui lòng sửa lỗi thuộc tính trước khi tạo biến thể.");
      return;
    }

    const validAttributes = attributes.filter(
      (attr) => attr.name.trim() && attr.values.trim()
    );
    if (validAttributes.length === 0) {
      setError(
        "Vui lòng định nghĩa ít nhất một thuộc tính hợp lệ với giá trị."
      );
      return;
    }

    // Parse attribute values into arrays
    const attributeValues = validAttributes.map((attr) => ({
      name: attr.name.trim(),
      values: attr.values
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v),
    }));

    // Generate variations
    const variations = [];
    const generateCombinations = (attrIndex = 0, current = {}) => {
      if (attrIndex >= attributeValues.length) {
        const variationSku = generateVariationSku(current);
        variations.push({
          attributes: { ...current },
          price: "",
          stock_quantity: "",
          sku: variationSku,
          image: null,
        });
        return;
      }
      const { name, values } = attributeValues[attrIndex];
      for (const value of values) {
        generateCombinations(attrIndex + 1, { ...current, [name]: value });
      }
    };
    generateCombinations();

    setForm({ ...form, variations, stock_quantity: null });
    setError(null);
  };

  // Tạo SKU biến thể động
  const generateVariationSku = (attributes, parentSku = form.sku) => {
    if (!parentSku) return "";
    const attrValues = Object.values(attributes)
      .map((value) => value.replace(/\s+/g, ""))
      .join("-");
    return attrValues ? `${parentSku}-${attrValues}` : `${parentSku}-NEW`;
  };

  // Thêm biến thể mới thủ công
  const addVariation = () => {
    setForm({
      ...form,
      variations: [
        ...form.variations,
        {
          attributes: {},
          price: "",
          stock_quantity: "",
          sku: form.sku ? `${form.sku}-NEW` : "",
          image: null,
        },
      ],
    });
  };

  // Xóa một biến thể
  const removeVariation = (index) => {
    setForm({
      ...form,
      variations: form.variations.filter((_, i) => i !== index),
    });
    // Xóa preview của variation bị xóa
    setVariationPreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      // Cập nhật lại index cho các variation còn lại
      const updatedPreviews = {};
      Object.keys(newPreviews).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          updatedPreviews[oldIndex - 1] = newPreviews[key];
        } else {
          updatedPreviews[key] = newPreviews[key];
        }
      });
      return updatedPreviews;
    });
  };

  // Cập nhật trường biến thể
  const updateVariation = (index, field, value) => {
    const updatedVariations = form.variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    );
    setForm({ ...form, variations: updatedVariations });
  };

  // Add new attribute to a specific variation
  const addVariationAttribute = (index) => {
    const updatedVariations = form.variations.map((variation, i) =>
      i === index
        ? {
            ...variation,
            attributes: { ...variation.attributes, "": "" },
          }
        : variation
    );
    setForm({ ...form, variations: updatedVariations });
  };

  // Update variation attribute
  const updateVariationAttribute = (index, oldKey, newKey, newValue) => {
    const updatedVariations = form.variations.map((variation, i) => {
      if (i !== index) return variation;
      const newAttributes = { ...variation.attributes };
      if (oldKey !== newKey) {
        delete newAttributes[oldKey];
        newAttributes[newKey] = newValue;
      } else {
        newAttributes[oldKey] = newValue;
      }
      return { ...variation, attributes: newAttributes };
    });

    // Update SKU if attributes change
    const variation = updatedVariations[index];
    variation.sku = generateVariationSku(variation.attributes);
    setForm({ ...form, variations: updatedVariations });
  };

  const removeVariationAttribute = (index, attrKey) => {
    const updatedVariations = form.variations.map((variation, i) => {
      if (i !== index) return variation;
      const newAttributes = { ...variation.attributes };
      delete newAttributes[attrKey];
      return { ...variation, attributes: newAttributes };
    });

    // Update SKU after attribute removal
    const variation = updatedVariations[index];
    variation.sku = generateVariationSku(variation.attributes);
    setForm({ ...form, variations: updatedVariations });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setForm({ ...form, image: file });
      setValidationErrors((prev) => ({ ...prev, image: null }));

      // Tạo preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        image: ["Vui lòng chọn một hình ảnh hợp lệ (JPEG, PNG, JPG)."],
      }));
      setForm({ ...form, image: null });
      setImagePreview(null);
      e.target.value = "";
    }
  };

  const handleVariationFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      updateVariation(index, "image", file);
      setValidationErrors((prev) => ({
        ...prev,
        [`variations.${index}.image`]: null,
      }));

      // Tạo preview URL cho variation
      const reader = new FileReader();
      reader.onload = (event) => {
        setVariationPreviews((prev) => ({
          ...prev,
          [index]: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        [`variations.${index}.image`]: [
          "Vui lòng chọn một hình ảnh hợp lệ (JPEG, PNG, JPG).",
        ],
      }));
      updateVariation(index, "image", null);
      setVariationPreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        return newPreviews;
      });
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasRole(["admin", "mod"])) {
      setError("Chỉ quản trị viên hoặc người kiểm duyệt mới có thể tạo sách.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Token xác thực bị thiếu. Vui lòng đăng nhập.");
      return;
    }

    try {
      setLocalLoading(true);
      setValidationErrors({});

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("sku", form.sku);
      if (form.description) formData.append("description", form.description);
      formData.append("price", form.price);
      if (!isVariableProduct && form.stock_quantity)
        formData.append("stock_quantity", form.stock_quantity);
      if (form.category_id) formData.append("category_id", form.category_id);
      if (form.author_id) formData.append("author_id", form.author_id);
      if (form.publisher_id) formData.append("publisher_id", form.publisher_id);

      if (form.image && form.image instanceof File) {
        formData.append("image", form.image);
      }

      if (isVariableProduct) {
        if (
          form.variations.every(
            (v) => Object.keys(v.attributes || {}).length === 0
          )
        ) {
          setError("Cần ít nhất một biến thể có thuộc tính.");
          setLocalLoading(false);
          return;
        }
        form.variations.forEach((variation, index) => {
          const attributes = variation.attributes || {};
          if (Object.keys(attributes).length === 0) {
            console.warn(`Variation ${index} has empty attributes, skipping.`);
            return;
          }
          const attributesJson = JSON.stringify(attributes);
          formData.append(`variations[${index}][attributes]`, attributesJson);
          if (variation.price)
            formData.append(`variations[${index}][price]`, variation.price);
          formData.append(
            `variations[${index}][stock_quantity]`,
            variation.stock_quantity || "0"
          );
          if (variation.sku)
            formData.append(`variations[${index}][sku]`, variation.sku);
          if (variation.image && variation.image instanceof File) {
            formData.append(`variations[${index}][image]`, variation.image);
          }
        });
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.post("/books", formData, config);
      setBooks([...books, response.data.data]);

      // Hiển thị thông báo thành công
      showSuccess(
        "Tạo sách thành công!",
        `Sách "${form.title}" đã được tạo thành công và đã được thêm vào danh sách.`
      );

      setForm({
        title: "",
        sku: "",
        description: "",
        price: "",
        stock_quantity: "",
        category_id: "",
        author_id: "",
        publisher_id: "",
        image: null,
        variations: [],
      });
      document
        .querySelectorAll('input[type="file"]')
        .forEach((input) => (input.value = ""));
      setAttributes([{ name: "", values: "" }]);
      setIsVariableProduct(false);
      setAttributeErrors([]);
      setError(null);
      setImagePreview(null);
      setVariationPreviews({});
      navigate("/admin/books");
    } catch (err) {
      console.error("Lỗi gửi form:", err.response?.data);
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.error || {});
        setError("Vui lòng sửa các lỗi trong biểu mẫu.");
      } else if (err.response?.status === 401) {
        setError("Không được phép: Token xác thực không hợp lệ hoặc bị thiếu.");
      } else {
        const message = err.response?.data?.error || "Không thể tạo sách";
        setError(message);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  // Template JSX cho component BookCreate
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Tạo Sách Mới</h1>
            <p className="text-blue-100 mt-2">
              Thêm sách mới vào hệ thống quản lý
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            {!hasRole(["admin", "mod"]) && !error && (
              <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Chỉ quản trị viên hoặc người kiểm duyệt mới có thể tạo sách.
                </p>
              </div>
            )}

            {hasRole(["admin", "mod"]) && (
              <>
                {localLoading && <Loading />}
                {!localLoading && (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Product Type Selection */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Loại Sản Phẩm
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            !isVariableProduct || toggleProductType()
                          }
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            !isVariableProduct
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500"
                          }`}>
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full mr-3 ${
                                !isVariableProduct
                                  ? "bg-blue-500"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}></div>
                            <div className="text-left">
                              <div className="font-semibold">
                                Sản Phẩm Đơn Giản
                              </div>
                              <div className="text-sm opacity-75">
                                Sách với một phiên bản duy nhất
                              </div>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            isVariableProduct || toggleProductType()
                          }
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            isVariableProduct
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500"
                          }`}>
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full mr-3 ${
                                isVariableProduct
                                  ? "bg-purple-500"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}></div>
                            <div className="text-left">
                              <div className="font-semibold">
                                Sản Phẩm Biến Thể
                              </div>
                              <div className="text-sm opacity-75">
                                Sách với nhiều phiên bản khác nhau
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Thông Tin Cơ Bản
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tiêu Đề
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.title}
                            onChange={(e) =>
                              setForm({ ...form, title: e.target.value })
                            }
                            placeholder="Nhập tiêu đề sách"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200"
                          />
                          {validationErrors.title && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {validationErrors.title[0]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            SKU
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.sku}
                            onChange={(e) => {
                              const newSku = e.target.value;
                              setForm({
                                ...form,
                                sku: newSku,
                                variations: form.variations.map((v) => ({
                                  ...v,
                                  sku: newSku
                                    ? generateVariationSku(v.attributes, newSku)
                                    : "",
                                })),
                              });
                            }}
                            placeholder="Ví dụ: BOOK001"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200"
                          />
                          {validationErrors.sku && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {validationErrors.sku[0]}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mô Tả
                          </label>
                          <RichTextEditor
                            content={form.description}
                            onChange={(content) =>
                              setForm({ ...form, description: content })
                            }
                            placeholder="Nhập mô tả chi tiết về sách (tùy chọn)"
                          />
                          {validationErrors.description && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {validationErrors.description[0]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Pricing & Inventory */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        Giá & Tồn Kho
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Giá
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400">
                                ₫
                              </span>
                            </div>
                            <input
                              type="number"
                              value={form.price}
                              onChange={(e) =>
                                setForm({ ...form, price: e.target.value })
                              }
                              placeholder="0.00"
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          {validationErrors.price && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {validationErrors.price[0]}
                            </p>
                          )}
                        </div>
                        {!isVariableProduct && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Số lượng tồn kho
                              <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={form.stock_quantity}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    stock_quantity: e.target.value,
                                  })
                                }
                                placeholder="0"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200"
                                min="0"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  cuốn
                                </span>
                              </div>
                            </div>
                            {validationErrors.stock_quantity && (
                              <p className="text-red-500 text-sm mt-2 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {validationErrors.stock_quantity[0]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Category, Author & Publisher */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-purple-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        Phân Loại & Thông Tin
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Danh mục
                          </label>
                          <div className="relative">
                            <select
                              value={form.category_id}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  category_id: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200 appearance-none">
                              <option value="">Chọn danh mục (tùy chọn)</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                          {validationErrors.category_id && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {validationErrors.category_id[0]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tác giả
                          </label>
                          <div className="relative">
                            <select
                              value={form.author_id}
                              onChange={(e) =>
                                setForm({ ...form, author_id: e.target.value })
                              }
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200 appearance-none">
                              <option value="">Chọn tác giả (tùy chọn)</option>
                              {authors.map((author) => (
                                <option key={author.id} value={author.id}>
                                  {author.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                          {validationErrors.author_id && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {validationErrors.author_id[0]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nhà xuất bản
                          </label>
                          <div className="relative">
                            <select
                              value={form.publisher_id}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  publisher_id: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200 appearance-none">
                              <option value="">
                                Chọn nhà xuất bản (tùy chọn)
                              </option>
                              {publishers.map((pub) => (
                                <option key={pub.id} value={pub.id}>
                                  {pub.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                          {validationErrors.publisher_id && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {validationErrors.publisher_id[0]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Main Image Upload */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Hình Ảnh Chính
                        <span className="text-red-500 ml-1">*</span>
                      </h3>

                      {!imagePreview ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <label
                              htmlFor="main-image-upload"
                              className="cursor-pointer">
                              <span className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium">
                                Nhấp để tải lên
                              </span>
                              <span> hoặc kéo thả tệp vào đây</span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, JPEG tối đa 10MB
                          </p>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="flex items-start space-x-4">
                            <div className="relative group">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImagePreview(null);
                                    setForm({ ...form, image: null });
                                    document.querySelector(
                                      'input[type="file"]'
                                    ).value = "";
                                  }}
                                  className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                <div className="flex items-center">
                                  <svg
                                    className="w-5 h-5 text-green-500 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Hình ảnh đã được tải lên thành công
                                  </span>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                                  Bạn có thể thay đổi hình ảnh bằng cách nhấp
                                  vào nút thay đổi bên dưới
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview(null);
                                  setForm({ ...form, image: null });
                                  document.querySelector(
                                    'input[type="file"]'
                                  ).value = "";
                                }}
                                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                                Thay đổi hình ảnh
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {validationErrors.image && (
                        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {validationErrors.image[0]}
                          </p>
                        </div>
                      )}
                    </div>

                    {isVariableProduct && (
                      <div className="md:col-span-2">
                        {/* Attributes Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Thuộc Tính Sản Phẩm
                          </h3>

                          {attributes.length === 0 ? (
                            <div className="text-center py-8">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                Chưa có thuộc tính nào được thêm
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4 mb-6">
                              {attributes.map((attribute, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-semibold mr-2">
                                        #{index + 1}
                                      </span>
                                      Thuộc Tính {index + 1}
                                    </h4>
                                    <button
                                      type="button"
                                      onClick={() => removeAttribute(index)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors duration-200">
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tên Thuộc Tính
                                        <span className="text-red-500 ml-1">
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        value={attribute.name}
                                        onChange={(e) =>
                                          handleAttributeChange(
                                            index,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        placeholder="ví dụ: Định dạng"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200"
                                      />
                                      {attributeErrors[index]?.name && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center">
                                          <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path
                                              fillRule="evenodd"
                                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          {attributeErrors[index].name}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Giá Trị
                                        <span className="text-red-500 ml-1">
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        value={attribute.values}
                                        onChange={(e) =>
                                          handleAttributeChange(
                                            index,
                                            "values",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Phân cách bằng dấu phẩy (ví dụ: Bìa cứng,Bìa mềm)"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all duration-200"
                                      />
                                      {attributeErrors[index]?.values && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center">
                                          <svg
                                            className="w-4 h-4 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path
                                              fillRule="evenodd"
                                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          {attributeErrors[index].values}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={addAttribute}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              Thêm Thuộc Tính
                            </button>
                            {attributes.length > 0 && (
                              <button
                                type="button"
                                onClick={generateVariationsForm}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                  />
                                </svg>
                                Tạo Biến Thể
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {isVariableProduct && form.variations.length > 0 && (
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                          Biến Thể
                        </h3>
                        {form.variations.map((variation, index) => (
                          <div
                            key={index}
                            className="border p-4 mb-4 rounded-md bg-gray-50 dark:bg-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                                Biến Thể {index + 1}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeVariation(index)}
                                className="text-red-500 hover:text-red-700">
                                Xóa
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(variation.attributes).map(
                                ([attrName, attrValue], attrIndex) => (
                                  <div
                                    key={attrIndex}
                                    className="flex items-center">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={attrName}
                                        onChange={(e) =>
                                          updateVariationAttribute(
                                            index,
                                            attrName,
                                            e.target.value,
                                            attrValue
                                          )
                                        }
                                        placeholder="Tên thuộc tính"
                                        className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full"
                                      />
                                      <input
                                        type="text"
                                        value={attrValue}
                                        onChange={(e) =>
                                          updateVariationAttribute(
                                            index,
                                            attrName,
                                            attrName,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Giá trị thuộc tính"
                                        className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeVariationAttribute(
                                          index,
                                          attrName
                                        )
                                      }
                                      className="ml-2 text-red-500 hover:text-red-700">
                                      ×
                                    </button>
                                  </div>
                                )
                              )}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => addVariationAttribute(index)}
                                  className="text-blue-600 hover:text-blue-700 text-sm">
                                  + Thêm Thuộc Tính
                                </button>
                              </div>
                              <div>
                                <label className="text-gray-700 dark:text-gray-200">
                                  Giá
                                </label>
                                <input
                                  type="number"
                                  value={variation.price}
                                  onChange={(e) =>
                                    updateVariation(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Giá (tùy chọn)"
                                  className="mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full"
                                  min="0"
                                  step="0.01"
                                />
                                {validationErrors[
                                  `variations.${index}.price`
                                ] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      validationErrors[
                                        `variations.${index}.price`
                                      ][0]
                                    }
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="text-gray-700 dark:text-gray-200">
                                  Số Lượng Tồn Kho
                                  <span className="text-red-600 text-xs font-semibold">
                                    {" "}
                                    *
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  value={variation.stock_quantity}
                                  onChange={(e) =>
                                    updateVariation(
                                      index,
                                      "stock_quantity",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Số lượng tồn kho (ví dụ: 50)"
                                  className="mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full"
                                  min="0"
                                />
                                {validationErrors[
                                  `variations.${index}.stock_quantity`
                                ] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      validationErrors[
                                        `variations.${index}.stock_quantity`
                                      ][0]
                                    }
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="text-gray-700 dark:text-gray-200">
                                  SKU
                                </label>
                                <input
                                  type="text"
                                  value={variation.sku}
                                  onChange={(e) =>
                                    updateVariation(
                                      index,
                                      "sku",
                                      e.target.value
                                    )
                                  }
                                  placeholder="SKU biến thể (tự động tạo)"
                                  className="mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full"
                                />
                                {validationErrors[
                                  `variations.${index}.sku`
                                ] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      validationErrors[
                                        `variations.${index}.sku`
                                      ][0]
                                    }
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="text-gray-700 dark:text-gray-200">
                                  Hình Ảnh
                                </label>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/jpg"
                                  data-variation-index={index}
                                  onChange={(e) =>
                                    handleVariationFileChange(index, e)
                                  }
                                  className="mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full"
                                />
                                {variationPreviews[index] && (
                                  <div className="mt-2">
                                    <img
                                      src={variationPreviews[index]}
                                      alt={`Preview variation ${index + 1}`}
                                      className="w-24 h-24 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVariationPreviews((prev) => {
                                          const newPreviews = { ...prev };
                                          delete newPreviews[index];
                                          return newPreviews;
                                        });
                                        updateVariation(index, "image", null);
                                        const fileInputs =
                                          document.querySelectorAll(
                                            'input[type="file"]'
                                          );
                                        fileInputs.forEach((input) => {
                                          if (
                                            input.getAttribute(
                                              "data-variation-index"
                                            ) === index.toString()
                                          ) {
                                            input.value = "";
                                          }
                                        });
                                      }}
                                      className="mt-1 text-red-500 hover:text-red-700 text-sm block">
                                      Xóa ảnh
                                    </button>
                                  </div>
                                )}
                                {validationErrors[
                                  `variations.${index}.image`
                                ] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      validationErrors[
                                        `variations.${index}.image`
                                      ][0]
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addVariation}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                          Thêm Biến Thể
                        </button>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={localLoading}>
                        <span className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Tạo Sách
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCreate;
