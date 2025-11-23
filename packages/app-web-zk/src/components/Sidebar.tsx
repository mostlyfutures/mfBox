import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onLogout }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? '◀' : '▶'}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">🔒 ZK Notes</h1>
          <p className="sidebar-tagline">Zero-Knowledge Encrypted</p>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">📝</span>
            <span className="nav-text">All Notes</span>
          </button>
          
          <button className="nav-item">
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Favorites</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">📁</span>
            <span className="nav-text">Folders</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">🗑️</span>
            <span className="nav-text">Trash</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="encryption-indicator">
            <span className="indicator-icon">🔐</span>
            <div className="indicator-text">
              <strong>End-to-End Encrypted</strong>
              <small>Your data is secure</small>
            </div>
          </div>

          <button className="nav-item" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
