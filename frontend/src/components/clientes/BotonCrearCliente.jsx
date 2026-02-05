import { UserPlus } from 'lucide-react';

const BotonCrearCliente = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
    >
      <UserPlus size={20} />
      <span>Nuevo Cliente</span>
    </button>
  );
};

export default BotonCrearCliente;
