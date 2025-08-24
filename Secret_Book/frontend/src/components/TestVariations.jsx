import React, { useState } from 'react';
import { api } from '../services/api';

const TestVariations = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testCreateProductWithVariations = async () => {
    setLoading(true);
    setResult('');

    try {
      // Giả lập dữ liệu như trong BookCreate.jsx
      const formData = new FormData();
      formData.append('title', 'Test Product With Variations');
      formData.append('sku', 'TEST-PRODUCT-' + Date.now());
      formData.append('description', 'Test description');
      formData.append('price', '100000');
      formData.append('category_id', '1');
      formData.append('author_id', '1');
      formData.append('publisher_id', '1');

      // Thêm variations
      const variations = [
        {
          attributes: { 'Size': 'S', 'Color': 'Red' },
          price: '95000',
          stock_quantity: '10',
          sku: 'TEST-S-RED-' + Date.now()
        },
        {
          attributes: { 'Size': 'M', 'Color': 'Blue' },
          price: '105000',
          stock_quantity: '15',
          sku: 'TEST-M-BLUE-' + Date.now()
        }
      ];

      variations.forEach((variation, index) => {
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
      });

      // Log FormData để debug
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      // Giả lập token (thay thế bằng token thực tế)
      const token = localStorage.getItem('token');
      if (!token) {
        setResult('Error: No authentication token found. Please login first.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.post('/books', formData, config);
      setResult(`Success: Product created successfully!\nResponse: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response) {
        setResult(`Error ${error.response.status}: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        setResult(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testFormDataStructure = () => {
    const formData = new FormData();
    formData.append('title', 'Test Product');
    formData.append('sku', 'TEST-SKU');
    
    const testVariations = [
      {
        attributes: { 'Size': 'S', 'Color': 'Red' },
        price: '95000',
        stock_quantity: '10',
        sku: 'TEST-S-RED'
      }
    ];

    testVariations.forEach((variation, index) => {
      const attributesJson = JSON.stringify(variation.attributes);
      formData.append(`variations[${index}][attributes]`, attributesJson);
      formData.append(`variations[${index}][price]`, variation.price);
      formData.append(`variations[${index}][stock_quantity]`, variation.stock_quantity);
      formData.append(`variations[${index}][sku]`, variation.sku);
    });

    let output = 'FormData structure:\n';
    for (let [key, value] of formData.entries()) {
      output += `${key}: ${value}\n`;
    }
    
    setResult(output);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Test Product Variations</h2>
      
      <div className="space-y-4">
        <button
          onClick={testFormDataStructure}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test FormData Structure
        </button>
        
        <button
          onClick={testCreateProductWithVariations}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Test Create Product with Variations'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestVariations;