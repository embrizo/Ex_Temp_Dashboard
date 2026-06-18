import { Thermometer, Upload, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar({ activePage, setActivePage, hasData }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored ? stored === 'dark' : system;
    
    if (initialDark) {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nowDark = root.classList.toggle('dark');
    setIsDark(nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
  };

  const pages = [
    { id: 'upload', label: 'Upload Data' },
    { id: 'overview', label: 'Overview', disabled: !hasData },
    { id: 'analysis', label: 'Temperature Analysis', disabled: !hasData },
    { id: 'heatmap', label: 'Heat Pattern', disabled: !hasData },
    { id: 'alerts', label: 'Alerts', disabled: !hasData },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Logo */}
        <a href="#" className="navbar-logo" id="navbar-logo" onClick={(e) => e.preventDefault()}>
          <div className="navbar-logo-icon">
            <Thermometer size={18} color="#fff" />
          </div>
          <span>
            TKM <span style={{ color: 'var(--color-cyan)' }}>HVAC</span>
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 400 }}>
            Line Fac08
          </span>
        </a>

        {/* Nav Links */}
        <ul className="navbar-links" role="list">
          {pages.map((page) => (
            <li key={page.id}>
              <button
                id={`nav-${page.id}`}
                className={`navbar-link ${activePage === page.id ? 'active' : ''}`}
                onClick={() => !page.disabled && setActivePage(page.id)}
                disabled={page.disabled}
                style={{ opacity: page.disabled ? 0.4 : 1, cursor: page.disabled ? 'not-allowed' : 'pointer' }}
                title={page.disabled ? 'Upload data first' : ''}
              >
                {page.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={toggleTheme} 
            title="Toggle Light/Dark Theme"
            style={{ padding: '6px 8px' }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {hasData && (
            <button
              id="nav-upload-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => setActivePage('upload')}
              title="Upload new file"
            >
              <Upload size={14} />
              Upload
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: hasData ? 'var(--color-green)' : 'var(--color-text-3)', animation: hasData ? 'pulse-dot 1.6s ease-in-out infinite' : 'none' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: hasData ? 'var(--color-green)' : 'var(--color-text-3)', fontWeight: 600 }}>
              {hasData ? 'Live' : 'No Data'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
