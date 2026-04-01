// ============================================================================
// Import de NavLink pour la navigation avec état actif.
// NavLink est similaire à Link mais gère l'état "actif" pour le style.
// ============================================================================
import { NavLink } from 'react-router-dom';

// ============================================================================
// Import de clsx pour la gestion conditionnelle des classes CSS.
// clsx combine plusieurs classes et gère les conditions dynamiquement.
// ============================================================================
import clsx from 'clsx';

// ============================================================================
// Import du type User pour typer les props du composant.
// User contient les informations de l'utilisateur (nom, rôle, etc.).
// ============================================================================
import type { User } from '../../state/types';

// ============================================================================
// Type définissant la structure d'un élément de navigation.
// label est le texte affiché dans le lien.
// to est le chemin de destination de la route.
// description est optionnelle et affiche un sous-texte explicatif.
// ============================================================================
type NavItem = {
  label: string;
  to: string;
  description?: string;
};

// ============================================================================
// Type définissant les props du composant DashboardLayout.
// Ce type assure la cohérence des données passées au composant.
// ============================================================================
type DashboardLayoutProps = {
  // Titre principal affiché dans le header.
  title: string;
  // Sous-titre descriptif affiché sous le titre.
  subtitle: string;
  // Tableau des éléments de navigation à afficher dans la sidebar.
  navItems: NavItem[];
  // Contenu enfant à rendre dans la zone principale.
  // React.ReactNode accepte tout contenu JSX valide.
  children: React.ReactNode;
  // Données de l'utilisateur connecté.
  user: User;
  // Fonction appelée lors du clic sur "Log out".
  // () => void indique une fonction sans paramètre et sans retour.
  onLogout: () => void;
};

// ============================================================================
// Composant de mise en page principal pour les tableaux de bord.
// 'export default function' exporte ce composant comme export par défaut.
// Le composant structure la page en sidebar + contenu principal.
// ============================================================================
export default function DashboardLayout({
  title,
  subtitle,
  navItems,
  children,
  user,
  onLogout,
}: DashboardLayoutProps) {
  return (
    // ============================================================================
    // Conteneur principal du dashboard avec classe CSS.
    // La classe "dashboard" définit la mise en page grid ou flex.
    // ============================================================================
    <div className="dashboard">
      {/* ============================================================================
      Barre latérale contenant la marque, navigation et infos utilisateur.
      <aside> est une balise sémantique HTML5 pour le contenu secondaire.
      ============================================================================ */}
      <aside className="dashboard__sidebar">
        {/* ============================================================================
        Section marque avec logo et nom de l'application.
        ============================================================================ */}
        <div className="dashboard__brand">
          <img src="/assets/bitchest_logo.png" alt="BitChest logo" />
          <div>
            <p className="dashboard__brand-name">BitChest</p>
            <p className="dashboard__brand-tagline">Digital assets made simple</p>
          </div>
        </div>

        {/* ============================================================================
        Navigation principale du dashboard.
        <nav> est une balise sémantique pour les liens de navigation.
        ============================================================================ */}
        <nav className="dashboard__nav">
          {/* ============================================================================
          Itération sur les éléments de navigation avec map.
          map() transforme le tableau en éléments JSX.
          ============================================================================ */}
          {navItems.map((item, index) => (
            <NavLink
              // key unique basée sur le chemin (obligatoire pour les listes React).
              key={item.to}
              // Chemin de destination du lien.
              to={item.to}
              // end indique une correspondance exacte du chemin.
              end
              // Fonction de style dynamique basée sur l'état actif.
              // clsx combine les classes conditionnellement.
              className={({ isActive }) => clsx('dashboard__nav-link', { active: isActive })}
              // Délai d'animation échelonné pour effet de cascade.
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <span className="dashboard__nav-label">{item.label}</span>
              {/* Affichage conditionnel de la description si présente */}
              {item.description ? <span className="dashboard__nav-description">{item.description}</span> : null}
            </NavLink>
          ))}
        </nav>

        {/* ============================================================================
        Section utilisateur avec avatar, infos et bouton de déconnexion.
        ============================================================================ */}
        <div className="dashboard__user">
          {/* Avatar avec initiales de l'utilisateur */}
          <div className="dashboard__user-avatar" aria-hidden="true">
            {/* charAt(0) récupère la première lettre pour les initiales */}
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <div className="dashboard__user-info">
            {/* Template literal pour afficher le nom complet */}
            <p>{`${user.firstName} ${user.lastName}`}</p>
            {/* Affichage du rôle avec texte lisible */}
            <p className="dashboard__user-role">{user.role === 'admin' ? 'Administrator' : 'Client'}</p>
          </div>
          {/* Bouton de déconnexion avec gestionnaire onClick */}
          <button type="button" className="button button--ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      {/* ============================================================================
      Zone de contenu principal.
      <main> est la balise sémantique pour le contenu principal.
      ============================================================================ */}
      <main className="dashboard__content">
        {/* En-tête avec titre et sous-titre dynamiques */}
        <header className="dashboard__header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        {/* Section du corps qui rend les enfants passés en props */}
        <section className="dashboard__body">{children}</section>
      </main>
    </div>
  );
}

