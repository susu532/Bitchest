// Hedha el layout mta3 el dashboard - sidebar bel navigation, infos user, w zone de contenu principale
// + Mobile bottom navigation bar w hamburger menu lel écrans sghira
import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import clsx from 'clsx';

import type { User } from '../../state/types';

type NavItem = {
  label: string;
  to: string;
  description?: string;
};

// El props - titre, sous-titre, les liens mta3 el nav, el user connecté, w fonction logout
type DashboardLayoutProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
};

// Icons SVG lel bottom nav bar - kol wahda marboutha bel label mta3ha
const NAV_ICONS: Record<string, React.ReactNode> = {
  Overview: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Wallet: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 100 4h4v-4h-4z" />
    </svg>
  ),
  Markets: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Clients: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
};

export default function DashboardLayout({
  title,
  subtitle,
  navItems,
  children,
  user,
  onLogout,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Sakker el menu ki yetbaddel el route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Sakker el menu ki el user ya3mel scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <div className="dashboard">
      {/* Mobile header - ya3mel display:flex fil mobile w display:none fil desktop */}
      <header className="dashboard__mobile-header">
        <div className="dashboard__mobile-brand">
          <img src="/assets/bitchest_logo.png" alt="BitChest logo" />
          <span className="dashboard__brand-name">BitChest</span>
        </div>
        <button
          type="button"
          className="dashboard__hamburger"
          onClick={toggleMenu}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <span className={clsx('dashboard__hamburger-line', { open: mobileMenuOpen })} />
          <span className={clsx('dashboard__hamburger-line', { open: mobileMenuOpen })} />
          <span className={clsx('dashboard__hamburger-line', { open: mobileMenuOpen })} />
        </button>
      </header>

      {/* Overlay lel mobile menu */}
      {mobileMenuOpen && (
        <div className="dashboard__overlay" onClick={toggleMenu} aria-hidden="true" />
      )}

      {/* Mobile slide-out menu - yetla3 men lfouq ki ya3mel tap 3al hamburger */}
      <div className={clsx('dashboard__mobile-menu', { open: mobileMenuOpen })}>
        <div className="dashboard__mobile-menu-user">
          <div className="dashboard__user-avatar" aria-hidden="true">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <div className="dashboard__user-info">
            <p>{`${user.firstName} ${user.lastName}`}</p>
            <p className="dashboard__user-role">{user.role === 'admin' ? 'Administrator' : 'Client'}</p>
          </div>
        </div>
        <nav className="dashboard__mobile-menu-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => clsx('dashboard__mobile-menu-link', { active: isActive })}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="dashboard__mobile-menu-icon">
                {NAV_ICONS[item.label] || NAV_ICONS['Overview']}
              </span>
              <span>{item.label}</span>
              {item.description ? <span className="dashboard__mobile-menu-desc">{item.description}</span> : null}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="button button--ghost dashboard__mobile-logout" onClick={onLogout}>
          Log out
        </button>
      </div>

      {/* El sidebar mta3 el desktop - makhfiya fil mobile */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__brand">
          <img src="/assets/bitchest_logo.png" alt="BitChest logo" />
          <div>
            <p className="dashboard__brand-name">BitChest</p>
            <p className="dashboard__brand-tagline">Digital assets made simple</p>
          </div>
        </div>

        <nav className="dashboard__nav">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => clsx('dashboard__nav-link', { active: isActive })}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <span className="dashboard__nav-label">{item.label}</span>
              {item.description ? <span className="dashboard__nav-description">{item.description}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard__user">
          <div className="dashboard__user-avatar" aria-hidden="true">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <div className="dashboard__user-info">
            <p>{`${user.firstName} ${user.lastName}`}</p>
            <p className="dashboard__user-role">{user.role === 'admin' ? 'Administrator' : 'Client'}</p>
          </div>
          <button type="button" className="button button--ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      {/* El contenu principal - header bel titre w sous-titre, w el body eli yaffichi el children */}
      <main className="dashboard__content">
        <header className="dashboard__header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        <section className="dashboard__body">{children}</section>
      </main>

      {/* Bottom navigation bar lel mobile - tab bar kima les apps natives */}
      <nav className="dashboard__bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) => clsx('dashboard__bottom-nav-item', { active: isActive })}
          >
            <span className="dashboard__bottom-nav-icon">
              {NAV_ICONS[item.label] || NAV_ICONS['Overview']}
            </span>
            <span className="dashboard__bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

