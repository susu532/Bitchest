import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import type { User } from '../../state/types';

type NavItem = {
  label: string;
  to: string;
  description?: string;
};

type DashboardLayoutProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
};

export default function DashboardLayout({
  title,
  subtitle,
  navItems,
  children,
  user,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="dashboard">
      <aside className="dashboard__sidebar">
        <div className="dashboard__brand">
          <img src="/assets/bitchest_logo.png" alt="BitChest logo" />
          <div>
            <p className="dashboard__brand-name">BitChest</p>
            <p className="dashboard__brand-tagline">Digital assets made simple</p>
          </div>
        </div>

        <nav className="dashboard__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => clsx('dashboard__nav-link', { active: isActive })}
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

      <main className="dashboard__content">
        <header className="dashboard__header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        <section className="dashboard__body">{children}</section>
      </main>
    </div>
  );
}

