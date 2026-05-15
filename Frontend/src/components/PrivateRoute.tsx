import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import { useState, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function PrivateRoute({ children, requireAdmin = false }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAllowed(false);
      return;
    }
    if (requireAdmin) {
      getCurrentUser().then(u => {
        setAllowed(u.rol.toUpperCase() === 'ADMIN');
      }).catch(() => setAllowed(false));
    } else {
      setAllowed(true);
    }
  }, [requireAdmin]);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
