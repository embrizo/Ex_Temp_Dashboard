import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Thermometer, Moon, Sun, History } from 'lucide-react';

export default function TopBar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored ? stored === 'dark' : system;
    setIsDark(initialDark);
    root.classList.toggle('dark', initialDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nowDark = root.classList.toggle('dark');
    setIsDark(nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Thermometer size={18} color="#fff" />
          </div>
          <span>
            Sensor <span style={{ color: 'var(--color-cyan)' }}>Dashboard</span>
          </span>
        </Link>

        <div className="navbar-actions">
          <Link to="/legacy" className="btn btn-ghost btn-sm" title="Open the legacy CSV upload tool">
            <History size={14} />
            Legacy CSV Tool
          </Link>
          <button
            className="btn btn-ghost btn-sm"
            onClick={toggleTheme}
            title="Toggle Light/Dark Theme"
            style={{ padding: '6px 8px' }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
