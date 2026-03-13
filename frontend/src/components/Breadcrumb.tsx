import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  items: Array<{ label: string; path?: string }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 mb-5 text-[11px]">
      <Link to="/dashboard" className="text-text-secondary/60 hover:text-accent transition-colors">
        Home
      </Link>
      {items.map((seg, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={10} className="text-text-secondary/40" />
            {isLast || !seg.path ? (
              <span className="text-text-secondary font-medium">{seg.label}</span>
            ) : (
              <Link to={seg.path} className="text-text-secondary/60 hover:text-accent transition-colors">
                {seg.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
