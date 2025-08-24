import React, { useState } from 'react';
import { useAttribute } from '../../contexts/AttributeContext';
import { PageHeader, Table, ActionButtons, Modal, FormField, StatCard } from '../../components/admin';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Tag,
  List,
  Type,
  ToggleLeft,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const AttributeManagement = () => {
  const {
    attributes,
    loading,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  } = useAttribute();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'select',
    required: false,
    options: [''],
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Attribute name is required';
    }
    
    if (formData.type === 'select' && formData.options.filter(opt => opt.trim()).length < 2) {
      newErrors.options = 'At least 2 options are required for select type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      const attributeData = {
        ...formData,
        options: formData.type === 'select' ? formData.options.filter(opt => opt.trim()) : [],
      };
      
      await createAttribute(attributeData);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create attribute:', error);
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    
    try {
      const attributeData = {
        ...formData,
        options: formData.type === 'select' ? formData.options.filter(opt => opt.trim()) : [],
      };
      
      await updateAttribute(selectedAttribute.id, attributeData);
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update attribute:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAttribute(selectedAttribute.id);
      setIsDeleteModalOpen(false);
      setSelectedAttribute(null);
    } catch (error) {
      console.error('Failed to delete attribute:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'select',
      required: false,
      options: [''],
    });
    setErrors({});
    setSelectedAttribute(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (attribute) => {
    setSelectedAttribute(attribute);
    setFormData({
      name: attribute.name,
      type: attribute.type,
      required: attribute.required,
      options: attribute.options.length > 0 ? attribute.options : [''],
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (attribute) => {
    setSelectedAttribute(attribute);
    setIsDeleteModalOpen(true);
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const updateOption = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt),
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'type', label: 'Type', sortable: true },
    { id: 'required', label: 'Required', sortable: false },
    { id: 'options', label: 'Options', sortable: false },
    { id: 'createdAt', label: 'Created', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'select':
        return <List className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'boolean':
        return <ToggleLeft className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'select':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'text':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'boolean':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Attribute Management"
        onAddNew={openCreateModal}
        addNewLabel="Create Attribute"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Tag className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          title="Total Attributes"
          value={attributes.length}
        />
        <StatCard
          icon={<List className="h-6 w-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          title="Select Attributes"
          value={attributes.filter(attr => attr.type === 'select').length}
        />
        <StatCard
          icon={<AlertCircle className="h-6 w-6" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          title="Required Attributes"
          value={attributes.filter(attr => attr.required).length}
        />
      </div>

      {/* Attributes Table */}
      <Table
        columns={columns}
        data={attributes}
        renderRow={(attribute) => (
          <tr key={attribute.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              <div className="flex items-center gap-2">
                {getTypeIcon(attribute.type)}
                {attribute.name}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(attribute.type)}`}>
                {attribute.type}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                attribute.required 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {attribute.required ? 'Required' : 'Optional'}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
              {attribute.type === 'select' ? (
                <div className="max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {attribute.options.slice(0, 3).map((option, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {option}
                      </span>
                    ))}
                    {attribute.options.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        +{attribute.options.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {new Date(attribute.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <ActionButtons
                onEdit={() => openEditModal(attribute)}
                onDelete={() => openDeleteModal(attribute)}
              />
            </td>
          </tr>
        )}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        title={`${isCreateModalOpen ? 'Create' : 'Edit'} Attribute`}
        footer={
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
              onClick={isCreateModalOpen ? handleCreate : handleEdit}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isCreateModalOpen ? 'Create' : 'Update')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Attribute Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
            placeholder="e.g., Format, Edition, Language"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="select">Select (Dropdown)</option>
              <option value="text">Text Input</option>
              <option value="boolean">Boolean (Yes/No)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="required" className="text-sm text-gray-700 dark:text-gray-300">
              Required attribute
            </label>
          </div>

          {formData.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                    {formData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 px-3 py-2 text-amber-600 hover:text-amber-700 border border-amber-300 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              </div>
              {errors.options && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.options}
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Attribute"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Attribute'}
            </button>
          </div>
        }
      >
        <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>
            Are you sure you want to delete the attribute{' '}
            <span className="font-semibold">"{selectedAttribute?.name}"</span>? This action cannot be undone and may affect existing book variations.
          </span>
        </div>
      </Modal>
    </div>
  );
};

export default AttributeManagement;