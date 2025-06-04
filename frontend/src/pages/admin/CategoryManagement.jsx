import React, { useState, useEffect } from "react";
import { useBook } from "../../contexts/BookContext";
import { useAuth } from "../../contexts/AuthContext";
import { AlertCircle, Save } from "lucide-react";
import {
  PageHeader,
  Table,
  ActionButtons,
  Modal,
  FormField,
} from "../../components/admin";
import { api } from "../../services/api";

const CategoryManagement = () => {
  const { categories, loading, error: bookError } = useBook();
  const { user } = useAuth();
  const [localCategories, setLocalCategories] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const canManageCategories =
    user && (user.role === "admin" || user.role === "mod");

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const validateForm = (category) => {
    const errors = {};
    if (!category.name.trim()) {
      errors.name = "Category name is required";
    }
    if (!category.description.trim()) {
      errors.description = "Category description is required";
    }
    return errors;
  };

  const handleAddCategory = async () => {
    const errors = validateForm(newCategory);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await api.post("/categories", newCategory);
      setLocalCategories([...localCategories, response.data.category]);
      setNewCategory({ name: "", description: "" });
      setFormErrors({});
      setIsAddModalOpen(false);
      setApiError(null);
    } catch (err) {
      setApiError(err.response?.data?.error || "Failed to add category");
    }
  };

  const handleEditCategory = async () => {
    const errors = validateForm(currentCategory);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await api.put(
        `/categories/${currentCategory.id}`,
        currentCategory
      );
      setLocalCategories(
        localCategories.map((cat) =>
          cat.id === currentCategory.id ? response.data.category : cat
        )
      );
      setCurrentCategory(null);
      setFormErrors({});
      setIsEditModalOpen(false);
      setApiError(null);
    } catch (err) {
      setApiError(err.response?.data?.error || "Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await api.delete(`/categories/${currentCategory.id}`);
      setLocalCategories(
        localCategories.filter((cat) => cat.id !== currentCategory.id)
      );
      setCurrentCategory(null);
      setIsDeleteModalOpen(false);
      setApiError(null);
    } catch (err) {
      setApiError(err.response?.data?.error || "Failed to delete category");
    }
  };

  const openEditModal = (category) => {
    setCurrentCategory({ ...category });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    { id: "id", label: "ID", sortable: false },
    { id: "name", label: "Name", sortable: false },
    { id: "slug", label: "Slug", sortable: false },
    { id: "description", label: "Description", sortable: false },
    { id: "created_by", label: "Created By", sortable: false },
    { id: "actions", label: "Actions", sortable: false },
  ];

  if (loading) {
    return <div className="p-4">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Management"
        onAddNew={
          canManageCategories
            ? () => {
                setNewCategory({ name: "", description: "" });
                setFormErrors({});
                setIsAddModalOpen(true);
              }
            : null
        }
        addNewLabel={canManageCategories ? "Add New Category" : null}
      />

      {(apiError || bookError) && (
        <div className="p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
          {apiError || bookError}
        </div>
      )}

      <Table
        columns={columns}
        data={localCategories}
        renderRow={(category) => (
          <tr
            key={category.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {category.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {category.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {category.slug}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
              {category.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {category.creator?.name || "Unknown"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              {canManageCategories && (
                <ActionButtons
                  onEdit={() => openEditModal(category)}
                  onDelete={() => openDeleteModal(category)}
                />
              )}
            </td>
          </tr>
        )}
      />

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
              onClick={handleAddCategory}>
              <Save className="h-4 w-4 mr-2" />
              Save Category
            </button>
          </div>
        }>
        <div className="space-y-4">
          <FormField
            label="Category Name"
            type="text"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            error={formErrors.name}
            required
          />
          <FormField
            label="Description"
            type="textarea"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
            error={formErrors.description}
            required
          />
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
              onClick={handleEditCategory}>
              <Save className="h-4 w-4 mr-2" />
              Update Category
            </button>
          </div>
        }>
        {currentCategory && (
          <div className="space-y-4">
            <FormField
              label="Category Name"
              type="text"
              value={currentCategory.name}
              onChange={(e) =>
                setCurrentCategory({
                  ...currentCategory,
                  name: e.target.value,
                })
              }
              error={formErrors.name}
              required
            />
            <FormField
              label="Description"
              type="textarea"
              value={currentCategory.description}
              onChange={(e) =>
                setCurrentCategory({
                  ...currentCategory,
                  description: e.target.value,
                })
              }
              error={formErrors.description}
              required
            />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              onClick={handleDeleteCategory}>
              Delete Category
            </button>
          </div>
        }>
        {currentCategory && (
          <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>
              Are you sure you want to delete the category
              <span className="font-semibold"> {currentCategory.name}</span>?
              This action cannot be undone and may affect books assigned to this
              category.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryManagement;
