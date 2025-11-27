// Importe les hooks React pour gérer l'état local
import { useState } from 'react';
// Importe les hooks de navigation pour rediriger l'utilisateur après connexion
import { useLocation, useNavigate } from 'react-router-dom';

// Importe le type pour les événements de formulaire
import type { FormEvent } from 'react';

// Importe le hook d'authentification pour accéder à la fonction login
import { useAuth } from '../state/AuthContext';

// Type pour l'état de la location (pour savoir d'où vient l'utilisateur)
type LocationState = {
  from?: { pathname: string };
};

// Composant de la page de connexion
export default function LoginPage() {
  // Hook pour la navigation programmatique
  const navigate = useNavigate();
  // Hook pour accéder à l'état de la navigation actuelle
  const location = useLocation();
  // Récupère la fonction login et l'utilisateur depuis le contexte d'auth
  const { login, user } = useAuth();

  // État local pour l'email saisi
  const [email, setEmail] = useState('');
  // État local pour le mot de passe saisi
  const [password, setPassword] = useState('');
  // État pour gérer les erreurs d'authentification
  const [error, setError] = useState<string | null>(null);
  // État pour indiquer si la requête est en cours (désactive le bouton)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (event: FormEvent) => {
    // Empêche le rechargement de la page par défaut
    event.preventDefault();

    // Active l'état de chargement
    setIsSubmitting(true);
    // Réinitialise les erreurs précédentes
    setError(null);

    // Appelle la fonction de login du contexte
    const result = await login({ email, password });

    // Si la connexion échoue
    if (!result.success) {
      // Affiche le message d'erreur retourné ou un message par défaut
      setError(result.message ?? 'Unable to sign in. Please try again.');
      // Désactive l'état de chargement pour permettre de réessayer
      setIsSubmitting(false);
      return;
    }

    // Détermine la page de destination après connexion réussie
    // Si l'utilisateur venait d'une page protégée, on le renvoie là-bas
    const target = (location.state as LocationState | null)?.from?.pathname;

    // Petit délai pour laisser le temps à l'état global de se mettre à jour
    setTimeout(() => {
      if (target) {
        // Redirection vers la page d'origine
        navigate(target, { replace: true });
      } else if (user?.role === 'admin') {
        // Redirection par défaut pour les admins -> Dashboard Admin
        navigate('/admin', { replace: true });
      } else {
        // Redirection par défaut pour les clients -> Dashboard Client
        navigate('/client', { replace: true });
      }
    }, 100);
  };

  // Rendu du formulaire de connexion
  return (
    <div className="page page--centered login-page">
      {/* Carte de connexion avec animation */}
      <div className="login-card" style={{ animationDelay: '0.1s' }}>
        {/* En-tête avec logo et titre */}
        <div className="login-card__brand">
          <img src="/assets/bitchest_logo.png" alt="BitChest logo" className="login-card__logo" />
          <div>
            <h1>BitChest Access</h1>
            <p>Secure portal for administrators and clients</p>
          </div>
        </div>

        {/* Formulaire de saisie */}
        <form onSubmit={handleSubmit} className="form">
          {/* Champ Email */}
          <label className="form__label">
            Email address
            <input
              type="email"
              className="form__input"
              value={email}
              // Met à jour l'état email à chaque frappe
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </label>

          {/* Champ Mot de passe */}
          <label className="form__label">
            Password
            <input
              type="password"
              className="form__input"
              value={password}
              // Met à jour l'état password à chaque frappe
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
            />
          </label>

          {/* Affichage du message d'erreur s'il y en a un */}
          {error ? <p className="form__error">{error}</p> : null}

          {/* Bouton de soumission (désactivé pendant le chargement) */}
          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
