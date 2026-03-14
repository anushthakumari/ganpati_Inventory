import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  IndianRupee 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, lowStockCount: 0, netProfit: 0 });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, chartData, productsData] = await Promise.all([
          api.analytics.getStats(),
          api.analytics.getSalesChart(),
          api.analytics.getTopProducts()
        ]);
        setStats(statsData);
        setSalesData(chartData);
        setTopProducts(productsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="dashboard"><h1>Loading Dashboard...</h1></div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">Download Report</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <IndianRupee size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹ {stats.totalRevenue.toLocaleString()}</p>
            <span className="stat-change positive">Current Status</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon secondary">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
            <span className="stat-change positive">Lifetime</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <h3>Low Stock</h3>
            <p className="stat-value">{stats.lowStockCount} Items</p>
            <span className="stat-change negative">Needs attention</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <h3>Net Profit</h3>
            <p className="stat-value">₹ {stats.netProfit.toLocaleString()}</p>
            <span className="stat-change positive">Estimated</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel chart-panel">
          <h3>Revenue Overview (Last 7 Days)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3>Top Selling Products</h3>
          <div className="top-products-list">
            {topProducts.map((product) => (
              <div key={product.id} className="product-item">
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <span className="category-badge">{product.category}</span>
                </div>
                <div className="product-stats">
                  <span className="sales">{product.sales} sold</span>
                  <span className="stock">{product.stock} in stock</span>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-muted">No sales yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
