


export const emailValidation = {

  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  maxLength: 255,

  validate: (email: string): { valid: boolean; error?: string } => {

    if (!email) {

      return { valid: false, error: 'Email is required.' };
    }

    if (email.length > emailValidation.maxLength) {

      return { valid: false, error: `Email cannot exceed ${emailValidation.maxLength} characters.` };
    }

    if (!emailValidation.pattern.test(email)) {

      return { valid: false, error: 'Please enter a valid email address.' };
    }

    return { valid: true };
  },
};


export const passwordValidation = {

  minLength: 8,

  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/,

  requirements: {

    minLength: 'At least 8 characters',

    uppercase: 'At least one uppercase letter (A-Z)',

    lowercase: 'At least one lowercase letter (a-z)',

    number: 'At least one number (0-9)',

    special: 'At least one special character (@$!%*?&)',
  },

  validate: (password: string): { valid: boolean; errors: string[] } => {

    const errors: string[] = [];


    if (!password) {

      return { valid: false, errors: ['Password is required.'] };
    }


    if (password.length < passwordValidation.minLength) {

      errors.push(`Password must be at least ${passwordValidation.minLength} characters long.`);
    }


    if (!/[A-Z]/.test(password)) {

      errors.push('Password must contain at least one uppercase letter.');
    }


    if (!/[a-z]/.test(password)) {

      errors.push('Password must contain at least one lowercase letter.');
    }


    if (!/\d/.test(password)) {

      errors.push('Password must contain at least one number.');
    }


    if (!/[@$!%*?&]/.test(password)) {

      errors.push('Password must contain at least one special character (@$!%*?&).');
    }


    return { valid: errors.length === 0, errors };
  },
};


export const nameValidation = {

  minLength: 2,

  maxLength: 50,

  validate: (name: string, fieldName: string = 'Name'): { valid: boolean; error?: string } => {

    if (!name) {

      return { valid: false, error: `${fieldName} is required.` };
    }

    if (name.length < nameValidation.minLength) {

      return { valid: false, error: `${fieldName} must be at least ${nameValidation.minLength} characters.` };
    }

    if (name.length > nameValidation.maxLength) {

      return { valid: false, error: `${fieldName} cannot exceed ${nameValidation.maxLength} characters.` };
    }

    return { valid: true };
  },
};


export const validateUserForm = (

  firstName: string,

  lastName: string,

  email: string,
): { valid: boolean; errors: Record<string, string> } => {

  const errors: Record<string, string> = {};


  const firstNameValidation = nameValidation.validate(firstName, 'First name');

  if (!firstNameValidation.valid) {

    errors.firstName = firstNameValidation.error || '';
  }


  const lastNameValidation = nameValidation.validate(lastName, 'Last name');

  if (!lastNameValidation.valid) {

    errors.lastName = lastNameValidation.error || '';
  }


  const emailValidationResult = emailValidation.validate(email);

  if (!emailValidationResult.valid) {

    errors.email = emailValidationResult.error || '';
  }


  return {

    valid: Object.keys(errors).length === 0,

    errors,
  };
};


export const validatePasswordChange = (

  currentPassword: string,

  newPassword: string,

  passwordConfirmation?: string,
): { valid: boolean; errors: Record<string, string> } => {

  const errors: Record<string, string> = {};


  if (!currentPassword) {

    errors.currentPassword = 'Current password is required.';
  }


  const passwordValidationResult = passwordValidation.validate(newPassword);

  if (!passwordValidationResult.valid) {

    errors.newPassword = passwordValidationResult.errors.join(' ');
  }


  if (passwordConfirmation !== undefined && newPassword !== passwordConfirmation) {

    errors.passwordConfirmation = 'Password confirmation does not match.';
  }


  if (currentPassword && newPassword && currentPassword === newPassword) {

    errors.newPassword = 'New password must be different from current password.';
  }


  return {

    valid: Object.keys(errors).length === 0,

    errors,
  };
};
