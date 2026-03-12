import { Plus, Search, Filter } from 'lucide-react';
import './Products.css'; 

const mockSuppliers = [
  { id: 1, name: 'Kajaria Ceramics Ltd.', phone: '+91 9876543210', address: 'Delhi Industrial Area', gst: '07AAACK1234A1Z5', balance: '₹ 45,000' },
  { id: 2, name: 'Asian Paints Distributor', phone: '+91 9876543211', address: 'Mumbai Central', gst: '27AAACA1234A1Z5', balance: '₹ 0' },
  { id: 3, name: 'Hindware Solutions', phone: '+91 9876543212', address: 'Gurugram Sector 18', gst: '06AAACH1234A1Z5', balance: '₹ 12,500' },
];

const Suppliers = () => {
  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Supplier Management</h1>
          <p className="text-muted">Manage your wholesale suppliers and purchase history</p>
        </div>
        <button className="btn-primary flex-center">
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="glass-panel table-panel">
        <div className="table-controls">
          <div className="search-bar">
            <Search size={18} className="icon" />
            <input type="text" placeholder="Search suppliers by name or GST..." />
          </div>
          <button className="btn-outline flex-center"><Filter size={18} /> Filters</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>GST Number</th>
                <th>Pending Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockSuppliers.map((s) => (
                <tr key={s.id}>
                  <td><div className="val-primary">{s.name}</div></td>
                  <td>{s.phone}</td>
                  <td>{s.address}</td>
                  <td><span className="badge-outline">{s.gst}</span></td>
                  <td>
                    <span style={{color: s.balance !== '₹ 0' ? 'var(--warning)' : 'var(--success)', fontWeight: 600}}>
                      {s.balance}
                    </span>
                  </td>
                  <td>
                    <button className="btn-outline" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}}>View POs</button>
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
export default Suppliers;
