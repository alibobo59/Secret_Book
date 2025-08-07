import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBook } from "../../contexts/BookContext";
import { api } from "../../services/api";
import { Loading, RichTextEditor } from "../../components/admin";

const BookEdit = () => {
  const { loading, user, hasRole } = useOutletContext();
  const { getToken } = useAuth();
  const { id } = useParams();
  const { books, categories, authors, publishers, setBooks } = useBook();
  const navigate = useNavigate();
  
  // Local error state
  const [error, setError] = useState(null);

  // --- START: NEW STATE MANAGEMENT to handle variations ---
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
    image: null, // This will hold a new file if selected
    variations: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  // --- END: NEW STATE MANAGEMENT ---

  useEffect(() => {
    fetchBook();
  }, [id]);

  // --- START: MODIFIED fetchBook to handle variations ---
  const fetchBook = async () => {
    setLocalLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setError("Token xác thực bị thiếu. Vui lòng đăng nhập.");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await api.get(`/books/${id}`, config);
      const bookData = response.data.data || response.data;

      // Populate form with fetched data
      setForm({
        title: bookData.title || "",
        sku: bookData.sku || "",
        description: bookData.description || "",
        price: bookData.price?.toString() || "",
        stock_quantity: bookData.stock_quantity?.toString() || "",
        category_id: bookData.category_id?.toString() || "",
        author_id: bookData.author_id?.toString() || "",
        publisher_id: bookData.publisher_id?.toString() || "",
        image: null, // Reset image file input
        variations: bookData.variations || [], // Populate variations
      });

      // Determine if it's a variable product based on fetched data
      if (bookData.variations && bookData.variations.length > 0) {
        setIsVariableProduct(true);
      } else {
        setIsVariableProduct(false);
      }

      setError(null);
    } catch (err) {
      setError("Không thể tải thông tin sách: " + (err.message || err));
      console.error("Fetch error:", err);
    } finally {
      setLocalLoading(false);
    }
  };
  // --- END: MODIFIED fetchBook ---

  // --- START: COPIED/NEW HANDLER FUNCTIONS from BookCreate.js ---
  const toggleProductType = () => {
    const newIsVariable = !isVariableProduct;
    setIsVariableProduct(newIsVariable);
    if (newIsVariable) {
      // Switching to Variable
      setForm({
        ...form,
        stock_quantity: "",
        variations: form.variations.length > 0 ? form.variations : [],
      });
    } else {
      // Switching to Simple
      setForm({ ...form, variations: [] });
    }
    setAttributes([{ name: "", values: "" }]);
    setAttributeErrors([]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = attributes.map((attr, i) =>
      i === index ? { ...attr, [field]: value } : attr
    );
    setAttributes(updatedAttributes);
    validateAttributes(updatedAttributes);
  };

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

  const addAttribute = () =>
    setAttributes([...attributes, { name: "", values: "" }]);
  const removeAttribute = (index) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
    validateAttributes(updatedAttributes);
  };

  const generateVariationSku = (attributes, parentSku = form.sku) => {
    if (!parentSku) return "";
    const attrValues = Object.values(attributes)
      .map((value) => value.toString().replace(/\s+/g, ""))
      .join("-");
    return attrValues ? `${parentSku}-${attrValues}` : `${parentSku}-NEW`;
  };

  const generateVariationsForm = () => {
    if (!validateAttributes(attributes)) {
      setError("Vui lòng sửa lỗi thuộc tính trước khi tạo biến thể.");
      return;
    }
    const validAttributes = attributes.filter(
      (attr) => attr.name.trim() && attr.values.trim()
    );
    if (validAttributes.length === 0) {
      setError("Vui lòng định nghĩa ít nhất một thuộc tính hợp lệ với giá trị.");
      return;
    }
    const attributeValues = validAttributes.map((attr) => ({
      name: attr.name.trim(),
      values: attr.values
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    }));
    const newVariations = [];
    const generateCombinations = (attrIndex = 0, current = {}) => {
      if (attrIndex >= attributeValues.length) {
        newVariations.push({
          attributes: { ...current },
          price: "",
          stock_quantity: "",
          sku: generateVariationSku(current),
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
    setForm({ ...form, variations: [...form.variations, ...newVariations] });
    setError(null);
  };

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

  const removeVariation = (index) => {
    setForm({
      ...form,
      variations: form.variations.filter((_, i) => i !== index),
    });
  };

  const updateVariation = (index, field, value) => {
    const updatedVariations = form.variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    );
    setForm({ ...form, variations: updatedVariations });
  };

  const addVariationAttribute = (index) => {
    const updatedVariations = form.variations.map((variation, i) =>
      i === index
        ? { ...variation, attributes: { ...variation.attributes, "": "" } }
        : variation
    );
    setForm({ ...form, variations: updatedVariations });
  };

  const updateVariationAttribute = (index, oldKey, newKey, newValue) => {
    const updatedVariations = form.variations.map((variation, i) => {
      if (i !== index) return variation;
      const newAttributes = { ...variation.attributes };
      if (oldKey !== newKey) {
        delete newAttributes[oldKey];
      }
      newAttributes[newKey] = newValue;
      const newSku = generateVariationSku(newAttributes);
      return { ...variation, attributes: newAttributes, sku: newSku };
    });
    setForm({ ...form, variations: updatedVariations });
  };

  const removeVariationAttribute = (index, attrKey) => {
    const updatedVariations = form.variations.map((variation, i) => {
      if (i !== index) return variation;
      const newAttributes = { ...variation.attributes };
      delete newAttributes[attrKey];
      const newSku = generateVariationSku(newAttributes);
      return { ...variation, attributes: newAttributes, sku: newSku };
    });
    setForm({ ...form, variations: updatedVariations });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleVariationFileChange = (index, e) => {
    updateVariation(index, "image", e.target.files[0]);
  };
  // --- END: COPIED/NEW HANDLER FUNCTIONS ---

  // --- START: MODIFIED handleSubmit to send variation data ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasRole(["admin"])) {
      setError("Chỉ quản trị viên mới có thể chỉnh sửa sách.");
      return;
    }

    setLocalLoading(true);
    const token = getToken();
    if (!token) {
      setError("Token xác thực bị thiếu. Vui lòng đăng nhập.");
      setLocalLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("_method", "PUT"); // Method spoofing for Laravel

      // Append main book data
      formData.append("title", form.title);
      formData.append("sku", form.sku);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category_id", form.category_id);
      formData.append("author_id", form.author_id);
      formData.append("publisher_id", form.publisher_id);

      // Append main image only if a new one was selected
      if (form.image && form.image instanceof File) {
        formData.append("image", form.image);
      }

      // Handle simple vs variable product data
      if (isVariableProduct) {
        form.variations.forEach((variation, index) => {
          // IMPORTANT: Send ID for existing variations to update them
          if (variation.id) {
            formData.append(`variations[${index}][id]`, variation.id);
          }
          const attributesJson = JSON.stringify(variation.attributes || {});
          formData.append(`variations[${index}][attributes]`, attributesJson);
          formData.append(`variations[${index}][price]`, variation.price || "");
          formData.append(
            `variations[${index}][stock_quantity]`,
            variation.stock_quantity || "0"
          );
          formData.append(`variations[${index}][sku]`, variation.sku || "");

          // Append variation image only if it's a new file
          if (variation.image && variation.image instanceof File) {
            formData.append(`variations[${index}][image]`, variation.image);
          }
        });
      } else {
        // For simple product, send stock_quantity
        formData.append("stock_quantity", form.stock_quantity);
      }

      setValidationErrors({});

      // The API call is a POST because of method spoofing. The interceptor will handle headers.
      const response = await api.post(`/books/${id}`, formData);

      // Update global state and navigate
      setBooks(
        books.map((book) =>
          book.id === parseInt(id) ? response.data.data : book
        )
      );
      setError(null);
      navigate("/admin/books");
    } catch (err) {
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.error || {});
        setError("Vui lòng sửa các lỗi trong form.");
      } else {
        const message = err.response?.data?.error || "Không thể cập nhật sách";
        setError(message);
      }
    } finally {
      setLocalLoading(false);
    }
  };
  // --- END: MODIFIED handleSubmit ---

  if (loading) {
    return <Loading />;
  }

  // --- START: NEW JSX, copied from BookCreate and adapted for Edit ---
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Chỉnh Sửa Sách
      </h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {!hasRole(["admin"]) && !error && (
        <p className="text-red-500 text-sm mb-16">
          Chỉ quản trị viên mới có thể chỉnh sửa sách.
        </p>
      )}
      {hasRole(["admin"]) && (
        <>
          {localLoading && <Loading />}
          {!localLoading && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Type Toggle */}
              <div className="md:col-span-2">
                <label className="text-gray-700 dark:text-gray-200 font-semibold">
                  Loại Sản Phẩm
                </label>
                <div className="flex space-x-4 mt-2">
                  <button
                    type="button"
                    onClick={toggleProductType}
                    className={`px-4 py-2 rounded-md ${
                      !isVariableProduct
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}>
                    Sản Phẩm Đơn Giản
                  </button>
                  <button
                    type="button"
                    onClick={toggleProductType}
                    className={`px-4 py-2 rounded-md ${
                      isVariableProduct
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}>
                    Sản Phẩm Biến Thể
                  </button>
                </div>
              </div>

              {/* Basic Book Fields */}
              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  Tiêu Đề <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 p-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.title[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  SKU <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="mt-1 p-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {validationErrors.sku && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.sku[0]}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-gray-700 dark:text-gray-200">
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
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.description[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  Giá <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  min="0"
                  step="0.01"
                  className="mt-1 p-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.price[0]}
                  </p>
                )}
              </div>
              {!isVariableProduct && (
                <div>
                  <label className="text-gray-700 dark:text-gray-200">
                    Số lượng tồn kho <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) =>
                      setForm({ ...form, stock_quantity: e.target.value })
                    }
                    min="0"
                    className="mt-1 p-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                  {validationErrors.stock_quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.stock_quantity[0]}
                    </p>
                  )}
                </div>
              )}
              {/* Select Fields and Image */}
              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  Danh Mục
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className="mt-1 p-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">Chọn Danh Mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  Tác Giả
                </label>
                <select
                  value={form.author_id}
                  onChange={(e) =>
                      setForm({ ...form, author_id: e.target.value })
                    }
                    className="mt-1 p-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">Chọn Tác Giả</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  Nhà Xuất Bản
                </label>
                <select
                  value={form.publisher_id}
                  onChange={(e) =>
                      setForm({ ...form, publisher_id: e.target.value })
                    }
                    className="mt-1 p-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">Chọn Nhà Xuất Bản</option>
                  {publishers.map((pub) => (
                    <option key={pub.id} value={pub.id}>
                      {pub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  Hình Ảnh
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg"
                  className="mt-1 p-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tải lên hình ảnh mới để thay thế hình ảnh hiện tại.
                </p>
                {validationErrors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.image[0]}
                  </p>
                )}
              </div>

              {/* Attributes Section */}
              {isVariableProduct && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                    Thuộc Tính
                  </h3>
                  {attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="border p-4 mb-4 rounded-md bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-gray-700 dark:text-gray-200">Thuộc Tính {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeAttribute(index)}
                          className="text-red-500 hover:text-red-700">
                          Xóa
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-700 dark:text-gray-200">
                            Tên <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={attr.name}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="ví dụ: Định dạng"
                            className="mt-1 p-2 border rounded-md w-full dark:bg-gray-600 dark:text-white dark:border-gray-500"
                          />
                          {attributeErrors[index]?.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {attributeErrors[index].name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-gray-700 dark:text-gray-200">
                            Giá Trị <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={attr.values}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "values",
                                e.target.value
                              )
                            }
                            placeholder="ví dụ: Bìa cứng, Bìa mềm"
                            className="mt-1 p-2 border rounded-md w-full dark:bg-gray-600 dark:text-white dark:border-gray-500"
                          />
                          {attributeErrors[index]?.values && (
                            <p className="text-red-500 text-sm mt-1">
                              {attributeErrors[index].values}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2">
                    Thêm Thuộc Tính
                  </button>
                  <button
                    type="button"
                    onClick={generateVariationsForm}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Tạo Biến Thể
                  </button>
                </div>
              )}

              {/* Variations Section */}
              {isVariableProduct && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                    Biến Thể
                  </h3>
                  {form.variations.map((variation, index) => (
                    <div
                      key={variation.id || index}
                      className="border p-4 mb-4 rounded-md bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-gray-700 dark:text-gray-200">Biến Thể</h4>
                        <button
                          type="button"
                          onClick={() => removeVariation(index)}
                          className="text-red-500 hover:text-red-700">
                          Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(variation.attributes).map(
                          ([key, val]) => (
                            <div
                              key={key}
                              className="flex items-center md:col-span-2">
                              <span className="font-semibold mr-2">{key}:</span>{" "}
                              {val.toString()}
                            </div>
                          )
                        )}
                        <div>
                          <label className="text-gray-700 dark:text-gray-200">Giá</label>
                          <input
                            type="number"
                            value={variation.price}
                            onChange={(e) =>
                              updateVariation(index, "price", e.target.value)
                            }
                            placeholder="Để trống để sử dụng giá gốc"
                             className="mt-1 p-2 border rounded-md w-full dark:bg-gray-600 dark:text-white dark:border-gray-500"
                          />
                          {validationErrors[`variations.${index}.price`] && (
                            <p className="text-red-500 text-sm">
                              {validationErrors[`variations.${index}.price`][0]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-gray-700 dark:text-gray-200">
                            Số Lượng Tồn Kho <span className="text-red-600">*</span>
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
                             className="mt-1 p-2 border rounded-md w-full dark:bg-gray-600 dark:text-white dark:border-gray-500"
                          />
                          {validationErrors[
                            `variations.${index}.stock_quantity`
                          ] && (
                            <p className="text-red-500 text-sm">
                              {
                                validationErrors[
                                  `variations.${index}.stock_quantity`
                                ][0]
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-gray-700 dark:text-gray-200">SKU</label>
                          <input
                            type="text"
                            value={variation.sku}
                            onChange={(e) =>
                               updateVariation(index, "sku", e.target.value)
                             }
                             className="mt-1 p-2 border rounded-md w-full dark:bg-gray-600 dark:text-white dark:border-gray-500"
                          />
                          {validationErrors[`variations.${index}.sku`] && (
                            <p className="text-red-500 text-sm">
                              {validationErrors[`variations.${index}.sku`][0]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-gray-700 dark:text-gray-200">Hình Ảnh</label>
                          <input
                            type="file"
                            onChange={(e) =>
                               handleVariationFileChange(index, e)
                             }
                             className="mt-1 p-2 border rounded-md w-full dark:bg-gray-600 dark:text-white dark:border-gray-500"
                          />
                          {validationErrors[`variations.${index}.image`] && (
                            <p className="text-red-500 text-sm">
                              {validationErrors[`variations.${index}.image`][0]}
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
                    Thêm Biến Thể Thủ Công
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 md:col-span-2"
                disabled={localLoading}>
                Cập Nhật Sách
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
  // --- END: NEW JSX ---
};

export default BookEdit;
