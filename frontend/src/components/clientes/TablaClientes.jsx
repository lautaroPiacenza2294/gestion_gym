import { Eye, Edit2, Trash2, User, CreditCard, CheckCircle2, Clock } from 'lucide-react';

// ── Badge de estado de membresía ─────────────────────────────────────────────
const MembresíaBadge = ({ mem }) => {
  if (!mem) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-400 border border-gray-200">
        Sin membresía
      </span>
    );
  }

  const hoy = new Date();
  const fin = new Date(mem.fecha_fin + 'T00:00:00');
  const diasRestantes = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
  const estadoRaw = mem.estado;

  const vencida = estadoRaw === 'Vencida' || estadoRaw === 'vencida' || diasRestantes < 0;
  const porVencer = !vencida && diasRestantes <= 7;

  if (vencida) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
        Vencida
      </span>
    );
  }

  if (porVencer) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
        Vence en {diasRestantes}d
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
      {diasRestantes}d restantes
    </span>
  );
};

// ── Celda de membresía ───────────────────────────────────────────────────────
const CeldaMembresia = ({ mem }) => {
  const formatFecha = (f) => {
    if (!f) return null;
    return new Date(f + 'T00:00:00').toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short',
    });
  };

  return (
    <div className="flex flex-col gap-1 min-w-0">
      {mem ? (
        <>
          <span className="text-xs font-semibold text-gray-700 truncate">
            {mem.plan_nombre || mem.plan}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <MembresíaBadge mem={mem} />
            {mem.fecha_fin && (
              <span className="text-[11px] text-gray-400">
                vence {formatFecha(mem.fecha_fin)}
              </span>
            )}
          </div>
        </>
      ) : (
        <span className="text-xs text-gray-400 italic">—</span>
      )}
    </div>
  );
};

// ── Badge de estado de pago ───────────────────────────────────────────────────
const PagoBadge = ({ clienteId, mem, pendientesPagoIds }) => {
  if (!mem || mem.estado === 'vencida' || mem.estado === 'Vencida') {
    return <span className="text-xs text-gray-300">—</span>;
  }
  const pendiente = pendientesPagoIds.has(clienteId);
  if (pendiente) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
        <Clock size={10} />
        Pendiente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      <CheckCircle2 size={10} />
      Al día
    </span>
  );
};

// ── Tabla principal ──────────────────────────────────────────────────────────
const TablaClientes = ({ clientes = [], membresiasMap = {}, pendientesPagoIds = new Set(), onVerDetalle, onEditar, onEliminar }) => {
  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <CreditCard size={13} className="text-gray-400" />
                  Membresía
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100" key={clientes.map(c => c.id).join('-')}>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">
                  No se encontraron clientes en la base de datos.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => {
                const mem = membresiasMap[cliente.id] || null;
                return (
                  <tr key={cliente.id} className="hover:bg-blue-50/30 transition-colors duration-150 ease-in-out group">

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                        #{cliente.id}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <User size={18} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 leading-tight">
                            {cliente.nombre} {cliente.apellido}
                          </div>
                          <div className="text-xs text-gray-500">{cliente.email || 'Sin email'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cliente.telefono || <span className="text-gray-300">N/A</span>}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <PagoBadge clienteId={cliente.id} mem={mem} pendientesPagoIds={pendientesPagoIds} />
                    </td>

                    <td className="px-6 py-4">
                      <CeldaMembresia mem={mem} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        cliente.activo
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${cliente.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => onVerDetalle(cliente)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200 hover:shadow-md"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEditar(cliente)}
                          className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-all duration-200 hover:shadow-md"
                          title="Editar cliente"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => onEliminar(cliente)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all duration-200 hover:shadow-md"
                          title="Eliminar cliente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaClientes;
