import { useState, ChangeEvent } from 'react';
import { sanitizeInput } from '../utils/validation';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  validate?: (values: T) => Record<string, string>;
  sanitize?: boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
  sanitize = true,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Sanitizar input si está habilitado
    const sanitizedValue = sanitize && typeof value === 'string' ? sanitizeInput(value) : value;
    
    setValues(prev => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Limpiar error del campo al cambiar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      // Reset form después de submit exitoso
      setValues(initialValues);
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const setFieldValue = (name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const setFieldError = (name: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

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
  };
};
