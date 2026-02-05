import Dashboard from './pages/Dashboard';
import FinanzasDashboard from './pages/finanzas/FinanzasDashboard';
import PagosPage from './pages/finanzas/PagosPage';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import './components/layout/layout.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/finanzas" element={<FinanzasDashboard />} />
        <Route path="/finanzas/pagos" element={<PagosPage />} /> 
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        
        {/* Ruta temporal para reportes */}
        <Route path="/reportes" element={
          <div style={{padding: '2rem'}}>
            <h1>Reportes - Próximamente</h1>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;