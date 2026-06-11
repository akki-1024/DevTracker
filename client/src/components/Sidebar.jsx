import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { icon: '⬡', label: 'Dashboard', path: '/' },
  { icon: '◈', label: 'Projects', path: '/projects' },
  { icon: '◉', label: 'Clients', path: '/clients' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">⬡</div>
          <div className="logo-text">Dev<span>Track</span></div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item ${pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path)) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
