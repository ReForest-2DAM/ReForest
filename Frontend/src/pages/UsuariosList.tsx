import { useEffect, useState } from 'react';
import { getAllUsuarios, deleteUsuario, updateUsuario, createUsuario } from '../services/usuarioService';
import { getCurrentUser } from '../services/authService';
import type { Usuario } from '../types';

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', email: '', rol: 'USER' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ nombre: '', email: '', contrasena: '', rol: 'USER' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuario = await getCurrentUser();
        if (usuario.rol !== 'ROLE_ADMIN') {
          setError('No tienes permisos para acceder a esta página.');
          setLoading(false);
          return;
        }
        setIsAdmin(true);
        const data = await getAllUsuarios();
        setUsuarios(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const nuevo = await createUsuario(createForm);
      setUsuarios([...usuarios, nuevo]);
      setShowCreateModal(false);
      setCreateForm({ nombre: '', email: '', contrasena: '', rol: 'USER' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: unknown }; message?: string };
      alert(axiosErr.response
        ? `Error del servidor: ${axiosErr.response.status} - ${JSON.stringify(axiosErr.response.data)}`
        : axiosErr.message || 'Error al crear el usuario');
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setEditForm({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUsuario(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUsuario) return;
    setSaving(true);
    try {
      const actualizado = await updateUsuario(editingUsuario.id, {
        nombre: editForm.nombre,
        email: editForm.email,
        rol: editForm.rol,
        contrasena: 'nochange123'
      });
      setUsuarios(usuarios.map(u => u.id === editingUsuario.id ? actualizado : u));
      closeModal();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: unknown }; message?: string };
      alert(axiosErr.response
        ? `Error del servidor: ${axiosErr.response.status} - ${JSON.stringify(axiosErr.response.data)}`
        : axiosErr.message || 'Error al actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a "${usuario.nombre}"?`)) return;
    try {
      await deleteUsuario(usuario.id);
      setUsuarios(usuarios.filter(u => u.id !== usuario.id));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: unknown }; message?: string };
      alert(axiosErr.response
        ? `Error del servidor: ${axiosErr.response.status} - ${JSON.stringify(axiosErr.response.data)}`
        : axiosErr.message || 'Error al eliminar el usuario');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px', color: '#2d6a4f' }}>
        👤 Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#d00', fontSize: '18px' }}>
        ❌ {error}
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h1 style={{ color: '#2d6a4f', margin: 0 }}>👥 Gestión de Usuarios</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px', backgroundColor: '#2d6a4f', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '15px',
            fontWeight: 'bold', cursor: 'pointer'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1b4332'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2d6a4f'; }}
        >
          ➕ Crear Usuario
        </button>
      </div>
      <p style={{ marginBottom: '2rem', color: '#555', fontSize: '16px' }}>
        {usuarios.length} usuarios registrados
      </p>

      {usuarios.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          backgroundColor: '#f8f9fa', borderRadius: '12px',
          border: '2px dashed #2d6a4f'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#2d6a4f' }}>No hay usuarios registrados</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              style={{
                border: '2px solid #2d6a4f',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              <div>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>ID</p>
                <p style={{ fontSize: '18px', color: '#2d6a4f', fontWeight: 'bold', margin: 0 }}>#{usuario.id}</p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Nombre</p>
                <p style={{ fontSize: '16px', color: '#333', margin: 0 }}>👤 {usuario.nombre}</p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Email</p>
                <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>✉️ {usuario.email}</p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Rol</p>
                <span style={{
                  backgroundColor: usuario.rol === 'ROLE_ADMIN' ? '#d4edda' : '#cce5ff',
                  color: usuario.rol === 'ROLE_ADMIN' ? '#155724' : '#004085',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  {usuario.rol === 'ROLE_ADMIN' ? '🔑 ADMIN' : '👤 USER'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleEditClick(usuario)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f0ad4e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d9952b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0ad4e'; }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(usuario)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#d9534f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b52b27'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d9534f'; }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      <div style={{
        marginTop: '3rem', padding: '2rem',
        backgroundColor: '#f0f8f5', borderRadius: '12px',
        border: '2px solid #2d6a4f'
      }}>
        <h2 style={{ color: '#2d6a4f', marginBottom: '1.5rem', textAlign: 'center' }}>
          📊 Estadísticas de Usuarios
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f', margin: '0 0 0.5rem 0' }}>
              {usuarios.length}
            </p>
            <p style={{ color: '#555' }}>👥 Total Usuarios</p>
          </div>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f', margin: '0 0 0.5rem 0' }}>
              {usuarios.filter(u => u.rol === 'ROLE_ADMIN').length}
            </p>
            <p style={{ color: '#555' }}>🔑 Administradores</p>
          </div>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f', margin: '0 0 0.5rem 0' }}>
              {usuarios.filter(u => u.rol.toUpperCase() === 'USER').length}
            </p>
            <p style={{ color: '#555' }}>👤 Usuarios normales</p>
          </div>
        </div>
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff', borderRadius: '16px', padding: '30px',
              width: '90%', maxWidth: '450px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#2d6a4f', margin: 0 }}>➕ Crear Usuario</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Nombre</label>
                <input
                  type="text"
                  required
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.contrasena}
                  onChange={(e) => setCreateForm({ ...createForm, contrasena: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Rol</label>
                <select
                  value={createForm.rol}
                  onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1, padding: '12px', backgroundColor: '#e0e0e0',
                    color: '#333', border: 'none', borderRadius: '8px',
                    fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 1, padding: '12px',
                    backgroundColor: creating ? '#88b89a' : '#2d6a4f',
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '16px', fontWeight: 'bold',
                    cursor: creating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {creating ? 'Creando...' : '➕ Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showModal && editingUsuario && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#fff', borderRadius: '16px', padding: '30px',
              width: '90%', maxWidth: '450px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#2d6a4f', margin: 0 }}>✏️ Editar Usuario #{editingUsuario.id}</h2>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Nombre</label>
                <input
                  type="text"
                  required
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Rol</label>
                <select
                  value={editForm.rol}
                  onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1, padding: '12px', backgroundColor: '#e0e0e0',
                    color: '#333', border: 'none', borderRadius: '8px',
                    fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: '12px',
                    backgroundColor: saving ? '#88b89a' : '#2d6a4f',
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '16px', fontWeight: 'bold',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Guardando...' : '✏️ Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
