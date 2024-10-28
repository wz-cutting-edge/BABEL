import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    async (name, value) => {
      if (!validationSchema) return '';

      try {
        await validationSchema.validateAt(name, { [name]: value });
        return '';
      } catch (error) {
        return error.message;
      }
    },
    [validationSchema]
  );

  const handleChange = useCallback(
    async (event) => {
      const { name, value } = event.target;
      setValues((prev) => ({ ...prev, [name]: value }));

      if (validationSchema && touched[name]) {
        const error = await validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    async (event) => {
      const { name, value } = event.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validationSchema) {
        const error = await validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField]
  );

  const validateForm = useCallback(
    async (data = values) => {
      if (!validationSchema) return {};

      try {
        await validationSchema.validate(data, { abortEarly: false });
        return {};
      } catch (error) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        return validationErrors;
      }
    },
    [validationSchema, values]
  );

  const handleSubmit = useCallback(
    (onSubmit) => async (event) => {
      event.preventDefault();
      setIsSubmitting(true);

      const validationErrors = await validateForm();
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    },
    [validateForm, values]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateForm,
  };
};
