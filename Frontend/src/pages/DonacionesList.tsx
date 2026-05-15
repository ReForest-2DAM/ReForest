import { useEffect, useState } from 'react';
import { getAllDonaciones, updateDonacion, deleteDonacion } from '../services';
import { getCurrentUser } from '../services/authService';
import type { Donacion } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

export default function DonacionesList() {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDonacion, setEditingDonacion] = useState<Donacion | null>(null);
  const [editForm, setEditForm] = useState({ cantidad_arboles: 1, estado: '', pagado: false });
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDonaciones = async () => {
      try {
        const usuario = await getCurrentUser();
        const esAdmin = usuario.rol.toUpperCase() === 'ADMIN';
        setIsAdmin(esAdmin);

        // Obtener todas las donaciones
        const data = await getAllDonaciones();

        // Si es admin, mostrar todas; si no, solo las del usuario actual
        if (esAdmin) {
          setDonaciones(data);
        } else {
          // Filtrar solo las donaciones del usuario actual
          const donacionesUsuario = data.filter(d => {
            const donacionUsuarioId = d.usuario?.id ?? d.id_usuario;
            return donacionUsuarioId === usuario.id;
          });
          setDonaciones(donacionesUsuario);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las donaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchDonaciones();
  }, []);

  const handleEditClick = (donacion: Donacion) => {
    setEditingDonacion(donacion);
    setEditForm({
      cantidad_arboles: donacion.cantidad_arboles,
      estado: donacion.estado,
      pagado: donacion.pagado
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDonacion(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonacion) return;
    setSaving(true);
    try {
      // Obtener IDs de especie y usuario (soporta tanto objetos anidados como IDs planos)
      const especieId = editingDonacion.especie?.id ?? editingDonacion.id_especie;
      const usuarioId = editingDonacion.usuario?.id ?? editingDonacion.id_usuario;

      const dataToSend = {
        ...editForm,
        nombre_donante: editingDonacion.nombre_donante,
        fecha: editingDonacion.fecha,
        total_donado: editingDonacion.total_donado,
        especie: { id: especieId },
        usuario: { id: usuarioId }
      };
      const actualizada = await updateDonacion(editingDonacion.id, dataToSend as unknown as Partial<import('../types').DonacionFormData>);
      setDonaciones(donaciones.map(d => d.id === editingDonacion.id ? actualizada : d));
      closeModal();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: unknown }; message?: string };
      if (axiosErr.response) {
        alert(`${t('common.errorServidor')} ${axiosErr.response.status} - ${JSON.stringify(axiosErr.response.data)}`);
      } else {
        alert(axiosErr.message || t('donaciones.errorActualizar'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (donacion: Donacion) => {
    if (!window.confirm(`${t('donaciones.confirmarEliminar')} #${donacion.id}?`)) return;
    try {
      await deleteDonacion(donacion.id);
      setDonaciones(donaciones.filter(d => d.id !== donacion.id));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: unknown }; message?: string };
      if (axiosErr.response) {
        alert(`${t('common.errorServidor')} ${axiosErr.response.status} - ${JSON.stringify(axiosErr.response.data)}`);
      } else {
        alert(axiosErr.message || t('donaciones.errorEliminar'));
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px',
        fontSize: '20px',
        color: '#2d6a4f'
      }}>
        {t('donaciones.cargando')}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px',
        color: '#d00',
        fontSize: '18px'
      }}>
        ❌ {t('common.error')} {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#2d6a4f', marginBottom: '10px' }}>
        {t('donaciones.titulo')}
      </h1>
      <p style={{ marginBottom: '2rem', color: '#555', fontSize: '16px' }}>
        {donaciones.length} {t('donaciones.realizadas')}
      </p>

      {donaciones.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #2d6a4f'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#2d6a4f', marginBottom: '1rem' }}>
            {t('donaciones.noHay')}
          </p>
          <p style={{ color: '#666' }}>
            {t('donaciones.noHayDesc')}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {donaciones.map((donacion) => (
            <div
              key={donacion.id}
              style={{
                border: '2px solid #2d6a4f',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Info del donante */}
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '5px',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {t('donaciones.donante')}
                </p>
                <p style={{
                  fontSize: '18px',
                  color: '#2d6a4f',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  {donacion.nombre_donante}
                </p>
              </div>

              {/* Fecha */}
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '5px',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {t('donaciones.fecha')}
                </p>
                <p style={{
                  fontSize: '16px',
                  color: '#333',
                  margin: 0
                }}>
                  📅 {new Date(donacion.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Cantidad de árboles */}
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '5px',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {t('donaciones.arboles')}
                </p>
                <p style={{
                  fontSize: '22px',
                  color: '#2d6a4f',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  🌳 {donacion.cantidad_arboles}
                </p>
              </div>

              {/* Total donado */}
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '5px',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {t('donaciones.total')}
                </p>
                <p style={{
                  fontSize: '22px',
                  color: '#2d6a4f',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  💵 {donacion.total_donado.toFixed(2)}€
                </p>
              </div>

              {/* Estado y pagado */}
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '5px',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {t('donaciones.estado')}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: donacion.estado === 'completada' ? '#d4edda' : '#fff3cd',
                    color: donacion.estado === 'completada' ? '#155724' : '#856404',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {donacion.estado}
                  </span>

                  {donacion.pagado ? (
                    <span style={{
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}>
                      {t('donaciones.pagado')}
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#f8d7da',
                      color: '#721c24',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}>
                      {t('donaciones.pendientePago')}
                    </span>
                  )}
                </div>
              </div>

              {/* Botones Editar / Eliminar - Solo para ADMIN */}
              {isAdmin && (
                <div style={{
                  gridColumn: '1 / -1',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#999', display: 'flex', gap: '1rem' }}>
                    <span>{t('donaciones.idDonacion')} #{donacion.id}</span>
                    <span>{t('donaciones.idEspecie')} #{donacion.especie?.id ?? donacion.id_especie}</span>
                    <span>{t('donaciones.idUsuario')} #{donacion.usuario?.id ?? donacion.id_usuario}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEditClick(donacion)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f0ad4e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d9952b'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0ad4e'; }}
                    >
                      {t('common.editar')}
                    </button>
                    <button
                      onClick={() => handleDelete(donacion)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#d9534f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b52b27'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d9534f'; }}
                    >
                      {t('common.eliminar')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas totales */}
      {donaciones.length > 0 && (
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: '#f0f8f5',
          borderRadius: '12px',
          border: '2px solid #2d6a4f'
        }}>
          <h2 style={{ color: '#2d6a4f', marginBottom: '1.5rem', textAlign: 'center' }}>
            {t('donaciones.estadisticas')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f', margin: '0 0 0.5rem 0' }}>
                {donaciones.reduce((sum, d) => sum + d.cantidad_arboles, 0)}
              </p>
              <p style={{ color: '#555', fontSize: '1rem' }}>{t('donaciones.arbolesTotales')}</p>
            </div>

            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f', margin: '0 0 0.5rem 0' }}>
                {donaciones.reduce((sum, d) => sum + d.total_donado, 0).toFixed(2)}€
              </p>
              <p style={{ color: '#555', fontSize: '1rem' }}>{t('donaciones.totalRecaudado')}</p>
            </div>

            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f', margin: '0 0 0.5rem 0' }}>
                {donaciones.filter(d => d.pagado).length}
              </p>
              <p style={{ color: '#555', fontSize: '1rem' }}>{t('donaciones.pagadas')}</p>
            </div>

            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f', margin: '0 0 0.5rem 0' }}>
                {donaciones.filter(d => d.estado.toUpperCase() === 'COMPLETADA').length}
              </p>
              <p style={{ color: '#555', fontSize: '1rem' }}>{t('donaciones.completadas')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Donacion */}
      {showModal && editingDonacion && (
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
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '30px',
              width: '90%',
              maxWidth: '450px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#2d6a4f', margin: 0 }}>{t('donaciones.editarTitulo')} #{editingDonacion.id}</h2>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#f0f7f4', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '14px' }}>
              <p style={{ margin: '4px 0' }}>{t('donaciones.donanteLabel')} <strong>{editingDonacion.nombre_donante}</strong></p>
              <p style={{ margin: '4px 0' }}>{t('donaciones.totalLabel')} <strong>{editingDonacion.total_donado.toFixed(2)}€</strong></p>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('donaciones.cantidadArboles')}</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editForm.cantidad_arboles}
                  onChange={(e) => setEditForm({ ...editForm, cantidad_arboles: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('donaciones.estadoLabel')}</label>
                <select
                  value={editForm.estado}
                  onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="PENDIENTE">{t('donaciones.pendiente')}</option>
                  <option value="completada">{t('donaciones.completada')}</option>
                  <option value="cancelada">{t('donaciones.cancelada')}</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={editForm.pagado}
                  onChange={(e) => setEditForm({ ...editForm, pagado: e.target.checked })}
                  id="pagado-check"
                />
                <label htmlFor="pagado-check" style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('donaciones.pagadoLabel')}</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={closeModal}
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
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: saving ? '#88b89a' : '#2d6a4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? t('common.guardando') : t('common.guardarCambios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
