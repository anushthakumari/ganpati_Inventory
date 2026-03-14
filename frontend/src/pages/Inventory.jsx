import { useState } from 'react';
import { ArrowRightLeft, Search, Filter } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import './Products.css'; // Reusing table styles

const Inventory = () => {
  const { products, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return <div className="products-page"><h1>Loading Inventory...</h1></div>;

  const filteredItems = products
    .filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      stock1: p.stockShop1 || 0,
      stock2: p.stockShop2 || 0,
      total: (p.stockShop1 || 0) + (p.stockShop2 || 0),
      status: (p.stockShop1 + p.stockShop2 === 0) ? 'Out of Stock' : 
              (p.stockShop1 + p.stockShop2 < 10) ? 'Low Stock' : 'Healthy'
    }));

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Inventory & Stock Transfers</h1>
          <p className="text-muted">Monitor stock levels across Shop 1 and Shop 2</p>
        </div>
        <button className="btn-primary flex-center">
          <ArrowRightLeft size={18} /> Transfer Stock
        </button>
      </div>

      <div className="glass-panel table-panel">
        <div className="table-controls">
          <div className="search-bar">
            <Search size={18} className="icon" />
            <input type="text" placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="btn-outline flex-center"><Filter size={18} /> Filter Status</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Shop 1 Stock</th>
                <th>Shop 2 Stock</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td><div className="val-primary">{item.name}</div></td>
                  <td><span className="badge-outline">{item.category}</span></td>
                  <td><div className="val-primary">{item.stock1}</div></td>
                  <td><div className="val-primary">{item.stock2}</div></td>
                  <td><div className="val-primary">{item.total}</div></td>
                  <td>
                    <span style={{color: item.status.includes('Low') || item.status.includes('Out') ? 'var(--warning)' : 'var(--success)', fontSize: '0.85rem', fontWeight: 500}}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-outline flex-center" style={{padding: '0.4rem 0.75rem', fontSize: '0.8rem'}}>
                      <ArrowRightLeft size={14}/> Transfer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                   <td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No inventory items found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
