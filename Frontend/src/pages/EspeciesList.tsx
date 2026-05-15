import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEspecies, createEspecie, updateEspecie, deleteEspecie, createDonacion, getCurrentUser, isAuthenticated } from '../services';
import type { Especie, EspecieFormData } from '../types/especie';
import type { DonacionFormData } from '../types/donacion';
import { useTranslation } from '../i18n/LanguageContext';

export default function EspeciesList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EspecieFormData>({
    nombre_comun: '',
    descripcion: '',
    precio_plantacion: 0,
    zona_geografica: '',
    co2_anual_kg: 0,
    altura_maxima_m: 0,
    disponible: true,
    fecha_temporada: '',
    image_url: ''
  });
  const [showDonacionModal, setShowDonacionModal] = useState(false);
  const [donacionEspecie, setDonacionEspecie] = useState<Especie | null>(null);
  const [donacionForm, setDonacionForm] = useState({ nombre_donante: '', cantidad_arboles: 1 });
  const [savingDonacion, setSavingDonacion] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handlePlantarClick = (especie: Especie) => {
    if (!isAuthenticated()) {
      alert(t('especies.debesIniciar'));
      return;
    }
    setDonacionEspecie(especie);
    setDonacionForm({ nombre_donante: '', cantidad_arboles: 1 });
    setShowDonacionModal(true);
  };

  const closeDonacionModal = () => {
    setShowDonacionModal(false);
    setDonacionEspecie(null);
  };

  const handleDonacionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donacionEspecie) return;
    setSavingDonacion(true);
    try {
      const usuario = await getCurrentUser();
      const totalDonado = donacionForm.cantidad_arboles * donacionEspecie.precio_plantacion;
      const donacion = {
        fecha: new Date().toISOString().split('T')[0] + 'T00:00:00',
        nombre_donante: usuario.nombre,
        cantidad_arboles: donacionForm.cantidad_arboles,
        total_donado: totalDonado,
        estado: 'PENDIENTE',
        pagado: false,
        especie: { id: donacionEspecie.id },
        usuario: { id: usuario.id }
      };
      console.log('📤 Creando donacion:', donacion);
      await createDonacion(donacion as unknown as DonacionFormData);
      closeDonacionModal();
      alert(t('donacion.creada'));
    } catch (err: unknown) {
      console.error('❌ Error completo:', err);
      const axiosErr = err as { response?: { status: number; data: unknown }; message?: string };
      if (axiosErr.response) {
        alert(`${t('common.errorServidor')} ${axiosErr.response.status} - ${JSON.stringify(axiosErr.response.data)}`);
      } else {
        alert(`${t('common.error')} ${axiosErr.message || t('common.errorConexion')}`);
      }
    } finally {
      setSavingDonacion(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_comun: '',
      descripcion: '',
      precio_plantacion: 0,
      zona_geografica: '',
      co2_anual_kg: 0,
      altura_maxima_m: 0,
      disponible: true,
      fecha_temporada: '',
      image_url: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        fecha_temporada: formData.fecha_temporada
          ? formData.fecha_temporada.includes('T')
            ? formData.fecha_temporada
            : formData.fecha_temporada + 'T00:00:00'
          : '',
        image_url: formData.image_url || ''
      };
      console.log('📤 Enviando datos:', dataToSend);
      if (editingId !== null) {
        const actualizada = await updateEspecie(editingId, dataToSend);
        setEspecies(especies.map(esp => esp.id === editingId ? actualizada : esp));
      } else {
        const nuevaEspecie = await createEspecie(dataToSend);
        setEspecies([...especies, nuevaEspecie]);
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : editingId ? t('especies.errorActualizar') : t('especies.errorCrear'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (especie: Especie) => {
    setEditingId(especie.id);
    setFormData({
      nombre_comun: especie.nombre_comun,
      descripcion: especie.descripcion,
      precio_plantacion: especie.precio_plantacion,
      zona_geografica: especie.zona_geografica,
      co2_anual_kg: especie.co2_anual_kg,
      altura_maxima_m: especie.altura_maxima_m,
      disponible: especie.disponible,
      fecha_temporada: especie.fecha_temporada,
      image_url: especie.image_url
    });
    setShowModal(true);
  };

  const handleDeleteEspecie = async (especie: Especie) => {
    if (!window.confirm(`${t('especies.confirmarEliminar')} "${especie.nombre_comun}"?`)) return;
    try {
      console.log('🗑️ Eliminando especie ID:', especie.id);
      await deleteEspecie(especie.id);
      setEspecies(especies.filter(esp => esp.id !== especie.id));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: unknown } };
      console.error('❌ Error al eliminar:', axiosErr.response?.status, axiosErr.response?.data);
      alert(`${t('especies.errorEliminar')} ${axiosErr.response?.status} - ${JSON.stringify(axiosErr.response?.data)}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  useEffect(() => {
    const fetchEspecies = async () => {
      try {
        console.log('🔍 Llamando a getAllEspecies...');
        const data = await getAllEspecies();
        console.log('✅ Especies recibidas:', data);
        setEspecies(data);
      } catch (err) {
        console.error('❌ Error al cargar especies:', err);
        setError(err instanceof Error ? err.message : t('especies.errorCargarLista'));
      } finally {
        setLoading(false);
      }
    };

    const checkAdmin = async () => {
      try {
        const usuario = await getCurrentUser();
        setIsAdmin(usuario.rol.toUpperCase() === 'ADMIN');
      } catch {
        setIsAdmin(false);
      }
    };

    fetchEspecies();
    checkAdmin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px',
        fontSize: '20px',
        color: '#2d6a4f'
      }}>
        {t('especies.cargando')}
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
        ❌ {t('especies.errorCargar')} {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#2d6a4f', marginBottom: '10px' }}>
        {t('especies.titulo')}
      </h1>
      <p style={{ marginBottom: '1rem', color: '#555', fontSize: '16px' }}>
        {especies.length} {t('especies.disponibles')}
      </p>

      {/* Botón Crear Especie - Solo para ADMIN */}
      {isAdmin && (
        <button
          onClick={() => setShowModal(true)}
          style={{
            marginBottom: '2rem',
            padding: '12px 24px',
            backgroundColor: '#2d6a4f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1f4d37';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2d6a4f';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {t('especies.crearNueva')}
        </button>
      )}

      {especies.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>
          {t('especies.noHay')}
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '25px'
        }}>
          {especies.map((especie) => (
            <div
              key={especie.id}
              style={{
                border: '2px solid #2d6a4f',
                borderRadius: '12px',
                padding: '0',
                backgroundColor: '#fff',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/especies/${especie.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Imagen */}
              <img
                src={especie.image_url}
                alt={especie.nombre_comun}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/320x220/2d6a4f/ffffff?text=Sin+Imagen';
                }}
              />

              {/* Contenido */}
              <div style={{ padding: '20px' }}>
                {/* Título y disponibilidad */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    color: '#2d6a4f',
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 'bold'
                  }}>
                    {especie.nombre_comun}
                  </h3>

                  {especie.disponible ? (
                    <span style={{
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {t('especies.disponible')}
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#f8d7da',
                      color: '#721c24',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {t('especies.agotado')}
                    </span>
                  )}
                </div>

                {/* Descripción */}
                <p style={{
                  color: '#555',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '15px',
                  minHeight: '60px'
                }}>
                  {especie.descripcion}
                </p>

                {/* Datos técnicos */}
                <div style={{
                  borderTop: '1px solid #e0e0e0',
                  paddingTop: '15px',
                  fontSize: '14px'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px'
                  }}>
                    <div>
                      <strong>{t('especies.precio')}</strong><br/>
                      <span style={{ color: '#2d6a4f', fontSize: '18px', fontWeight: 'bold' }}>
                        {especie.precio_plantacion}€
                      </span>
                    </div>

                    <div>
                      <strong>{t('especies.co2')}</strong><br/>
                      <span style={{ color: '#2d6a4f', fontWeight: 'bold' }}>
                        {especie.co2_anual_kg} kg
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '5px 0' }}>
                      <strong>{t('especies.zona')}</strong> {especie.zona_geografica}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>{t('especies.altura')}</strong> {especie.altura_maxima_m}m
                    </p>
                  </div>
                </div>

                {/* Botón Plantar */}
                {especie.disponible && (
                  <button
                    style={{
                      width: '100%',
                      marginTop: '15px',
                      padding: '12px',
                      backgroundColor: '#2d6a4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f4d37';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2d6a4f';
                    }}
                    onClick={(e) => { e.stopPropagation(); handlePlantarClick(especie); }}
                  >
                    {t('especies.plantarAhora')}
                  </button>
                )}

                {/* Botones Editar / Eliminar - Solo para ADMIN */}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(especie); }}
                      style={{
                        flex: 1,
                        padding: '10px',
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
                      onClick={(e) => { e.stopPropagation(); handleDeleteEspecie(especie); }}
                      style={{
                        flex: 1,
                        padding: '10px',
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
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Especie */}
      {showModal && (
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
              maxWidth: '550px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#2d6a4f', margin: 0 }}>{editingId ? t('especieForm.editarTitulo') : t('especieForm.crearTitulo')}</h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.nombre')}</label>
                <input
                  type="text"
                  required
                  value={formData.nombre_comun}
                  onChange={(e) => setFormData({ ...formData, nombre_comun: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.descripcion')}</label>
                <textarea
                  required
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.precio')}</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.01}
                    value={formData.precio_plantacion}
                    onChange={(e) => setFormData({ ...formData, precio_plantacion: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.co2')}</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.1}
                    value={formData.co2_anual_kg}
                    onChange={(e) => setFormData({ ...formData, co2_anual_kg: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.zona')}</label>
                  <input
                    type="text"
                    required
                    value={formData.zona_geografica}
                    onChange={(e) => setFormData({ ...formData, zona_geografica: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.altura')}</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.1}
                    value={formData.altura_maxima_m}
                    onChange={(e) => setFormData({ ...formData, altura_maxima_m: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.fecha')}</label>
                <input
                  type="date"
                  required
                  value={formData.fecha_temporada}
                  onChange={(e) => setFormData({ ...formData, fecha_temporada: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.imagen')}</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder={t('especieForm.imagenPlaceholder')}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.disponible}
                  onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                  id="disponible-check"
                />
                <label htmlFor="disponible-check" style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('especieForm.disponible')}</label>
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
                  {saving ? t('common.guardando') : editingId ? t('common.guardarCambios') : t('common.crearEspecie')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Donacion */}
      {showDonacionModal && donacionEspecie && (
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
          onClick={closeDonacionModal}
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
              <h2 style={{ color: '#2d6a4f', margin: 0 }}>{t('donacion.plantar')} {donacionEspecie.nombre_comun}</h2>
              <button
                onClick={closeDonacionModal}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#f0f7f4', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '14px' }}>
              <p style={{ margin: '4px 0' }}>{t('donacion.precioArbol')} <strong>{donacionEspecie.precio_plantacion}€</strong></p>
              <p style={{ margin: '4px 0' }}>{t('donacion.co2Arbol')} <strong>{donacionEspecie.co2_anual_kg} kg</strong></p>
              <p style={{ margin: '4px 0' }}>{t('donacion.zonaModal')} <strong>{donacionEspecie.zona_geografica}</strong></p>
            </div>

            <form onSubmit={handleDonacionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{t('donacion.cantidad')}</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={donacionForm.cantidad_arboles}
                  onChange={(e) => setDonacionForm({ ...donacionForm, cantidad_arboles: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ backgroundColor: '#2d6a4f', color: 'white', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>{t('donacion.totalDonar')}</p>
                <p style={{ margin: '5px 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                  {(donacionForm.cantidad_arboles * donacionEspecie.precio_plantacion).toFixed(2)}€
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={closeDonacionModal}
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
                  {savingDonacion ? t('donacion.procesando') : t('donacion.confirmar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
