namespace App {
  export interface Validatable {
    value: string | number;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    maxValue?: number;
    minValue?: number;
  }

  export const validate = (validatable: Validatable): boolean => {
    const { value, required, maxLength, minLength, maxValue, minValue } = validatable;
    let isValid = true;

    if (required) {
      isValid = isValid && value.toString().length !== 0;
    }

    if (typeof value === 'string' && maxLength != null) {
      isValid = isValid && value.length <= maxLength;
    }

    if (typeof value === 'string' && minLength != null) {
      isValid = isValid && value.length >= minLength;
    }

    if (typeof value === 'number' && maxValue != null) {
      isValid = isValid && value <= maxValue;
    }

    if (typeof value === 'number' && minValue != null) {
      isValid = isValid && value >= minValue;
    }

    return isValid;
  };
}
