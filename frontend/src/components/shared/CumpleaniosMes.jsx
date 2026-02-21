import { useState, useEffect } from 'react';
import { Cake, MessageCircle, Loader2, Gift } from 'lucide-react';
import { clientesAPI } from '../../services';

const abrirWhatsappCumple = (cliente) => {
  let tel = (cliente.telefono || '').replace(/\D/g, '');
  if (!tel) {
    alert(`${cliente.nombre} no tiene teléfono registrado.`);
    return;
  }
  if (tel.startsWith('0')) tel = tel.slice(1);
  if (!tel.startsWith('54')) tel = '54' + tel;
  const mensaje = encodeURIComponent(
    `¡Hola ${cliente.nombre}! El equipo del gym te desea un feliz cumpleaños! 🎂🎉 ¡Que pases un gran día!`
  );
  window.open(`https://wa.me/${tel}?text=${mensaje}`, '_blank');
};

const getDiaCumple = (fechaNacimiento) =>
  new Date(fechaNacimiento + 'T00:00:00').getDate();

const esCumpleHoy = (fechaNacimiento) => {
  const hoy = new Date();
  const fecha = new Date(fechaNacimiento + 'T00:00:00');
  return fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth();
};

const CumpleaniosMes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const res = await clientesAPI.getCumpleaniosMes();
        const lista = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        // Ordenar por día del mes
        lista.sort((a, b) => getDiaCumple(a.fecha_nacimiento) - getDiaCumple(b.fecha_nacimiento));
        setClientes(lista);
      } catch {
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">Cargando cumpleaños...</span>
        </div>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-3">
        <Gift size={20} className="text-pink-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-700">Sin cumpleaños este mes</p>
          <p className="text-xs text-gray-400">No hay socios que cumplan años este mes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Cake size={18} className="text-pink-500" />
        <h3 className="text-sm font-bold text-gray-800">Cumpleaños del Mes</h3>
        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
          {clientes.length}
        </span>
      </div>

      {/* Lista */}
      <ul className="divide-y divide-gray-50">
        {clientes.map((cliente) => {
          const hoy = esCumpleHoy(cliente.fecha_nacimiento);
          const dia = getDiaCumple(cliente.fecha_nacimiento);
          return (
            <li
              key={cliente.id}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 transition-colors ${
                hoy ? 'bg-pink-50/60' : 'hover:bg-pink-50/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm ${
                  hoy ? 'bg-pink-200' : 'bg-pink-100'
                }`}>
                  {hoy ? '🎂' : <Cake size={14} className="text-pink-500" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {cliente.nombre} {cliente.apellido}
                    {hoy && (
                      <span className="ml-2 text-xs text-pink-600 font-bold">¡Hoy!</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    Día {dia} · {dia >= new Date().getDate() ? `Cumple ${cliente.edad + 1} años` : `Cumplió ${cliente.edad} años`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => abrirWhatsappCumple(cliente)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all shadow-sm shadow-green-200 active:scale-95 flex-shrink-0"
                title="Enviar felicitación por WhatsApp"
              >
                <MessageCircle size={12} />
                Felicitar
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CumpleaniosMes;
