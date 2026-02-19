import { useState, useEffect, useCallback } from 'react';
import {
  Clock, DollarSign, User, Banknote, Loader2,
  CheckCircle, AlertCircle, X, RefreshCw
} from 'lucide-react';
import { membresiasAPI, pagosAPI } from '../../services';

const METODOS_PAGO = [
  { value: 'efectivo',       label: 'Efectivo' },
  { value: 'transferencia',  label: 'Transferencia' },
  { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
  { value: 'tarjeta_credito','label': 'Tarjeta de Crédito' },
  { value: 'mercadopago',    label: 'Mercado Pago' },
];

const formatMonto = (m) =>
  m != null ? `$${new Intl.NumberFormat('es-AR').format(m)}` : '-';

const formatFecha = (f) => {
  if (!f) return '-';
  return new Date(f + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ── Modal inline para registrar el pago ──────────────────────────────────────
const ModalPago = ({ membresia, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    monto: String(membresia.precio_contratado || ''),
    metodo_pago: 'efectivo',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.monto || parseFloat(form.monto) <= 0) {
      return setError('Ingresá un monto válido');
    }
    try {
      setSubmitting(true);
      await pagosAPI.create({
        cliente:      membresia.cliente,
        membresia:    membresia.id,
        fecha_pago:   new Date().toISOString().split('T')[0],
        monto:        parseFloat(form.monto),
        metodo_pago:  form.metodo_pago,
        concepto:     'membresia',
      });
      onSuccess();
    } catch (err) {
      const detail = err?.response?.data;
      if (detail && typeof detail === 'object') {
        setError(Object.values(detail).flat().join(' '));
      } else {
        setError('Error al registrar el pago');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg ' +
    'focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex justify-between items-center">
          <div>
            <p className="text-white font-bold text-sm">Registrar Pago</p>
            <p className="text-blue-100 text-xs">
              {membresia.cliente_nombre} {membresia.cliente_apellido}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Info membresía */}
          <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-800">
            <span className="font-semibold">{membresia.plan_nombre}</span>
            <span className="text-blue-500"> · </span>
            <span>Inicio: {formatFecha(membresia.fecha_inicio)}</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Monto *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="number"
                value={form.monto}
                onChange={e => setForm(p => ({ ...p, monto: e.target.value }))}
                placeholder="0"
                min="1"
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>

          {/* Método */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Método *</label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select
                value={form.metodo_pago}
                onChange={e => setForm(p => ({ ...p, metodo_pago: e.target.value }))}
                className={`${inputCls} pl-8`}
              >
                {METODOS_PAGO.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 border border-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 disabled:opacity-50 transition-all active:scale-95"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {submitting ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────
const PendientesPago = ({ refresh = 0 }) => {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalPago, setModalPago]   = useState(null); // membresia seleccionada
  const [refreshInterno, setRefreshInterno] = useState(0);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await membresiasAPI.getSinPago();
      const lista = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setPendientes(lista);
    } catch {
      setPendientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar, refresh, refreshInterno]);

  const handlePagoExitoso = () => {
    setModalPago(null);
    setRefreshInterno(p => p + 1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">Cargando pagos pendientes...</span>
        </div>
      </div>
    );
  }

  if (pendientes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-3">
        <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-700">Sin pagos pendientes</p>
          <p className="text-xs text-gray-400">Todos los socios activos tienen su pago registrado.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">Pagos Pendientes</h3>
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
              {pendientes.length}
            </span>
          </div>
          <button
            onClick={() => setRefreshInterno(p => p + 1)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Lista */}
        <ul className="divide-y divide-gray-50">
          {pendientes.map((mem) => (
            <li key={mem.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-amber-50/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
                  <User size={14} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {mem.cliente_nombre} {mem.cliente_apellido}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {mem.plan_nombre} · desde {formatFecha(mem.fecha_inicio)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-gray-700">
                  {formatMonto(mem.precio_contratado)}
                </span>
                <button
                  onClick={() => setModalPago(mem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 active:scale-95"
                >
                  <DollarSign size={12} />
                  Pagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de pago */}
      {modalPago && (
        <ModalPago
          membresia={modalPago}
          onClose={() => setModalPago(null)}
          onSuccess={handlePagoExitoso}
        />
      )}
    </>
  );
};

export default PendientesPago;
