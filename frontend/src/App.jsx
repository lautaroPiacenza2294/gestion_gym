import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FinanzasDashboard from './pages/finanzas/FinanzasDashboard';
import PagosPage from './pages/finanzas/PagosPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/finanzas" element={<FinanzasDashboard />} />
        <Route path="/finanzas/pagos" element={<PagosPage />} /> 
      </Routes>
    </div>
  );
}

export default App;