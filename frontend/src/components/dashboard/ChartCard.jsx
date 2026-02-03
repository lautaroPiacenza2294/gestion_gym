import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const ChartCard = ({ data, title }) => {
  return (
    <div className="chart-card">
      {/* Header del gráfico */}
      <div className="chart-header">
        <div className="chart-title-wrapper">
          <TrendingUp size={24} className="chart-icon" />
          <h3 className="chart-title">{title}</h3>
        </div>
      </div>

      {/* Gráfico */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="dia" 
              stroke="rgba(255,255,255,0.7)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="ingresos" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              name="Ingresos"
            />
            <Line 
              type="monotone" 
              dataKey="egresos" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Egresos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;