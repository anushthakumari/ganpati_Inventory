import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import api from '../services/api';
import './Products.css';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await api.analytics.getCategoryReports();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  if (loading) return <div className="products-page"><h1>Loading Reports...</h1></div>;

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
                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="sales" fill="var(--primary)" name="Total Sales" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="var(--success)" name="Net Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {reportData.length === 0 && <p className="text-muted" style={{textAlign: 'center'}}>No data available yet.</p>}
      </div>
    </div>
  );
};
export default Reports;
