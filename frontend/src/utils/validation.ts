

// ============================================================================
// Objet de validation pour les adresses email.
// 'export const' exporte une constante nommée pour réutilisation.
// emailValidation contient le pattern, la longueur max, et la fonction de validation.
// ============================================================================
export const emailValidation = {
  // ============================================================================
  // Expression régulière pour valider le format d'un email.
  // ^[^\s@]+ : commence par un ou plusieurs caractères (sauf espace et @).
  // @[^\s@]+ : suivi de @ puis un ou plusieurs caractères (sauf espace et @).
  // \.[^\s@]+$ : termine par un point suivi d'un ou plusieurs caractères.
  // ============================================================================
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Longueur maximale autorisée pour un email.
  maxLength: 255,

  // ============================================================================
  // Fonction de validation de l'email.
  // 'validate' prend un email et retourne un objet avec valid et error.
  // : { valid: boolean; error?: string } définit le type de retour.
  // ============================================================================
  validate: (email: string): { valid: boolean; error?: string } => {
    // Vérifie que l'email n'est pas vide.
    if (!email) {
      return { valid: false, error: 'Email is required.' };
    }
    // Vérifie que l'email ne dépasse pas la longueur maximale.
    if (email.length > emailValidation.maxLength) {
      return { valid: false, error: `Email cannot exceed ${emailValidation.maxLength} characters.` };
    }
    // Vérifie que l'email correspond au pattern regex.
    // .test() retourne true si la chaîne correspond au pattern.
    if (!emailValidation.pattern.test(email)) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }
    // Retourne valid: true si toutes les vérifications passent.
    return { valid: true };
  },
};

// ============================================================================
// Objet de validation pour les mots de passe.
// Ce validateur vérifie la complexité requise du mot de passe.
// ============================================================================
export const passwordValidation = {
  // Longueur minimale requise pour le mot de passe.
  minLength: 8,

  // ============================================================================
  // Expression régulière pour valider la complexité du mot de passe.
  // (?=.*[a-z]) : doit contenir au moins une minuscule.
  // (?=.*[A-Z]) : doit contenir au moins une majuscule.
  // (?=.*\d) : doit contenir au moins un chiffre.
  // (?=.*[@$!%*?&]) : doit contenir au moins un caractère spécial.
  // {8,} : longueur minimale de 8 caractères.
  // ============================================================================
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/,

  // ============================================================================
  // Objet décrivant les exigences du mot de passe pour l'affichage.
  // Ces messages sont utilisés pour guider l'utilisateur.
  // ============================================================================
  requirements: {
    minLength: 'At least 8 characters',
    uppercase: 'At least one uppercase letter (A-Z)',
    lowercase: 'At least one lowercase letter (a-z)',
    number: 'At least one number (0-9)',
    special: 'At least one special character (@$!%*?&)',
  },

  // ============================================================================
  // Fonction de validation retournant un tableau d'erreurs.
  // Cette fonction vérifie chaque critère individuellement.
  // errors: string[] accumule tous les messages d'erreur.
  // ============================================================================
  validate: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Vérifie que le mot de passe n'est pas vide.
    if (!password) {
      return { valid: false, errors: ['Password is required.'] };
    }

    // Vérifie la longueur minimale.
    if (password.length < passwordValidation.minLength) {
      errors.push(`Password must be at least ${passwordValidation.minLength} characters long.`);
    }

    // Vérifie la présence d'au moins une majuscule.
    // /[A-Z]/ est une regex cherchant une lettre majuscule.
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.');
    }

    // Vérifie la présence d'au moins une minuscule.
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.');
    }

    // Vérifie la présence d'au moins un chiffre.
    // \d est équivalent à [0-9].
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number.');
    }

    // Vérifie la présence d'au moins un caractère spécial.
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&).');
    }

    // Retourne valid: true si le tableau d'erreurs est vide.
    return { valid: errors.length === 0, errors };
  },
};

// ============================================================================
// Objet de validation pour les noms (prénom, nom de famille).
// Ce validateur vérifie la longueur du nom.
// ============================================================================
export const nameValidation = {
  minLength: 2,
  maxLength: 50,

  // ============================================================================
  // Fonction de validation du nom avec nom de champ personnalisable.
  // fieldName permet d'afficher 'First name' ou 'Last name' dans les erreurs.
  // ============================================================================
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

// ============================================================================
// Fonction de validation complète pour un formulaire utilisateur.
// Cette fonction combine la validation du prénom, nom et email.
// Retourne un objet avec valid: boolean et errors: Record<string, string>.
// ============================================================================
export const validateUserForm = (
  firstName: string,
  lastName: string,
  email: string,
): { valid: boolean; errors: Record<string, string> } => {
  // Record<string, string> est un objet avec clés et valeurs de type string.
  const errors: Record<string, string> = {};

  // Validation du prénom.
  const firstNameValidation = nameValidation.validate(firstName, 'First name');
  if (!firstNameValidation.valid) {
    errors.firstName = firstNameValidation.error || '';
  }

  // Validation du nom de famille.
  const lastNameValidation = nameValidation.validate(lastName, 'Last name');
  if (!lastNameValidation.valid) {
    errors.lastName = lastNameValidation.error || '';
  }

  // Validation de l'email.
  const emailValidationResult = emailValidation.validate(email);
  if (!emailValidationResult.valid) {
    errors.email = emailValidationResult.error || '';
  }

  // Retourne valid: true si aucune erreur n'est présente.
  // Object.keys(errors).length compte le nombre de clés dans l'objet.
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// Fonction de validation pour le changement de mot de passe.
// Cette fonction vérifie l'ancien mot de passe, le nouveau et la confirmation.
// ============================================================================
export const validatePasswordChange = (
  currentPassword: string,
  newPassword: string,
  // '?' indique que ce paramètre est optionnel.
  passwordConfirmation?: string,
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Vérifie que le mot de passe actuel est fourni.
  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }

  // Valide le nouveau mot de passe selon les critères de complexité.
  const passwordValidationResult = passwordValidation.validate(newPassword);
  if (!passwordValidationResult.valid) {
    // .join(' ') concatène les erreurs en une seule chaîne.
    errors.newPassword = passwordValidationResult.errors.join(' ');
  }

  // Vérifie que la confirmation correspond au nouveau mot de passe.
  // !== undefined vérifie que la confirmation a été fournie.
  if (passwordConfirmation !== undefined && newPassword !== passwordConfirmation) {
    errors.passwordConfirmation = 'Password confirmation does not match.';
  }

  // Vérifie que le nouveau mot de passe est différent de l'actuel.
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.newPassword = 'New password must be different from current password.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

