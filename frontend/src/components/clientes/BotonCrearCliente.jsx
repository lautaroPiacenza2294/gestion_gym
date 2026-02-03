import { UserPlus } from 'lucide-react';
import './clientes.css';

const BotonCrearCliente = ({ onClick }) => {
  return (
    <button 
      className="btn-crear-cliente"
      onClick={onClick}
    >
      <UserPlus size={20} />
      <span>Nuevo Cliente</span>
    </button>
  );
};

export default BotonCrearCliente;