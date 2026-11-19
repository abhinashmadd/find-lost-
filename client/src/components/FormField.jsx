import React from "react";

/**
 * Standardized, accessible form input component.
 * Supports text, email, password, date, tel, select, and textarea.
 * 
 * @param {Object} props
 * @param {string} props.id - HTML element id
 * @param {string} props.name - Form field name
 * @param {string} props.label - Human-readable label
 * @param {string} [props.type="text"] - Input type
 * @param {string|number} props.value - Controlled input value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.required=false] - Required validation flag
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.helpText] - Contextual help text below input
 * @param {Array<{value: string, label: string}|string>} [props.options] - Options for select element
 * @param {number} [props.rows=3] - Rows for textarea
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className=""] - Extra wrapper class
 */
export default function FormField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  helpText = "",
  options = [],
  rows = 3,
  disabled = false,
  className = "",
}) {
  const fieldId = id || name;

  const renderInput = () => {
    if (type === "textarea") {
      return (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          disabled={disabled}
          className={`form-textarea ${error ? "input-error" : ""}`}
        />
      );
    }

    if (type === "select") {
      return (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`form-input ${error ? "input-error" : ""}`}
        >
          {options.map((opt) => {
            const optVal = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-input ${error ? "input-error" : ""}`}
      />
    );
  };

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label className="form-label" htmlFor={fieldId}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      {renderInput()}

      {helpText && !error && <span className="form-help-text">{helpText}</span>}
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
}
