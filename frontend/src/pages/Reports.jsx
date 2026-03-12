import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import './Products.css';

const reportData = [
  { name: 'Sanitaryware', sales: 50000, profit: 22000 },
  { name: 'Paints', sales: 30000, profit: 13980 },
  { name: 'Tiles', sales: 90000, profit: 48000 },
  { name: 'Marble', sales: 120000, profit: 60000 },
  { name: 'Granite', sales: 85000, profit: 40000 },
];

const Reports = () => {
  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Analytics & Reports</h1>
          <p className="text-muted">In-depth insights into your business performance</p>
        </div>
        <button className="btn-primary flex-center">
          <Download size={18} /> Export Excel
        </button>
      </div>

      <div className="glass-panel" style={{height: '500px', display: 'flex', flexDirection: 'column'}}>
        <h3 style={{marginBottom: '1rem', color: 'var(--text-primary)'}}>Category-wise Sales vs Profit</h3>
        <div style={{flex: 1, minHeight: 0}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
              <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value) => [`₹${value}`, '']}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="sales" fill="var(--primary)" name="Total Sales" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="var(--success)" name="Net Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Reports;
