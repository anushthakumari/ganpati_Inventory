import { ArrowRightLeft, Search, Filter } from 'lucide-react';
import './Products.css'; // Reusing table styles

const mockInventory = [
  { id: 1, name: 'Premium Ceramic Tiles 2x2', category: 'Tiles', stock1: 250, stock2: 200, total: 450, status: 'Healthy' },
  { id: 2, name: 'Asian Paints Apex 20L', category: 'Paints', stock1: 22, stock2: 10, total: 32, status: 'Low in Shop 2' },
  { id: 3, name: 'Hindware Wash Basin', category: 'Sanitaryware', stock1: 0, stock2: 15, total: 15, status: 'Out of Stock Shop 1' },
];

const Inventory = () => {
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
            <input type="text" placeholder="Search inventory..." />
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
              {mockInventory.map((item) => (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
