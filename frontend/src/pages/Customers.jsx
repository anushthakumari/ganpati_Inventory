import { useState } from 'react';
import { Search, UserPlus, Edit, Trash2, X, Plus } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import api from '../services/api';
import './Products.css';

const Customers = () => {
  const { customers, loading, error, setCustomers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    creditBalance: 0
  });

  if (loading) return <div className="products-page"><h1>Loading Customers...</h1></div>;

  const handleEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      phone: c.phone,
      address: c.address || '',
      creditBalance: c.creditBalance || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer? All their credit history will be lost. Continue?')) {
      try {
        await api.customers.delete(id);
        setCustomers(customers.filter(c => c.id !== id));
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete customer');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await api.customers.update(editingId, formData);
        setCustomers(customers.map(c => c.id === editingId ? { ...updated, id: updated._id, creditBalance: c.creditBalance } : c));
      } else {
        const created = await api.customers.add(formData);
        setCustomers([...customers, { ...created, id: created._id, creditBalance: 0 }]);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', address: '', creditBalance: 0 });
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save customer. (Phone might already exist)');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <p className="text-muted">View customer history and credit (udhaar) balances</p>
        </div>
        <button className="btn-primary flex-center" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', phone: '', address: '', creditBalance: 0 }); }}>
          <UserPlus size={18} /> Add Customer
        </button>
      </div>

      {showForm && (
        <div className="glass-panel form-panel mb-4">
          <div className="flex-center justify-between mb-4">
            <h3>{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
            <button className="btn-icon" onClick={() => setShowForm(false)}><X size={20}/></button>
          </div>
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Opening Credit (Adjust manual only)</label>
                <input type="number" value={formData.creditBalance} onChange={e => setFormData({...formData, creditBalance: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="form-actions-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Customer</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel table-panel">
        <div className="table-controls">
          <div className="search-bar">
            <Search size={18} className="icon" />
            <input 
              type="text" 
              placeholder="Search customers by name or phone..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Credit Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td><div className="val-primary">{c.name}</div></td>
                  <td>{c.phone}</td>
                  <td>{c.address || 'N/A'}</td>
                  <td>
                    <span style={{color: (c.creditBalance > 0) ? 'var(--danger)' : 'var(--success)', fontWeight: 600}}>
                      ₹ {c.creditBalance || 0}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => handleEdit(c)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(c.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No customers found.
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

export default Customers;
