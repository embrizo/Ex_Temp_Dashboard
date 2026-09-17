import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav className="hierarchy-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.to} className="hierarchy-breadcrumb-item">
          {i > 0 && <ChevronRight size={14} className="hierarchy-breadcrumb-sep" />}
          {i === items.length - 1 ? (
            <span className="hierarchy-breadcrumb-current">{item.label}</span>
          ) : (
            <Link to={item.to}>{item.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
