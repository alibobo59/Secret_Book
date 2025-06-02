import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Reusable FormField component for admin dashboard forms
 *
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.value - Current field value
 * @param {Function} props.onChange - Function to call when value changes
 * @param {string} props.error - Error message to display
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} props.inputProps - Additional props to pass to the input element
 */
const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
  inputProps = {},
}) => {
  const isTextarea = type === "textarea";
  const InputComponent = isTextarea ? "textarea" : "input";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <InputComponent
        type={isTextarea ? undefined : type}
        className={`w-full px-3 py-2 border ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={isTextarea ? 3 : undefined}
        {...inputProps}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
