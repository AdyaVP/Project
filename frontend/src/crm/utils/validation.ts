// Utilidades de validación para inputs de usuario

export const sanitizeInput = (input: string): string => {
  // Eliminar caracteres peligrosos
  return input
    .replace(/[<>'"]/g, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Acepta formatos: +1234567890, (123) 456-7890, 123-456-7890
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePlate = (plate: string): boolean => {
  // Formato de placa: ABC123 o ABC-123
  const plateRegex = /^[A-Z0-9]{3,4}[-]?[0-9]{3,4}$/i;
  return plateRegex.test(plate);
};

export const validateRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

export const validateNumber = (value: string | number): boolean => {
  if (typeof value === 'number') return !isNaN(value);
  return !isNaN(Number(value));
};

export const validatePositiveNumber = (value: string | number): boolean => {
  const num = typeof value === 'number' ? value : Number(value);
  return !isNaN(num) && num > 0;
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// Función general de validación de formularios
export interface ValidationRule {
  value: any;
  rules: {
    required?: boolean;
    email?: boolean;
    phone?: boolean;
    minLength?: number;
    maxLength?: number;
    positive?: boolean;
    custom?: (value: any) => boolean;
  };
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = (fields: Record<string, ValidationRule>): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [fieldName, rule] of Object.entries(fields)) {
    const { value, rules, message } = rule;

    if (rules.required && !validateRequired(value)) {
      errors[fieldName] = message || `${fieldName} es requerido`;
      continue;
    }

    if (rules.email && !validateEmail(value)) {
      errors[fieldName] = message || 'Email inválido';
      continue;
    }

    if (rules.phone && !validatePhone(value)) {
      errors[fieldName] = message || 'Teléfono inválido';
      continue;
    }

    if (rules.minLength && !validateMinLength(value, rules.minLength)) {
      errors[fieldName] = message || `Mínimo ${rules.minLength} caracteres`;
      continue;
    }

    if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
      errors[fieldName] = message || `Máximo ${rules.maxLength} caracteres`;
      continue;
    }

    if (rules.positive && !validatePositiveNumber(value)) {
      errors[fieldName] = message || 'Debe ser un número positivo';
      continue;
    }

    if (rules.custom && !rules.custom(value)) {
      errors[fieldName] = message || 'Valor inválido';
      continue;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
