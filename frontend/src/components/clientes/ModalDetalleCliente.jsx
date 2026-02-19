import { useState, useEffect } from 'react';
import {
  X, User, Mail, Phone, CreditCard, Calendar, RefreshCw,
  AlertCircle, Loader2, CheckCircle, XCircle, DollarSign,
  ClipboardList, Banknote, ShieldAlert, UserCheck
} from 'lucide-react';
import { clientesAPI, membresiasAPI, planesAPI, pagosAPI } from '../../services';

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
  { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
  { value: 'mercadopago', label: 'Mercado Pago' },
];

const getHoy = () => new Date().toISOString().split('T')[0];
const getUnMesDespues = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

const EstadoBadge = ({ estado }) => {
  const config = {
    activa:     { icon: CheckCircle,  text: 'Activa',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    vencida:    { icon: XCircle,      text: 'Vencida',    cls: 'bg-rose-50 text-rose-700 border-rose-100' },
    suspendida: { icon: ShieldAlert,  text: 'Suspendida', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    cancelada:  { icon: XCircle,      text: 'Cancelada',  cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const c = config[estado?.toLowerCase()] || config.vencida;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      <Icon size={12} />
      {c.text}
    </span>
  );
};

const getEstadoInicial = () => ({
  plan: '',
  fecha_inicio: getHoy(),
  fecha_fin: getUnMesDespues(),
  registrarPago: false,
  metodo_pago: 'efectivo',
  monto: '',
});

const ModalDetalleCliente = ({ isOpen, onClose, onSuccess, cliente }) => {
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [planes, setPlanes]                 = useState([]);
  const [membresiaActual, setMembresiaActual] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [activando, setActivando]     = useState(false);
  const [resultadoExito, setResultadoExito] = useState(null); // { mensaje, submensaje }

  const [form, setForm] = useState(getEstadoInicial);

  // ── Cargar datos al abrir ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !cliente) return;

    setError(null);
    setResultadoExito(null);
    setMostrarForm(false);
    setForm(getEstadoInicial());

    const cargar = async () => {
      setLoading(true);
      try {
        const [detRes, memRes, planRes] = await Promise.all([
          clientesAPI.getById(cliente.id),
          membresiasAPI.getByCliente(cliente.id),
          planesAPI.getAll(),
        ]);

        setClienteDetalle(detRes.data);

        const lista = Array.isArray(memRes.data)
          ? memRes.data
          : (memRes.data?.results || []);

        // La membresía con fecha_fin más reciente
        const actual = lista.length > 0
          ? lista.reduce((a, b) => new Date(a.fecha_fin) > new Date(b.fecha_fin) ? a : b)
          : null;
        setMembresiaActual(actual);

        const activos = (Array.isArray(planRes.data) ? planRes.data : (planRes.data?.results || []))
          .filter(p => p.activo);
        setPlanes(activos);
      } catch {
        setError('No se pudo cargar la información del cliente');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [isOpen, cliente]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const estaVencida = () => {
    if (!membresiaActual) return true;
    const est = membresiaActual.estado?.toLowerCase();
    return (
      new Date(membresiaActual.fecha_fin) < new Date(getHoy()) ||
      est === 'vencida' ||
      est === 'cancelada'
    );
  };

  const formatFecha = (f) => {
    if (!f) return '-';
    return new Date(f + 'T00:00:00').toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const formatMonto = (m) =>
    m != null ? `$${new Intl.NumberFormat('es-AR').format(m)}` : '-';

  // ── Activar cliente ───────────────────────────────────────────────────────
  const handleActivarCliente = async () => {
    setError(null);
    setActivando(true);
    try {
      await clientesAPI.partialUpdate(cliente.id, { activo: true });
      setClienteDetalle(prev => ({ ...prev, activo: true }));
      onSuccess?.();
    } catch {
      setError('No se pudo activar el cliente. Intentá de nuevo.');
    } finally {
      setActivando(false);
    }
  };

  // ── Handlers del formulario ───────────────────────────────────────────────
  const handlePlanChange = (e) => {
    const planId = e.target.value;
    const planSel = planes.find(p => String(p.id) === planId);
    setForm(prev => ({
      ...prev,
      plan: planId,
      monto: planSel ? String(planSel.precio) : prev.monto,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!form.plan) return setError('Seleccioná un plan');
    if (form.fecha_fin <= form.fecha_inicio) return setError('La fecha de fin debe ser posterior a la de inicio');
    if (form.registrarPago && (!form.monto || parseFloat(form.monto) <= 0)) {
      return setError('Ingresá un monto válido para el pago');
    }

    try {
      setSubmitting(true);

      // 1. Siempre crear la membresía (activa)
      const memRes = await membresiasAPI.create({
        cliente: cliente.id,
        plan: parseInt(form.plan),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        estado: 'activa',
      });

      // 2. Solo registrar pago si el usuario lo indicó
      if (form.registrarPago) {
        await pagosAPI.create({
          cliente: cliente.id,
          membresia: memRes.data.id,
          fecha_pago: getHoy(),
          monto: parseFloat(form.monto),
          metodo_pago: form.metodo_pago,
          concepto: 'membresia',
        });

        setResultadoExito({
          mensaje: '¡Membresía renovada y pago registrado!',
          submensaje: `Se registró un pago de ${formatMonto(form.monto)} por ${METODOS_PAGO.find(m => m.value === form.metodo_pago)?.label}.`,
        });
      } else {
        setResultadoExito({
          mensaje: '¡Membresía renovada!',
          submensaje: 'El pago quedó pendiente. Podés registrarlo desde la sección Finanzas.',
        });
      }

      onSuccess?.();
    } catch (err) {
      const detail = err?.response?.data;
      if (detail && typeof detail === 'object') {
        const msgs = Object.values(detail).flat().join(' ');
        setError(msgs || 'Error al procesar la renovación');
      } else {
        setError('Error al procesar la renovación. Verificá que el cliente esté activo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputCls =
    'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl ' +
    'focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm';
  const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {cliente?.nombre} {cliente?.apellido}
              </h2>
              <p className="text-xs text-blue-100">Detalle del socio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        {/* ── Cuerpo ── */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Cargando información...</p>
            </div>
          )}

          {/* Pantalla de éxito */}
          {!loading && resultadoExito && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={36} className="text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{resultadoExito.mensaje}</p>
                <p className="text-sm text-gray-500 mt-1">{resultadoExito.submensaje}</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Contenido principal */}
          {!loading && !resultadoExito && (
            <>
              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* ── Info del cliente ── */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Información personal
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: CreditCard, label: 'DNI',      val: clienteDetalle?.dni || '-' },
                    { icon: Phone,      label: 'Teléfono', val: clienteDetalle?.telefono || '-' },
                    { icon: Mail,       label: 'Email',    val: clienteDetalle?.email || 'Sin email' },
                    { icon: Calendar,   label: 'Nac.',     val: formatFecha(clienteDetalle?.fecha_nacimiento) },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon size={14} className="text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">{label}</p>
                        <p className="text-sm text-gray-700 font-medium">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Membresía actual ── */}
              <div className="border border-gray-100 rounded-xl p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Membresía actual
                </h3>
                {membresiaActual ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">
                        {membresiaActual.plan_nombre || `Plan #${membresiaActual.plan}`}
                      </span>
                      <EstadoBadge estado={membresiaActual.estado} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">Inicio</span>
                        <span className="text-gray-700">{formatFecha(membresiaActual.fecha_inicio)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">Vencimiento</span>
                        <span className="text-gray-700">{formatFecha(membresiaActual.fecha_fin)}</span>
                      </div>
                      {membresiaActual.precio_contratado != null && (
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">Precio</span>
                          <span className="text-gray-700">{formatMonto(membresiaActual.precio_contratado)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sin membresía registrada</p>
                )}
              </div>

              {/* ── Banner cliente inactivo ── */}
              {clienteDetalle && !clienteDetalle.activo && (
                <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700">
                    <ShieldAlert size={18} className="flex-shrink-0" />
                    <p className="text-sm font-medium">
                      El cliente está <span className="font-bold">inactivo</span>. Activalo para poder renovar la membresía.
                    </p>
                  </div>
                  <button
                    onClick={handleActivarCliente}
                    disabled={activando}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {activando ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                    {activando ? 'Activando...' : 'Activar'}
                  </button>
                </div>
              )}

              {/* ── Botón para mostrar formulario ── */}
              {clienteDetalle?.activo && estaVencida() && !mostrarForm && (
                <button
                  onClick={() => { setMostrarForm(true); setError(null); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  <RefreshCw size={16} />
                  Renovar Membresía
                </button>
              )}

              {/* ── Formulario de renovación ── */}
              {mostrarForm && (
                <form onSubmit={handleSubmit} className="space-y-4 border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <RefreshCw size={15} className="text-blue-500" />
                    Renovar membresía
                  </h3>

                  {/* Plan */}
                  <div>
                    <label className={labelCls}>Plan *</label>
                    <div className="relative">
                      <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <select
                        name="plan"
                        value={form.plan}
                        onChange={handlePlanChange}
                        className={`${inputCls} pl-9`}
                      >
                        <option value="">Seleccionar plan</option>
                        {planes.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} — {formatMonto(p.precio)}/mes
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Fecha inicio *</label>
                      <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Fecha fin *</label>
                      <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} className={inputCls} />
                    </div>
                  </div>

                  {/* ── Sección pago (opcional) ── */}
                  <div className="border-t border-gray-100 pt-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="registrarPago"
                        checked={form.registrarPago}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <DollarSign size={15} className="text-blue-500" />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900">
                          Registrar pago ahora
                        </span>
                      </div>
                      {!form.registrarPago && (
                        <span className="ml-auto text-xs text-amber-600 font-medium">Pago pendiente</span>
                      )}
                    </label>

                    {form.registrarPago && (
                      <div className="grid grid-cols-2 gap-3 mt-4 pl-7">
                        <div>
                          <label className={labelCls}>Monto *</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                              type="number"
                              name="monto"
                              value={form.monto}
                              onChange={handleChange}
                              placeholder="0"
                              min="1"
                              className={`${inputCls} pl-9`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Método *</label>
                          <div className="relative">
                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange} className={`${inputCls} pl-9`}>
                              {METODOS_PAGO.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setMostrarForm(false); setError(null); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all border border-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                      {submitting ? 'Procesando...' : 'Confirmar renovación'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCliente;
