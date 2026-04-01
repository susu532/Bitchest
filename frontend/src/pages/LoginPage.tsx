// ============================================================================
// Import du hook useState pour gérer l'état local du formulaire.
// useState permet de stocker et mettre à jour les valeurs des champs.
// ============================================================================
import { useState } from 'react';

// ============================================================================
// Import des hooks de navigation de React Router.
// useLocation récupère l'objet location avec les infos de l'URL actuelle.
// useNavigate retourne une fonction pour naviguer programmatiquement.
// ============================================================================
import { useLocation, useNavigate } from 'react-router-dom';

// ============================================================================
// Import du type FormEvent pour typer l'événement de soumission.
// FormEvent est le type TypeScript pour les événements de formulaire.
// ============================================================================
import type { FormEvent } from 'react';

// ============================================================================
// Import du hook useAuth pour accéder aux fonctions d'authentification.
// useAuth fournit login, logout, user et d'autres données d'auth.
// ============================================================================
import { useAuth } from '../state/AuthContext';

// ============================================================================
// Import du hook useNotifications pour afficher des messages.
// addNotification permet d'afficher des toasts à l'utilisateur.
// ============================================================================
import { useNotifications } from '../components/common/Notifications';

// ============================================================================
// Import du composant Globe pour l'arrière-plan 3D animé.
// Globe affiche une représentation 3D de la Terre en WebGL.
// ============================================================================
import Globe from '../components/common/globe';

// ============================================================================
// Type pour l'état de location avec redirection post-login.
// from contient le chemin d'origine d'où l'utilisateur a été redirigé.
// ============================================================================
type LocationState = {
  from?: { pathname: string };
};

// ============================================================================
// Composant principal de la page de connexion.
// 'export default function' exporte ce composant comme export par défaut.
// LoginPage gère le formulaire de connexion et la redirection après auth.
// ============================================================================
export default function LoginPage() {
  // Hook pour la navigation programmatique après connexion.
  const navigate = useNavigate();
  // Hook pour accéder à l'état de location (redirection d'origine).
  const location = useLocation();
  // Extraction des fonctions et données d'authentification.
  const { login, user } = useAuth();
  // Extraction de la fonction pour afficher les notifications.
  const { addNotification } = useNotifications();

  // ============================================================================
  // États locaux pour les champs du formulaire.
  // useState initialise avec une chaîne vide pour chaque champ.
  // ============================================================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // État pour basculer la visibilité du mot de passe.
  const [showPassword, setShowPassword] = useState(false);
  // État pour stocker le message d'erreur de connexion.
  // <string | null> permet null quand il n'y a pas d'erreur.
  const [error, setError] = useState<string | null>(null);
  // État pour indiquer si la soumission est en cours.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // Gestionnaire de soumission du formulaire.
  // async car la connexion est une opération asynchrone.
  // event: FormEvent type l'événement de soumission.
  // ============================================================================
  const handleSubmit = async (event: FormEvent) => {
    // Empêche le rechargement de la page par défaut.
    event.preventDefault();
    // Active l'indicateur de chargement.
    setIsSubmitting(true);
    // Réinitialise l'erreur précédente.
    setError(null);

    // Appel de la fonction login avec les identifiants.
    const result = await login({ email, password });

    // Si la connexion échoue, affiche l'erreur.
    if (!result.success) {
      // Utilise le message d'erreur ou un message par défaut.
      // ?? est l'opérateur de coalescence nulle.
      const errorMsg = result.message ?? 'Unable to sign in. Please try again.';
      setError(errorMsg);
      // Affiche une notification d'erreur (durée 6 secondes).
      addNotification('Login Failed', 'error', errorMsg, 6000);
      setIsSubmitting(false);
      return;
    }

    // Affiche une notification de succès.
    addNotification('Welcome back!', 'success', `Signed in as ${email}`, 4000);

    // Récupère le chemin de redirection si présent.
    const target = (location.state as LocationState | null)?.from?.pathname;

    // Délai court avant la navigation pour permettre l'affichage de la notification.
    setTimeout(() => {
      if (target) {
        // Redirige vers la page d'origine.
        navigate(target, { replace: true });
      } else if (user?.role === 'admin') {
        // Redirige vers le dashboard admin.
        navigate('/admin', { replace: true });
      } else {
        // Redirige vers le dashboard client.
        navigate('/client', { replace: true });
      }
    }, 100);
  };

  // ============================================================================
  // Rendu JSX de la page de connexion.
  // Structure en deux colonnes : visuel à gauche, formulaire à droite.
  // ============================================================================
  return (
    <div className="modern-login">
      {/* Composant Globe en arrière-plan */}
      <Globe />
      {/* Panneau gauche - Visuel héroïque */}
      <div className="modern-login__visual">
        {/* Arrière-plan 3D du globe */}

        <div className="modern-login__visual-overlay"></div>
        <div className="modern-login__visual-content">
          <div className="modern-login__brand">
            <img 
              src="/assets/bitchest_logo.png" 
              alt="BitChest" 
              className="modern-login__brand-logo"
            />
            <h1 className="modern-login__brand-name">BitChest</h1>
          </div>
          
          <div className="modern-login__hero-text">
            <h2 className="modern-login__headline">
              Your Gateway to
              <span className="modern-login__headline-accent"> Digital Assets</span>
            </h2>
            <p className="modern-login__tagline">
              Manage, track, and grow your cryptocurrency portfolio with institutional-grade security and real-time insights.
            </p>
          </div>

        
        </div>
      </div>

      {/* Panneau droit - Formulaire de connexion */}
      
        <div className="modern-login__form-container">
          <div className="modern-login__form-header">
            <h2 className="modern-login__form-title">Welcome back</h2>
            <p className="modern-login__form-subtitle">Enter your credentials to access your account</p>
          </div>

          {/* Formulaire avec gestionnaire onSubmit */}
          <form onSubmit={handleSubmit} className="modern-login__form">
            {/* Champ Email */}
            <div className="modern-input-group">
              <label htmlFor="email" className="modern-input-group__label">
                Email address
              </label>
              <div className="modern-input-wrapper">
                <div className="modern-input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 5l-8 6-8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  className="modern-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="modern-input-group">
              <label htmlFor="password" className="modern-input-group__label">
                Password
              </label>
              <div className="modern-input-wrapper">
                <div className="modern-input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8h-1V6a4 4 0 10-8 0v2H5a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1zM8 6a2 2 0 114 0v2H8V6z" fill="currentColor"/>
                  </svg>
                </div>
                {/* Type dynamique selon showPassword */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="modern-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                {/* Bouton pour basculer la visibilité */}
                <button
                  type="button"
                  className="modern-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" fill="currentColor"/>
                      <path d="M10 5c-3.866 0-7 3.582-7 5s3.134 5 7 5c1.726 0 3.306-.688 4.546-1.793l-1.42-1.42A5.978 5.978 0 0110 13c-2.21 0-4-1.79-4-4 0-1.202.53-2.282 1.37-3.017L5.95 4.563C4.726 5.49 3.667 6.683 3 8c0 0 1.5 3 5 4.5" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 5C6.134 5 3 8.582 3 10s3.134 5 7 5 7-3.582 7-5-3.134-5-7-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Message d'erreur conditionnel */}
            {error && (
              <div className="modern-login__error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 4v5M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Bouton de soumission */}
            <button 
              type="submit" 
              className="modern-login__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="modern-login__spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10h8m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Pied de page du formulaire */}
          <div className="modern-login__footer">
            <div className="modern-login__security">
             
             
            </div>
          </div>
        </div>
      
    </div>
  );
}