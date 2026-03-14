import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, X } from 'lucide-react';
import { useSuppliers } from '../hooks/useSuppliers';
import api from '../services/api';
import './Products.css'; 

const Suppliers = () => {
  const { suppliers, loading, error, setSuppliers } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gstNumber: '',
    pendingBalance: 0
  });

  if (loading) return <div className="products-page"><h1>Loading Suppliers...</h1></div>;

  const handleEdit = (s) => {
    setEditingId(s.id);
    setFormData({
      name: s.name,
      phone: s.phone || '',
      address: s.address || '',
      gstNumber: s.gstNumber || s.gst || '',
      pendingBalance: s.pendingBalance || s.balance || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.suppliers.delete(id);
        setSuppliers(suppliers.filter(s => s.id !== id));
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete supplier');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await api.suppliers.update(editingId, formData);
        setSuppliers(suppliers.map(s => s.id === editingId ? { ...updated, id: updated._id } : s));
      } else {
        const created = await api.suppliers.add(formData);
        setSuppliers([...suppliers, { ...created, id: created._id }]);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', address: '', gstNumber: '', pendingBalance: 0 });
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save supplier');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.gstNumber && s.gstNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.phone && s.phone.includes(searchQuery))
  );

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Supplier Management</h1>
          <p className="text-muted">Manage your wholesale suppliers and purchase history</p>
        </div>
        <button className="btn-primary flex-center" onClick={() => { setShowForm(true); setEditingId(null); }}>
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="glass-panel form-panel mb-4">
          <div className="flex-center justify-between mb-4">
            <h3>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h3>
            <button className="btn-icon" onClick={() => setShowForm(false)}><X size={20}/></button>
          </div>
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Supplier Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Pending Balance (₹)</label>
                <input type="number" value={formData.pendingBalance} onChange={e => setFormData({...formData, pendingBalance: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group"></div>
            </div>
            <div className="form-actions-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Supplier</button>
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
              placeholder="Search by name, phone or GST..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
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
              {filteredSuppliers.map((s) => (
                <tr key={s.id}>
                  <td><div className="val-primary">{s.name}</div></td>
                  <td>{s.phone || 'N/A'}</td>
                  <td>{s.address || 'N/A'}</td>
                  <td><span className="badge-outline">{s.gstNumber || s.gst || 'N/A'}</span></td>
                  <td>
                    <span style={{color: (s.balance || s.pendingBalance) ? 'var(--warning)' : 'var(--success)', fontWeight: 600}}>
                      ₹ {s.balance || s.pendingBalance || 0}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => handleEdit(s)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No suppliers found.
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

export default Suppliers;
