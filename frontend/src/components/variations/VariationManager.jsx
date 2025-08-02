import React, { useState, useEffect } from 'react';
import { useVariation } from '../../contexts/VariationContext';
import { useAttribute } from '../../contexts/AttributeContext';
import { Modal, FormField } from '../admin';

const VariationManager = ({ bookId }) => {
  const {
    variations,
    getVariationsByBookId,
    createVariation,
    updateVariation,
    deleteVariation,
    bulkCreateVariations,
    generateSKU,
  } = useVariation();

  const { attributes } = useAttribute();

  const [bookVariations, setBookVariations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock_quantity: "",
    attributes: {},
  });

  const [bulkFormData, setBulkFormData] = useState({
    selectedAttributes: [],
    basePrice: "",
    baseStock: "",
  });

  const [errors, setErrors] = useState({});

  // Load variations when bookId changes
  useEffect(() => {
    if (bookId) {
      const bookVars = getVariationsByBookId(bookId);
      setBookVariations(bookVars);
    }
  }, [bookId, variations, getVariationsByBookId]);

  // Form validation
  const validateForm = (data) => {
    const newErrors = {};

    if (!data.name?.trim()) newErrors.name = "Name is required";
    if (!data.sku?.trim()) newErrors.sku = "SKU is required";
    if (!data.price || parseInt(data.price) <= 0)
      newErrors.price = "Valid price is required";
    if (data.stock_quantity === "" || parseInt(data.stock_quantity) < 0) {
      newErrors.stock_quantity = "Valid stock quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate variation name from attributes
  const generateVariationName = (attributes) => {
    const attrValues = Object.values(attributes).filter(Boolean);
    return attrValues.length > 0 ? attrValues.join(" - ") : "Default Variation";
  };

  // Handle create variation
  const handleCreate = async () => {
    if (!validateForm(formData)) return;

    setLoading(true);
    try {
      const variationData = {
        ...formData,
        book_id: bookId,
        price: parseInt(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
      };

      await createVariation(variationData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating variation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit variation
  const handleEdit = async () => {
    if (!validateForm(formData) || !selectedVariation) return;

    setLoading(true);
    try {
      const variationData = {
        ...formData,
        price: parseInt(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
      };

      await updateVariation(selectedVariation.id, variationData);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Error updating variation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete variation
  const handleDelete = async (variationId) => {
    if (!window.confirm("Are you sure you want to delete this variation?"))
      return;

    setLoading(true);
    try {
      await deleteVariation(variationId);
    } catch (error) {
      console.error("Error deleting variation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk create
  const handleBulkCreate = async () => {
    if (!bulkFormData.selectedAttributes.length || !bulkFormData.basePrice) {
      alert("Please select attributes and set base price");
      return;
    }

    setLoading(true);
    try {
      const combinations = generateCombinations(
        bulkFormData.selectedAttributes
      );
      const variations = combinations.map((combo) => ({
        book_id: bookId,
        name: generateVariationName(combo),
        sku: generateSKU(),
        price: parseInt(bulkFormData.basePrice),
        stock_quantity: parseInt(bulkFormData.baseStock) || 0,
        attributes: combo,
      }));

      await bulkCreateVariations(variations);
      setShowBulkModal(false);
      resetBulkForm();
    } catch (error) {
      console.error("Error bulk creating variations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate attribute combinations
  const generateCombinations = (selectedAttrs) => {
    if (!selectedAttrs.length) return [];

    const combinations = [{}];

    selectedAttrs.forEach((attr) => {
      const newCombinations = [];
      attr.options.forEach((option) => {
        combinations.forEach((combo) => {
          newCombinations.push({ ...combo, [attr.name]: option });
        });
      });
      combinations.splice(0, combinations.length, ...newCombinations);
    });

    return combinations;
  };

  // Reset forms
  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      price: "",
      stock_quantity: "",
      attributes: {},
    });
    setErrors({});
    setSelectedVariation(null);
  };

  const resetBulkForm = () => {
    setBulkFormData({
      selectedAttributes: [],
      basePrice: "",
      baseStock: "",
    });
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, sku: generateSKU() }));
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (variation) => {
    setSelectedVariation(variation);
    setFormData({
      name: variation.name,
      sku: variation.sku,
      price: variation.price.toString(),
      stock_quantity: variation.stock_quantity.toString(),
      attributes: variation.attributes || {},
    });
    setShowEditModal(true);
  };

  // Duplicate variation
  const duplicateVariation = (variation) => {
    setFormData({
      name: `${variation.name} (Copy)`,
      sku: generateSKU(),
      price: variation.price.toString(),
      stock_quantity: variation.stock_quantity.toString(),
      attributes: variation.attributes || {},
    });
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Book Variations</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-amber-300 rounded-md hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            Bulk Create
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            Add Variation
          </button>
        </div>
      </div>

      {/* Variations List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {bookVariations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No variations found. Create your first variation!
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bookVariations.map((variation) => (
              <li key={variation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {variation.name}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => duplicateVariation(variation)}
                          className="text-sm text-blue-600 hover:text-blue-800">
                          Duplicate
                        </button>
                        <button
                          onClick={() => openEditModal(variation)}
                          className="text-sm text-amber-600 hover:text-amber-800">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(variation.id)}
                          className="text-sm text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>SKU: {variation.sku}</span>
                      <span className="mx-2">•</span>
                      <span>Giá: {variation.price.toLocaleString('vi-VN')} ₫</span>
                      <span className="mx-2">•</span>
                      <span>Stock: {variation.stock_quantity}</span>
                    </div>
                    {variation.attributes &&
                      Object.keys(variation.attributes).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(variation.attributes).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {key}: {value}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Variation"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 disabled:opacity-50">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        }>
        <div className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            error={errors.name}
            required
          />

          <FormField
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sku: e.target.value }))
            }
            error={errors.sku}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              error={errors.price}
              required
            />

            <FormField
              label="Số lượng tồn kho"
              name="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stock_quantity: e.target.value,
                }))
              }
              error={errors.stock_quantity}
              required
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Variation"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 disabled:opacity-50">
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        }>
        <div className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            error={errors.name}
            required
          />

          <FormField
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sku: e.target.value }))
            }
            error={errors.sku}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              error={errors.price}
              required
            />

            <FormField
              label="Số lượng tồn kho"
              name="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stock_quantity: e.target.value,
                }))
              }
              error={errors.stock_quantity}
              required
            />
          </div>
        </div>
      </Modal>

      {/* Bulk Create Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Create Variations"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowBulkModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleBulkCreate}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 disabled:opacity-50">
              {loading ? "Creating..." : "Create Variations"}
            </button>
          </div>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Attributes
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attributes.map((attr) => (
                <label key={attr.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={bulkFormData.selectedAttributes.some(
                      (a) => a.id === attr.id
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkFormData((prev) => ({
                          ...prev,
                          selectedAttributes: [
                            ...prev.selectedAttributes,
                            attr,
                          ],
                        }));
                      } else {
                        setBulkFormData((prev) => ({
                          ...prev,
                          selectedAttributes: prev.selectedAttributes.filter(
                            (a) => a.id !== attr.id
                          ),
                        }));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {attr.name} ({attr.options.join(", ")})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Base Price"
              name="basePrice"
              type="number"
              step="0.01"
              min="0"
              value={bulkFormData.basePrice}
              onChange={(e) =>
                setBulkFormData((prev) => ({
                  ...prev,
                  basePrice: e.target.value,
                }))
              }
              required
            />

            <FormField
              label="Base Stock"
              name="baseStock"
              type="number"
              min="0"
              value={bulkFormData.baseStock}
              onChange={(e) =>
                setBulkFormData((prev) => ({
                  ...prev,
                  baseStock: e.target.value,
                }))
              }
            />
          </div>

          {bulkFormData.selectedAttributes.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                This will create{" "}
                {generateCombinations(bulkFormData.selectedAttributes).length}{" "}
                variations
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VariationManager;
