import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  IndianRupee 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const salesData = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5500, orders: 35 },
  { name: 'Thu', revenue: 4500, orders: 28 },
  { name: 'Fri', revenue: 6000, orders: 42 },
  { name: 'Sat', revenue: 8000, orders: 55 },
  { name: 'Sun', revenue: 7500, orders: 48 },
];

const topProducts = [
  { id: 1, name: 'Premium Ceramic Tiles 2x2', category: 'Tiles', sales: 124, stock: 450 },
  { id: 2, name: 'Asian Paints Apex 20L', category: 'Paints', sales: 85, stock: 32 },
  { id: 3, name: 'Hindware Wash Basin', category: 'Sanitaryware', sales: 64, stock: 15 },
  { id: 4, name: 'Italian Marble Slab', category: 'Marble', sales: 42, stock: 120 },
];

const Dashboard = () => {
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
            <p className="stat-value">₹ 1,45,000</p>
            <span className="stat-change positive">+12.5% vs yesterday</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon secondary">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Orders</h3>
            <p className="stat-value">154</p>
            <span className="stat-change positive">+8.2% vs yesterday</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <h3>Low Stock</h3>
            <p className="stat-value">12 Items</p>
            <span className="stat-change negative">Needs attention</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <h3>Net Profit</h3>
            <p className="stat-value">₹ 42,500</p>
            <span className="stat-change positive">+15.3% this week</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel chart-panel">
          <h3>Revenue Overview</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
