import { useEffect, useState, useMemo } from 'react';
import { getAllDonaciones } from '../services/donacionService';
import { getAllEspecies } from '../services/especieService';
import { getAllUsuarios } from '../services/usuarioService';
import { getCurrentUser } from '../services/authService';
import type { Donacion } from '../types/donacion';
import type { Especie } from '../types/especie';
import type { Usuario } from '../types/usuario';

type SortField = 'fecha' | 'total_donado' | 'cantidad_arboles' | 'estado';
type SortDir = 'asc' | 'desc';

const COLORS = {
  green: '#2d6a4f',
  lightGreen: '#d4edda',
  yellow: '#fff3cd',
  red: '#f8d7da',
  blue: '#d1ecf1',
  gray: '#f8f9fa',
};

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: `2px solid ${color}`,
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      flex: '1 1 160px',
    }}>
      <p style={{ fontSize: '2rem', fontWeight: 'bold', color, margin: '0 0 0.4rem 0' }}>{value}</p>
      <p style={{ color: '#555', fontSize: '0.9rem', margin: 0 }}>{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');

  // Ordenación
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        const admin = user.rol === 'ROLE_ADMIN';
        setIsAdmin(admin);

        const [donData, espData] = await Promise.all([
          getAllDonaciones(),
          getAllEspecies(),
        ]);

        setEspecies(espData);

        if (admin) {
          const usrData = await getAllUsuarios();
          setUsuarios(usrData);
          setDonaciones(donData);
        } else {
          const propias = donData.filter(d => {
            const uid = d.usuario?.id ?? d.id_usuario;
            return uid === user.id;
          });
          setDonaciones(propias);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortArrow = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const filtered = useMemo(() => {
    let rows = [...donaciones];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(d => d.nombre_donante.toLowerCase().includes(q));
    }
    if (filterEstado) {
      rows = rows.filter(d => d.estado.toUpperCase() === filterEstado.toUpperCase());
    }
    if (filterDesde) {
      rows = rows.filter(d => d.fecha >= filterDesde);
    }
    if (filterHasta) {
      rows = rows.filter(d => d.fecha <= filterHasta);
    }

    rows.sort((a, b) => {
      let va: number | string = a[sortField];
      let vb: number | string = b[sortField];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [donaciones, search, filterEstado, filterDesde, filterHasta, sortField, sortDir]);

  const totalRecaudado = filtered.reduce((s, d) => s + d.total_donado, 0);
  const totalArboles = filtered.reduce((s, d) => s + d.cantidad_arboles, 0);
  const co2Total = +(totalArboles * 20).toFixed(0);

  const estadoStyle = (estado: string) => {
    const e = estado.toUpperCase();
    if (e === 'COMPLETADA' || e === 'COMPLETADO') return { backgroundColor: COLORS.lightGreen, color: '#155724' };
    if (e === 'CANCELADA' || e === 'CANCELADO') return { backgroundColor: COLORS.red, color: '#721c24' };
    return { backgroundColor: COLORS.yellow, color: '#856404' };
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: COLORS.green }}>
      Cargando dashboard...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#dc3545', fontSize: '1.1rem' }}>
      ❌ {error}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Cabecera */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: COLORS.green, margin: '0 0 0.3rem 0' }}>
          {isAdmin ? 'Dashboard — Administración' : `Dashboard — ${currentUser?.nombre}`}
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          {isAdmin ? 'Resumen global del sistema' : 'Resumen de tus donaciones'}
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <SummaryCard label="Donaciones" value={donaciones.length} color={COLORS.green} />
        <SummaryCard label="Total recaudado" value={`${donaciones.reduce((s,d)=>s+d.total_donado,0).toFixed(2)}€`} color="#1a7abf" />
        <SummaryCard label="Árboles plantados" value={donaciones.reduce((s,d)=>s+d.cantidad_arboles,0)} color="#e67e22" />
        <SummaryCard label="CO₂ compensado (est.)" value={`${(donaciones.reduce((s,d)=>s+d.cantidad_arboles,0)*20)} kg`} color="#27ae60" />
        {isAdmin && <SummaryCard label="Usuarios registrados" value={usuarios.length} color="#8e44ad" />}
        {isAdmin && <SummaryCard label="Especies en catálogo" value={especies.length} color="#16a085" />}
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}>
        <div style={{ flex: '2 1 200px' }}>
          <label style={labelStyle}>Buscar donante</label>
          <input
            type="text"
            placeholder="Nombre del donante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <label style={labelStyle}>Estado</label>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={inputStyle}>
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <label style={labelStyle}>Desde</label>
          <input type="date" value={filterDesde} onChange={e => setFilterDesde(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <label style={labelStyle}>Hasta</label>
          <input type="date" value={filterHasta} onChange={e => setFilterHasta(e.target.value)} style={inputStyle} />
        </div>

        <button
          onClick={() => { setSearch(''); setFilterEstado(''); setFilterDesde(''); setFilterHasta(''); }}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#e0e0e0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            alignSelf: 'flex-end',
          }}
        >
          Limpiar
        </button>
      </div>

      {/* Resumen de filtros activos */}
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
        Mostrando <strong>{filtered.length}</strong> de <strong>{donaciones.length}</strong> donaciones
        {filtered.length > 0 && (
          <> — <strong>{totalArboles}</strong> árboles · <strong>{totalRecaudado.toFixed(2)}€</strong> · <strong>{co2Total} kg</strong> CO₂</>
        )}
      </p>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: COLORS.gray,
          borderRadius: '12px',
          border: '2px dashed #ccc',
          color: '#999',
          fontSize: '1.1rem',
        }}>
          No hay donaciones que coincidan con los filtros aplicados.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.green, color: 'white' }}>
                <th style={thStyle} onClick={() => handleSort('fecha')} title="Ordenar por fecha">
                  Fecha{sortArrow('fecha')}
                </th>
                <th style={thStyle}>Donante</th>
                <th style={thStyle} onClick={() => handleSort('cantidad_arboles')} title="Ordenar por árboles">
                  Árboles{sortArrow('cantidad_arboles')}
                </th>
                <th style={thStyle} onClick={() => handleSort('total_donado')} title="Ordenar por total">
                  Total{sortArrow('total_donado')}
                </th>
                <th style={thStyle} onClick={() => handleSort('estado')} title="Ordenar por estado">
                  Estado{sortArrow('estado')}
                </th>
                <th style={thStyle}>Pagado</th>
                {isAdmin && <th style={thStyle}>Usuario ID</th>}
                {isAdmin && <th style={thStyle}>Especie ID</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={d.id}
                  style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f8f5')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#fff' : '#fafafa')}
                >
                  <td style={tdStyle}>
                    {new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '600', color: COLORS.green }}>{d.nombre_donante}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>🌳 {d.cantidad_arboles}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>{d.total_donado.toFixed(2)}€</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{
                      ...estadoStyle(d.estado),
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}>
                      {d.estado}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {d.pagado
                      ? <span style={{ color: '#155724', fontWeight: '600' }}>✓ Sí</span>
                      : <span style={{ color: '#721c24' }}>✗ No</span>
                    }
                  </td>
                  {isAdmin && <td style={{ ...tdStyle, textAlign: 'center', color: '#888' }}>#{d.usuario?.id ?? d.id_usuario}</td>}
                  {isAdmin && <td style={{ ...tdStyle, textAlign: 'center', color: '#888' }}>#{d.especie?.id ?? d.id_especie}</td>}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f0f8f5', fontWeight: '700', borderTop: '2px solid #2d6a4f' }}>
                <td style={tdStyle} colSpan={isAdmin ? 2 : 2}>Total ({filtered.length})</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>🌳 {totalArboles}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: COLORS.green }}>{totalRecaudado.toFixed(2)}€</td>
                <td style={tdStyle} colSpan={isAdmin ? 4 : 2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#555',
  marginBottom: '4px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};

const thStyle: React.CSSProperties = {
  padding: '0.85rem 1rem',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: '0.85rem',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.9rem',
  borderBottom: '1px solid #f0f0f0',
};
