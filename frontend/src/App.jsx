import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import FinanzasDashboard from './pages/finanzas/FinanzasDashboard';
import PagosPage from './pages/finanzas/PagosPage';
import Planes from './pages/Planes';
import EgresosPage from './pages/finanzas/EgresosPage';
import GastosFijosPage from './pages/finanzas/GastosFijosPage';
import AccesoKiosk from './pages/AccesoKiosk';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/finanzas" element={<FinanzasDashboard />} />
        <Route path="/finanzas/pagos" element={<PagosPage />} />
        <Route path="/membresias" element={<Planes />} />
        <Route path="/finanzas/egresos" element={<EgresosPage />} />
        <Route path="/finanzas/gastos-fijos" element={<GastosFijosPage />} />
        <Route path="/acceso" element={<AccesoKiosk />} />

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