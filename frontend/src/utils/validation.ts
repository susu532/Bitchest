// Utilitaires de validation pour les formulaires (email, mot de passe, noms)

// Objet de configuration pour la validation des emails
export const emailValidation = {
  // Expression régulière pour vérifier le format email
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Nombre maximum de caractères autorisés
  maxLength: 255,
  // Fonction de validation d'email
  validate: (email: string): { valid: boolean; error?: string } => {
    // Vérifie que l'email n'est pas vide
    if (!email) {
      // Retourne erreur si vide
      return { valid: false, error: 'Email is required.' };
    }
    // Vérifie que la longueur ne dépasse pas 255 caractères
    if (email.length > emailValidation.maxLength) {
      // Retourne erreur si trop long
      return { valid: false, error: `Email cannot exceed ${emailValidation.maxLength} characters.` };
    }
    // Vérifie que le format respecte le pattern regex
    if (!emailValidation.pattern.test(email)) {
      // Retourne erreur si format invalide
      return { valid: false, error: 'Please enter a valid email address.' };
    }
    // Retourne succès si tous les tests passent
    return { valid: true };
  },
};

// Objet de configuration pour la validation des mots de passe
export const passwordValidation = {
  // Nombre minimum de caractères requis
  minLength: 8,
  // Expression régulière pour vérifier la complexité du mot de passe
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/,
  // Objet décrivant les exigences du mot de passe
  requirements: {
    // Au moins 8 caractères
    minLength: 'At least 8 characters',
    // Au moins une majuscule
    uppercase: 'At least one uppercase letter (A-Z)',
    // Au moins une minuscule
    lowercase: 'At least one lowercase letter (a-z)',
    // Au moins un chiffre
    number: 'At least one number (0-9)',
    // Au moins un caractère spécial
    special: 'At least one special character (@$!%*?&)',
  },
  // Fonction de validation complète du mot de passe
  validate: (password: string): { valid: boolean; errors: string[] } => {
    // Tableau pour accumuler les erreurs
    const errors: string[] = [];

    // Vérifie que le mot de passe n'est pas vide
    if (!password) {
      // Retourne erreur si vide
      return { valid: false, errors: ['Password is required.'] };
    }

    // Vérifie la longueur minimale
    if (password.length < passwordValidation.minLength) {
      // Ajoute erreur de longueur
      errors.push(`Password must be at least ${passwordValidation.minLength} characters long.`);
    }

    // Vérifie la présence d'au moins une majuscule
    if (!/[A-Z]/.test(password)) {
      // Ajoute erreur majuscule
      errors.push('Password must contain at least one uppercase letter.');
    }

    // Vérifie la présence d'au moins une minuscule
    if (!/[a-z]/.test(password)) {
      // Ajoute erreur minuscule
      errors.push('Password must contain at least one lowercase letter.');
    }

    // Vérifie la présence d'au moins un chiffre
    if (!/\d/.test(password)) {
      // Ajoute erreur chiffre
      errors.push('Password must contain at least one number.');
    }

    // Vérifie la présence d'au moins un caractère spécial
    if (!/[@$!%*?&]/.test(password)) {
      // Ajoute erreur caractère spécial
      errors.push('Password must contain at least one special character (@$!%*?&).');
    }

    // Retourne valide si aucune erreur, sinon retourne les erreurs
    return { valid: errors.length === 0, errors };
  },
};

// Objet de configuration pour la validation des noms
export const nameValidation = {
  // Nombre minimum de caractères requis
  minLength: 2,
  // Nombre maximum de caractères autorisés
  maxLength: 50,
  // Fonction de validation d'un nom
  validate: (name: string, fieldName: string = 'Name'): { valid: boolean; error?: string } => {
    // Vérifie que le nom n'est pas vide
    if (!name) {
      // Retourne erreur si vide
      return { valid: false, error: `${fieldName} is required.` };
    }
    // Vérifie la longueur minimale
    if (name.length < nameValidation.minLength) {
      // Retourne erreur si trop court
      return { valid: false, error: `${fieldName} must be at least ${nameValidation.minLength} characters.` };
    }
    // Vérifie la longueur maximale
    if (name.length > nameValidation.maxLength) {
      // Retourne erreur si trop long
      return { valid: false, error: `${fieldName} cannot exceed ${nameValidation.maxLength} characters.` };
    }
    // Retourne succès si tous les tests passent
    return { valid: true };
  },
};

// Fonction de validation complète d'un formulaire utilisateur
export const validateUserForm = (
  // Prénom à valider
  firstName: string,
  // Nom de famille à valider
  lastName: string,
  // Email à valider
  email: string,
): { valid: boolean; errors: Record<string, string> } => {
  // Objet pour accumuler les erreurs par champ
  const errors: Record<string, string> = {};

  // Valide le prénom
  const firstNameValidation = nameValidation.validate(firstName, 'First name');
  // Si validation du prénom échoue
  if (!firstNameValidation.valid) {
    // Ajoute l'erreur de prénom
    errors.firstName = firstNameValidation.error || '';
  }

  // Valide le nom de famille
  const lastNameValidation = nameValidation.validate(lastName, 'Last name');
  // Si validation du nom échoue
  if (!lastNameValidation.valid) {
    // Ajoute l'erreur de nom
    errors.lastName = lastNameValidation.error || '';
  }

  // Valide l'email
  const emailValidationResult = emailValidation.validate(email);
  // Si validation de l'email échoue
  if (!emailValidationResult.valid) {
    // Ajoute l'erreur d'email
    errors.email = emailValidationResult.error || '';
  }

  // Retourne le résultat avec toutes les erreurs collectées
  return {
    // Valide si aucune erreur
    valid: Object.keys(errors).length === 0,
    // Objet contenant toutes les erreurs
    errors,
  };
};

// Fonction de validation du changement de mot de passe
export const validatePasswordChange = (
  // Mot de passe actuel à valider
  currentPassword: string,
  // Nouveau mot de passe à valider
  newPassword: string,
  // Confirmation du nouveau mot de passe (optionnel)
  passwordConfirmation?: string,
): { valid: boolean; errors: Record<string, string> } => {
  // Objet pour accumuler les erreurs
  const errors: Record<string, string> = {};

  // Vérifie que le mot de passe actuel n'est pas vide
  if (!currentPassword) {
    // Ajoute erreur mot de passe actuel manquant
    errors.currentPassword = 'Current password is required.';
  }

  // Valide la complexité du nouveau mot de passe
  const passwordValidationResult = passwordValidation.validate(newPassword);
  // Si la validation du nouveau mot de passe échoue
  if (!passwordValidationResult.valid) {
    // Combine toutes les erreurs de validation en une seule chaîne
    errors.newPassword = passwordValidationResult.errors.join(' ');
  }

  // Vérifie que la confirmation du mot de passe correspond (si fournie)
  if (passwordConfirmation !== undefined && newPassword !== passwordConfirmation) {
    // Ajoute erreur si les mots de passe ne correspondent pas
    errors.passwordConfirmation = 'Password confirmation does not match.';
  }

  // Vérifie que le nouveau mot de passe est différent de l'ancien
  if (currentPassword && newPassword && currentPassword === newPassword) {
    // Ajoute erreur si les mots de passe sont identiques
    errors.newPassword = 'New password must be different from current password.';
  }

  // Retourne le résultat avec toutes les erreurs collectées
  return {
    // Valide si aucune erreur
    valid: Object.keys(errors).length === 0,
    // Objet contenant toutes les erreurs
    errors,
  };
};
