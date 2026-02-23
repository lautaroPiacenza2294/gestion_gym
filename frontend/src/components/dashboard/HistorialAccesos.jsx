import React, { useState, useEffect, useCallback } from 'react';
import { LogIn, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import accesosAPI from '../../services/accesos';

const MOTIVOS = {
  no_encontrado: 'DNI no registrado',
  cliente_inactivo: 'Cliente inactivo',
  sin_membresia: 'Sin membresía',
  membresia_vencida: 'Membresía vencida',
};

const HistorialAccesos = () => {
  const [accesos, setAccesos] = useState([]);
  const [stats, setStats] = useState({ total: 0, permitidos: 0, denegados: 0 });
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const [accesosRes, statsRes] = await Promise.all([
        accesosAPI.getHoy(),
        accesosAPI.getStatsHoy(),
      ]);
      setAccesos(accesosRes.data.slice(0, 12));
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error cargando accesos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, [cargar]);

  const formatHora = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 rounded-xl p-2.5">
            <LogIn size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Accesos de hoy</h3>
            <p className="text-xs text-slate-400">Se actualiza cada 30 segundos</p>
          </div>
        </div>
        <button
          onClick={cargar}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title="Actualizar"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-slate-700">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-0.5">Total</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.permitidos}</div>
          <div className="text-xs text-emerald-500 mt-0.5">Permitidos</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.denegados}</div>
          <div className="text-xs text-red-400 mt-0.5">Denegados</div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-b-2 border-indigo-400 rounded-full" />
        </div>
      ) : accesos.length === 0 ? (
        <div className="text-center py-8 text-slate-300">
          <Clock size={30} className="mx-auto mb-2" />
          <p className="text-sm">Sin accesos registrados hoy</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {accesos.map((acceso) => (
            <div
              key={acceso.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                acceso.resultado === 'permitido' ? 'bg-emerald-50' : 'bg-red-50'
              }`}
            >
              {acceso.resultado === 'permitido' ? (
                <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle size={15} className="text-red-400 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {acceso.cliente_nombre || `DNI ${acceso.dni_ingresado}`}
                </p>
                <p className="text-xs text-slate-400">
                  {acceso.resultado === 'permitido'
                    ? acceso.plan_nombre
                    : MOTIVOS[acceso.motivo_denegacion] || acceso.motivo_denegacion}
                </p>
              </div>

              <span className="text-xs text-slate-400 flex-shrink-0 tabular-nums">
                {formatHora(acceso.fecha_hora)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialAccesos;
