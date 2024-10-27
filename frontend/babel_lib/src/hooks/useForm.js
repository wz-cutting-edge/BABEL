import { useState, useCallback, useMemo } from 'react';

export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    const validator = validationSchema[name];
    if (!validator) return '';
    
    try {
      validator(value, values);
      return '';
    } catch (error) {
      return error.message;
    }
  }, [validationSchema, values]);

  const handleChange = useCallback(event => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback(event => {
    const { name } = event.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(values).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField, values]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    try {
      if (validateForm()) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const formState = useMemo(() => ({
    values,
    errors,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0
  }), [values, errors, touched, isSubmitting]);

  return {
    ...formState,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  };
};
