import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBook } from "../../contexts/BookContext";
import { api } from "../../services/api";
import { Loading } from "../../components/admin";

const BookCreate = () => {
  const { loading, error, setError } = useOutletContext();
  const { user, getToken, hasRole } = useAuth();
  const { categories, authors, publishers, books, setBooks } = useBook();
  const navigate = useNavigate();

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

  // Toggle between simple and variable product
  const toggleProductType = () => {
    setIsVariableProduct(!isVariableProduct);
    setForm({ ...form, variations: [], stock_quantity: "" });
    setAttributes([{ name: "", values: "" }]);
    setAttributeErrors([]);
  };

  // Handle attribute changes
  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = attributes.map((attr, i) =>
      i === index ? { ...attr, [field]: value } : attr
    );
    setAttributes(updatedAttributes);
    validateAttributes(updatedAttributes);
  };

  // Validate attributes
  const validateAttributes = (attrs) => {
    const errors = [];
    const names = attrs.map((attr) => attr.name.trim().toLowerCase());
    attrs.forEach((attr, index) => {
      const err = {};
      if (!attr.name.trim()) {
        err.name = "Attribute name is required.";
      } else if (
        names.filter((name) => name === attr.name.trim().toLowerCase()).length >
        1
      ) {
        err.name = "Duplicate attribute name.";
      }
      if (!attr.values.trim()) {
        err.values = "Attribute values are required.";
      }
      if (Object.keys(err).length > 0) {
        errors[index] = err;
      }
    });
    setAttributeErrors(errors);
    return errors.length === 0;
  };

  // Add new attribute
  const addAttribute = () => {
    setAttributes([...attributes, { name: "", values: "" }]);
  };

  // Remove attribute
  const removeAttribute = (index) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
    validateAttributes(updatedAttributes);
  };

  // Generate variations form based on attributes
  const generateVariationsForm = () => {
    if (!validateAttributes(attributes)) {
      setError("Please fix attribute errors before generating variations.");
      return;
    }

    const validAttributes = attributes.filter(
      (attr) => attr.name.trim() && attr.values.trim()
    );
    if (validAttributes.length === 0) {
      setError("Please define at least one valid attribute with values.");
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

  // Generate variation SKU dynamically
  const generateVariationSku = (attributes, parentSku = form.sku) => {
    if (!parentSku) return "";
    const attrValues = Object.values(attributes)
      .map((value) => value.replace(/\s+/g, ""))
      .join("-");
    return attrValues ? `${parentSku}-${attrValues}` : `${parentSku}-NEW`;
  };

  // Add new variation manually
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

  // Remove a variation
  const removeVariation = (index) => {
    setForm({
      ...form,
      variations: form.variations.filter((_, i) => i !== index),
    });
  };

  // Update a variation field
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
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        image: ["Please select a valid image (JPEG, PNG, JPG)."],
      }));
      setForm({ ...form, image: null });
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
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        [`variations.${index}.image`]: [
          "Please select a valid image (JPEG, PNG, JPG).",
        ],
      }));
      updateVariation(index, "image", null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasRole(["admin", "mod"])) {
      setError("Only admins or moderators can create books.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Authentication token is missing. Please log in.");
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
          setError("At least one variation with attributes is required.");
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
      navigate("/admin/books");
    } catch (err) {
      console.error("Submission error:", err.response?.data);
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.error || {});
        setError("Please correct the form errors.");
      } else if (err.response?.status === 401) {
        setError("Unauthorized: Invalid or missing authentication token.");
      } else {
        const message = err.response?.data?.error || "Failed to create book";
        setError(message);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Create Book
      </h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {!hasRole(["admin", "mod"]) && !error && (
        <p className="text-red-500 text-sm mb-16">
          Only admins or moderators can create books.
        </p>
      )}
      {hasRole(["admin", "mod"]) && (
        <>
          {localLoading && <Loading />}
          {!localLoading && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ... other form fields are unchanged ... */}
              {/* No changes needed above this point */}

              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  // *** FIX: Removed the key prop ***
                  className="mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full"
                />
                {validationErrors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.image[0]}
                  </p>
                )}
              </div>

              {isVariableProduct && (
                <div className="md:col-span-2">
                  {/* ... attributes section is unchanged ... */}
                </div>
              )}

              {isVariableProduct && form.variations.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Variations
                  </h3>
                  {form.variations.map((variation, index) => (
                    <div
                      key={index} // This key on the parent div is correct and necessary!
                      className="border p-4 mb-4 rounded-md bg-gray-50 dark:bg-gray-700">
                      {/* ... other variation fields are unchanged ... */}

                      <div>
                        <label className="text-gray-700 dark:text-gray-200">
                          Image
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) => handleVariationFileChange(index, e)}
                          // *** FIX: Removed the key prop ***
                          className="mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full"
                        />
                        {validationErrors[`variations.${index}.image`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors[`variations.${index}.image`][0]}
                          </p>
                        )}
                      </div>

                      {/* ... other variation fields are unchanged ... */}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariation}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Add Variation
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 md:col-span-2"
                disabled={localLoading}>
                Create Book
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default BookCreate;
