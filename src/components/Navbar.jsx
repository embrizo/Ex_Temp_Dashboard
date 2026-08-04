import { Thermometer, Wind, ArrowLeft, Moon, Sun, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

export default function Navbar({ activePage, setActivePage, isHome }) {
  const { activeSensorId, setActiveSensorId, stats } = useData();
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

  const metricName = stats?.metricName || 'Temperature';
  const Icon = isHome ? Layers : (stats?.type === 'AirFlow' ? Wind : Thermometer);

  const homePages = [
    { id: 'sensors', label: 'Sensors' },
    { id: 'templates', label: 'Example CSVs' },
  ];

  const dashboardPages = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: `${metricName} Analysis` },
    { id: 'heatmap', label: stats?.type === 'AirFlow' ? 'Flow Pattern' : 'Heat Pattern' },
    { id: 'alerts', label: 'Alerts' },
  ];

  const pages = isHome ? homePages : dashboardPages;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon" style={{ background: isHome ? 'var(--color-purple)' : (stats?.type === 'AirFlow' ? 'var(--color-blue-light)' : 'var(--color-cyan)') }}>
            <Icon size={18} color="#fff" />
          </div>
          <span>
            DEMO <span style={{ color: isHome ? 'var(--color-purple)' : (stats?.type === 'AirFlow' ? 'var(--color-blue-light)' : 'var(--color-cyan)') }}>{isHome ? 'Monitor' : metricName}</span>
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 400 }}>
            {isHome ? 'System' : 'Dashboard'}
          </span>
        </div>

        {/* Nav Links */}
        <ul className="navbar-links" role="list">
          {pages.map((page) => (
            <li key={page.id}>
              <button
                id={`nav-${page.id}`}
                className={`navbar-link ${activePage === page.id ? 'active' : ''}`}
                onClick={() => setActivePage(page.id)}
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

          {!isHome && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveSensorId(null)}
                title="Back to sensors"
              >
                <ArrowLeft size={14} />
                Sensors List
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)', animation: 'pulse-dot 1.6s ease-in-out infinite' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-green)', fontWeight: 600 }}>
                  Live
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
