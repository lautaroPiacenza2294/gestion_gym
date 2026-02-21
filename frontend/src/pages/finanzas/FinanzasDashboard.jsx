import { useState, useEffect } from 'react';
import React from 'react';
import Layout from '../../components/layout/Layout';
import KPICard from '../../components/finanzas/KPICard';
import ListaPagos from '../../components/finanzas/ListaPagos';
import ListaEgresos from '../../components/finanzas/ListaEgresos';
import PendientesPago from '../../components/shared/PendientesPago';
import { pagosAPI, egresosAPI, gastosFijosAPI } from '../../services/finanzas';
import { membresiasAPI } from '../../services';
import ModalEgreso from '../../components/finanzas/ModalEgreso';
import { useNavigate } from 'react-router-dom';

const FinanzasDashboard = () => {
  // ==================== ESTADO ====================
  const [loading, setLoading] = useState(true);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [loadingEgresos, setLoadingEgresos] = useState(true);
  const navigate = useNavigate();
  
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [totalGastosFijos, setTotalGastosFijos] = useState(0);
  const [balance, setBalance] = useState(0);

  const [ultimosPagos, setUltimosPagos] = useState([]);
  const [ultimosEgresos, setUltimosEgresos] = useState([]);
  const [proximosVencimientos, setProximosVencimientos] = useState([]);
  const [loadingVencimientos, setLoadingVencimientos] = useState(true);

  // ── Métricas de eficiencia ──
  const [pagosMesCount, setPagosMesCount] = useState(0);
  const [sinPago, setSinPago] = useState([]);
  const [loadingMetricas, setLoadingMetricas] = useState(true);
  const [modalPagarOpen, setModalPagarOpen] = useState(false);
  const [gastoAPagar, setGastoAPagar] = useState(null);

  // ==================== EFECTOS ====================
  
  useEffect(() => {
    cargarDatos();
  }, []);

  // ==================== FUNCIONES ====================
  
  const cargarDatos = async () => {
    await Promise.all([
      cargarTotales(),
      cargarUltimosPagos(),
      cargarUltimosEgresos(),
      cargarProximosVencimientos(),
      cargarMetricas(),
    ]);
  };

  const cargarTotales = async () => {
    setLoading(true);
    try {
      const [resIngresos, resEgresos, resGastosFijos] = await Promise.all([
        pagosAPI.getTotalMes(),
        egresosAPI.getTotalMes(),
        gastosFijosAPI.getTotalMensual(),
      ]);

      const ingresos = resIngresos.data.total || 0;
      const egresos = resEgresos.data.total || 0;
      const gastosFijos = resGastosFijos.data.total_mensual || 0;  // el backend devuelve total_mensual

      setTotalIngresos(ingresos);
      setTotalEgresos(egresos);
      setTotalGastosFijos(gastosFijos);
      setBalance(ingresos - egresos - gastosFijos);

    } catch (error) {
      console.error('Error al cargar totales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarUltimosPagos = async () => {
    setLoadingPagos(true);
    try {
      const response = await pagosAPI.getPagosMesActual();
      const todosPagos = response.data;
      setUltimosPagos(todosPagos.slice(0, 5));
      // Guardar conteo total para métricas (solo concepto membresía)
      const pagosMem = todosPagos.filter(p => p.concepto === 'membresia');
      setPagosMesCount(pagosMem.length);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      setUltimosPagos([]);
    } finally {
      setLoadingPagos(false);
    }
  };

  const cargarMetricas = async () => {
    setLoadingMetricas(true);
    try {
      const res = await membresiasAPI.getSinPago();
      const lista = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setSinPago(lista);
    } catch (error) {
      console.error('Error al cargar sin pago:', error);
      setSinPago([]);
    } finally {
      setLoadingMetricas(false);
    }
  };

  const cargarUltimosEgresos = async () => {
    setLoadingEgresos(true);
    try {
      const response = await egresosAPI.getMesActual();
      const lista = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setUltimosEgresos(lista.slice(0, 5));
    } catch (error) {
      console.error('Error al cargar egresos:', error);
      setUltimosEgresos([]);
    } finally {
      setLoadingEgresos(false);
    }
  };

  const cargarProximosVencimientos = async () => {
    setLoadingVencimientos(true);
    try {
      const response = await gastosFijosAPI.getProximosVencimientos();
      setProximosVencimientos(response.data);
    } catch (error) {
      console.error('Error al cargar vencimientos:', error);
      setProximosVencimientos([]);
    } finally {
      setLoadingVencimientos(false);
    }
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const traducirCategoria = (categoria) => {
    const traducciones = {
      'alquiler': 'Alquiler',
      'servicios': 'Servicios',
      'internet': 'Internet/Tel.',
      'salarios': 'Salarios',
      'impuestos': 'Impuestos',
      'seguro': 'Seguros',
      'limpieza': 'Limpieza',
      'otro': 'Otro',
    };
    return traducciones[categoria] || categoria;
  };

  const handlePagarGasto = (gasto) => {
    setGastoAPagar({
      descripcion: `Pago ${gasto.nombre}`,
      monto: gasto.monto_mensual,
      categoria: 'gastos_fijos',
      observaciones: `Gasto fijo: ${gasto.nombre}`,
    });
    setModalPagarOpen(true);
  };

  const handlePagoExitoso = () => {
    cargarDatos();
  };

  // ==================== RENDER ====================
  
  return (
    <Layout title="Dashboard de Finanzas">
      {/* 👇 WRAPPER CON CLASE ÚNICA PARA RESETEAR ESTILOS */}
      <div className="finanzas-module">
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          
          {/* Header con botones de acción */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mt-1">
                Resumen del mes actual
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/finanzas/pagos')}
                className="
                  bg-blue-600 hover:bg-blue-700
                  text-white font-medium
                  px-4 py-2 rounded-lg
                  transition-colors duration-200
                  flex items-center gap-2
                "
              >
                <span className="text-lg">+</span>
                Pagos
              </button>

              <button
                onClick={() => navigate('/finanzas/egresos')}
                className="
                  bg-red-500 hover:bg-red-600
                  text-white font-medium
                  px-4 py-2 rounded-lg
                  transition-colors duration-200
                  flex items-center gap-2
                "
              >
                <span className="text-lg">+</span>
                Egresos
              </button>

              <button
                onClick={() => navigate('/finanzas/gastos-fijos')}
                className="
                  bg-orange-500 hover:bg-orange-600
                  text-white font-medium
                  px-4 py-2 rounded-lg
                  transition-colors duration-200
                "
              >
                Gastos Fijos
              </button>
            </div>
          </div>

          {/* KPIs - 4 tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Ingresos del Mes"
              value={totalIngresos}
              icon="💰"
              color="green"
              loading={loading}
            />

            <KPICard
              title="Egresos del Mes"
              value={totalEgresos}
              icon="📤"
              color="red"
              loading={loading}
            />

            <KPICard
              title="Gastos Fijos / Mes"
              value={totalGastosFijos}
              icon="📋"
              color="orange"
              loading={loading}
            />

            <KPICard
              title="Balance del Mes"
              value={balance}
              icon="💵"
              color={balance >= 0 ? 'green' : 'red'}
              loading={loading}
            />
          </div>

          {/* ── Métricas de Eficiencia ── */}
          {(() => {
            const totalActivas  = pagosMesCount + sinPago.length;
            const tasaCobranza  = totalActivas > 0 ? Math.round((pagosMesCount / totalActivas) * 100) : 0;
            const ticketPromedio = pagosMesCount > 0 ? Math.round(totalIngresos / pagosMesCount) : 0;
            const margenNeto    = totalIngresos > 0
              ? Math.round(((totalIngresos - totalEgresos - totalGastosFijos) / totalIngresos) * 100)
              : 0;
            const deudaPendiente = sinPago.reduce((acc, m) => acc + (parseFloat(m.precio_contratado) || 0), 0);

            const metricas = [
              {
                label: 'Tasa de Cobranza',
                valor: `${tasaCobranza}%`,
                sub: `${pagosMesCount} cobrados · ${sinPago.length} pendientes`,
                color: tasaCobranza >= 80 ? 'emerald' : tasaCobranza >= 50 ? 'amber' : 'rose',
                icon: '📊',
              },
              {
                label: 'Ticket Promedio',
                valor: formatearMoneda(ticketPromedio),
                sub: `Sobre ${pagosMesCount} pagos del mes`,
                color: 'blue',
                icon: '🎫',
              },
              {
                label: 'Margen Neto',
                valor: `${margenNeto}%`,
                sub: 'Ingresos menos todos los gastos',
                color: margenNeto >= 30 ? 'emerald' : margenNeto >= 10 ? 'amber' : 'rose',
                icon: '📈',
              },
              {
                label: 'Deuda Pendiente',
                valor: formatearMoneda(deudaPendiente),
                sub: `${sinPago.length} membresías sin cobrar`,
                color: deudaPendiente === 0 ? 'emerald' : 'rose',
                icon: '⏳',
              },
            ];

            const colorMap = {
              emerald: { border: 'border-emerald-500', badge: 'bg-emerald-50 text-emerald-700', icon: 'bg-emerald-50' },
              amber:   { border: 'border-amber-500',   badge: 'bg-amber-50 text-amber-700',   icon: 'bg-amber-50' },
              rose:    { border: 'border-rose-500',    badge: 'bg-rose-50 text-rose-700',    icon: 'bg-rose-50' },
              blue:    { border: 'border-blue-500',    badge: 'bg-blue-50 text-blue-700',    icon: 'bg-blue-50' },
            };

            return (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Métricas de Eficiencia
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metricas.map((m) => {
                    const c = colorMap[m.color];
                    return (
                      <div
                        key={m.label}
                        className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${c.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`text-2xl w-10 h-10 flex items-center justify-center ${c.icon} rounded-lg`}>
                            {m.icon}
                          </div>
                          <p className="text-sm text-gray-600 font-medium leading-tight">{m.label}</p>
                        </div>
                        {loadingMetricas || loading ? (
                          <p className="text-base text-gray-400 italic">Cargando...</p>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-gray-900">{m.valor}</p>
                            <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Pagos pendientes */}
          <PendientesPago />

          {/* Listas - 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ListaPagos
                pagos={ultimosPagos}
                loading={loadingPagos}
              />
              <button
                onClick={() => navigate('/finanzas/pagos')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium w-full text-center py-2"
              >
                Ver todos los pagos →
              </button>
            </div>

            <div>
              <ListaEgresos
                egresos={ultimosEgresos}
                loading={loadingEgresos}
              />
              <button
                onClick={() => navigate('/finanzas/egresos')}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium w-full text-center py-2"
              >
                Ver todos los egresos →
              </button>
            </div>
          </div>

          {/* Proximos vencimientos de gastos fijos */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gastos Fijos - Proximos a Vencer (7 dias)
              </h3>
              <button
                onClick={() => navigate('/finanzas/gastos-fijos')}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium"
              >
                Ver todos →
              </button>
            </div>

            {loadingVencimientos ? (
              <div className="text-center py-6 text-gray-400">
                Cargando vencimientos...
              </div>
            ) : proximosVencimientos.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                No hay gastos proximos a vencer
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nombre</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Categoria</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Monto</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Dia Vto.</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {proximosVencimientos.map((gasto) => (
                      <tr
                        key={gasto.id}
                        className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {gasto.nombre}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {traducirCategoria(gasto.categoria)}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-orange-600 text-right">
                          {formatearMoneda(gasto.monto_mensual)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 text-center">
                          {gasto.dia_vencimiento}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handlePagarGasto(gasto)}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                          >
                            Pagar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      <ModalEgreso
        isOpen={modalPagarOpen}
        onClose={() => { setModalPagarOpen(false); setGastoAPagar(null); }}
        onSuccess={handlePagoExitoso}
        prefillData={gastoAPagar}
      />
    </Layout>
  );
};

export default FinanzasDashboard;