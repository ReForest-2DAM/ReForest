import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../services/authService';
import { useTranslation } from '../i18n/LanguageContext';

export default function Navigation() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const { language, toggleLanguage, t } = useTranslation();

  useEffect(() => {
    const handleAuthChange = () => setIsLoggedIn(isAuthenticated());
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          {t('nav.logo')}
        </Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>{t('nav.inicio')}</Link>
          <Link to="/especies" style={styles.link}>{t('nav.especies')}</Link>
          <Link to="/donaciones" style={styles.link}>{t('nav.donaciones')}</Link>

          <button onClick={toggleLanguage} style={styles.langBtn}>
            🌐 {language === 'es' ? 'EN' : 'ES'}
          </button>

          {isLoggedIn ? (
            <button onClick={handleLogout} style={styles.logoutBtn}>
              {t('nav.cerrarSesion')}
            </button>
          ) : (
            <>
              <Link to="/login" style={styles.link}>{t('nav.login')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#2d6a4f',
    padding: '1rem 0',
    marginBottom: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
  },
  logo: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'opacity 0.3s',
  },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.5)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600' as const,
    transition: 'all 0.3s',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500' as const,
    transition: 'all 0.3s',
  },
};
