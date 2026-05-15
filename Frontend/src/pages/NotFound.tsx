import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '6rem', margin: '0 0 0.5rem 0' }}>🌲</p>
      <h1 style={{ color: '#2d6a4f', fontSize: '4rem', margin: '0 0 0.5rem 0' }}>404</h1>
      <h2 style={{ color: '#2d6a4f', margin: '0 0 1rem 0' }}>{t('notFound.titulo')}</h2>
      <p style={{ color: '#555', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '2rem' }}>
        {t('notFound.mensaje')}
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 28px',
          backgroundColor: '#2d6a4f',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1f4d37';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(45,106,79,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2d6a4f';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {t('notFound.volver')}
      </button>
    </div>
  );
}
