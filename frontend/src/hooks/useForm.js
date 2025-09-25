import { useState, useCallback } from "react";

export const useForm = (initialValues, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value) => {
      if (!validationRules[name]) return null;

      const rules = validationRules[name];

      // Required validation
      if (rules.required && (!value || value.toString().trim() === "")) {
        return rules.required === true ? `${name} est requis` : rules.required;
      }

      // Min length validation
      if (rules.minLength && value && value.length < rules.minLength) {
        return `${name} doit contenir au moins ${rules.minLength} caractères`;
      }

      // Max length validation
      if (rules.maxLength && value && value.length > rules.maxLength) {
        return `${name} ne peut pas dépasser ${rules.maxLength} caractères`;
      }

      // Custom validation
      if (rules.validate && typeof rules.validate === "function") {
        const result = rules.validate(value, values);
        if (result !== true && typeof result === "string") {
          return result;
        }
      }

      return null;
    },
    [validationRules, values]
  );

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors]
  );

  const setTouchedField = useCallback(
    (name) => {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate field when it loses focus
      const error = validateField(name, values[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField, values]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    return isValid;
  }, [validateField, values, validationRules]);

  const resetForm = useCallback(
    (newInitialValues = initialValues) => {
      setValues(newInitialValues);
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;
      setValue(name, newValue);
    },
    [setValue]
  );

  const handleInputBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouchedField(name);
    },
    [setTouchedField]
  );
  
  return {
    values,
    errors,
    touched,
    setValue,
    setValues,
    validateForm,
    resetForm,
    handleInputChange,
    handleInputBlur,
    isValid: Object.keys(errors).every((key) => !errors[key]),
    hasErrors: Object.keys(errors).some((key) => errors[key]),
  };
};
