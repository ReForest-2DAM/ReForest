import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEspecieById, createDonacion, getCurrentUser, isAuthenticated } from '../services';
import type { Especie } from '../types/especie';
import type { DonacionFormData } from '../types/donacion';
import { useTranslation } from '../i18n/LanguageContext';

export default function EspecieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [especie, setEspecie] = useState<Especie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonacionModal, setShowDonacionModal] = useState(false);
  const [donacionForm, setDonacionForm] = useState({ cantidad_arboles: 1 });
  const [savingDonacion, setSavingDonacion] = useState(false);

  useEffect(() => {
    const fetchEspecie = async () => {
      try {
        const data = await getEspecieById(Number(id));
        setEspecie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la especie');
      } finally {
        setLoading(false);
      }
    };
    fetchEspecie();
  }, [id]);

  const handlePlantarClick = () => {
    if (!isAuthenticated()) {
      alert(t('especies.debesIniciar'));
      return;
    }
    setDonacionForm({ cantidad_arboles: 1 });
    setShowDonacionModal(true);
  };

  const handleDonacionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!especie) return;
    setSavingDonacion(true);
    try {
      const usuario = await getCurrentUser();
      const donacionData: DonacionFormData = {
        fecha: new Date().toISOString().split('T')[0] + 'T00:00:00',
        nombre_donante: usuario.nombre,
        cantidad_arboles: donacionForm.cantidad_arboles,
        total_donado: donacionForm.cantidad_arboles * especie.precio_plantacion,
        estado: 'PENDIENTE',
        pagado: false,
        id_especie: especie.id,
        id_usuario: usuario.id
      };
      const dataToSend = {
        ...donacionData,
        especie: { id: especie.id },
        usuario: { id: usuario.id }
      };
      await createDonacion(dataToSend as unknown as DonacionFormData);
      setShowDonacionModal(false);
      alert(t('donacion.creada'));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: unknown }; message?: string };
      if (axiosErr.response) {
        alert(`${t('common.errorServidor')} ${axiosErr.response.status} - ${JSON.stringify(axiosErr.response.data)}`);
      } else {
        alert(`Error: ${axiosErr.message || t('common.errorConexion')}`);
      }
    } finally {
      setSavingDonacion(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px', color: '#2d6a4f' }}>
        {t('especieDetail.cargando')}
      </div>
    );
  }

  if (error || !especie) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#d00', fontSize: '18px' }}>
        ❌ {error || t('especieDetail.noEncontrada')}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Boton volver */}
      <button
        onClick={() => navigate('/especies')}
        style={{
          marginBottom: '1.5rem',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          color: '#2d6a4f',
          border: '2px solid #2d6a4f',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2d6a4f';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#2d6a4f';
        }}
      >
        {t('especieDetail.volver')}
      </button>

      {/* Cabecera */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '2px solid #2d6a4f',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Imagen */}
        {especie.image_url && (
          <div style={{
            width: '100%',
            height: '300px',
            overflow: 'hidden',
            backgroundColor: '#f0f8f5'
          }}>
            <img
              src={especie.image_url}
              alt={especie.nombre_comun}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Contenido */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: '#2d6a4f', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                🌲 {especie.nombre_comun}
              </h1>
              <span style={{
                backgroundColor: especie.disponible ? '#d4edda' : '#f8d7da',
                color: especie.disponible ? '#155724' : '#721c24',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                {especie.disponible ? t('especieDetail.disponible') : t('especieDetail.noDisponible')}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f', margin: 0 }}>
                {especie.precio_plantacion.toFixed(2)}€
              </p>
              <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>{t('especieDetail.porArbol')}</p>
            </div>
          </div>

          {/* Descripcion */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#2d6a4f', marginTop: 0, marginBottom: '0.5rem' }}>{t('especieDetail.descripcion')}</h3>
            <p style={{ color: '#555', lineHeight: '1.6', margin: 0 }}>
              {especie.descripcion || t('especieDetail.sinDescripcion')}
            </p>
          </div>

          {/* Datos */}
          <div style={{
            marginTop: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>{t('especieDetail.zona')}</p>
              <p style={styles.statValue}>📍 {especie.zona_geografica || t('especieDetail.noEspecificada')}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>{t('especieDetail.co2')}</p>
              <p style={styles.statValue}>🌿 {especie.co2_anual_kg} kg</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>{t('especieDetail.altura')}</p>
              <p style={styles.statValue}>📏 {especie.altura_maxima_m} m</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>{t('especieDetail.temporada')}</p>
              <p style={styles.statValue}>
                📅 {especie.fecha_temporada
                  ? new Date(especie.fecha_temporada).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                  : t('especieDetail.noEspecificada')}
              </p>
            </div>
          </div>

          {/* Boton plantar */}
          {especie.disponible && (
            <button
              onClick={handlePlantarClick}
              style={{
                marginTop: '2rem',
                width: '100%',
                padding: '16px',
                backgroundColor: '#2d6a4f',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
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
              {t('especieDetail.plantarAhora')}
            </button>
          )}
        </div>
      </div>

      {/* Modal Donacion */}
      {showDonacionModal && especie && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowDonacionModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#2d6a4f', margin: 0 }}>{t('donacion.plantar')} {especie.nombre_comun}</h2>
              <button
                onClick={() => setShowDonacionModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDonacionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('donacion.cantidad')}</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={donacionForm.cantidad_arboles}
                  onChange={(e) => setDonacionForm({ cantidad_arboles: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{
                backgroundColor: '#f0f7f4',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#2d6a4f'
              }}>
                {t('donacion.total')} {(donacionForm.cantidad_arboles * especie.precio_plantacion).toFixed(2)}€
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDonacionModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {t('common.cancelar')}
                </button>
                <button
                  type="submit"
                  disabled={savingDonacion}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: savingDonacion ? '#88b89a' : '#2d6a4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: savingDonacion ? 'not-allowed' : 'pointer'
                  }}
                >
                  {savingDonacion ? t('donacion.plantando') : t('donacion.confirmarCorto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  statCard: {
    backgroundColor: '#f0f8f5',
    borderRadius: '10px',
    padding: '1rem',
    textAlign: 'center' as const,
  },
  statLabel: {
    fontSize: '12px',
    color: '#999',
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
    marginBottom: '4px',
    marginTop: 0,
  },
  statValue: {
    fontSize: '16px',
    color: '#2d6a4f',
    fontWeight: 'bold' as const,
    margin: 0,
  },
};
