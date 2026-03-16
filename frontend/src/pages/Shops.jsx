import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { useShops } from '../hooks/useShops';
import api from '../services/api';
import './Products.css'; // Reusing some base styles

const Shops = () => {
  const { shops, loading, error, setShops } = useShops();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({ name: '', address: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updatedShop = await api.shops.update(editingId, formData);
        const displayShop = { ...updatedShop, id: updatedShop._id || updatedShop.id };
        setShops(shops.map(s => s.id === editingId ? displayShop : s));
      } else {
        const newShop = await api.shops.add(formData);
        const displayShop = { ...newShop, id: newShop._id || newShop.id };
        setShops([displayShop, ...shops]);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving shop:', err);
    }
  };

  const handleEdit = (shop) => {
    setFormData({
      name: shop.name || '',
      address: shop.address || '',
      isActive: shop.isActive !== undefined ? shop.isActive : true
    });
    setEditingId(shop.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this shop?')) {
      try {
        await api.shops.delete(id);
        const updatedShop = { ...shops.find(s => s.id === id), isActive: false };
        setShops(shops.map(s => s.id === id ? updatedShop : s));
      } catch (err) {
        console.error('Error deleting shop:', err);
      }
    }
  };

  if (loading) return <div className="products-page"><h1>Loading Shops...</h1></div>;
  if (error) return <div className="products-page"><h1>Error: {error}</h1></div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Store Locations</h1>
          <p className="text-muted">Manage your physical shops and warehouses</p>
        </div>
        <button className="btn-primary flex-center" onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); } }}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add New Location'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel form-panel">
          <h3>{editingId ? 'Edit Location' : 'Add New Location'}</h3>
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Location Name</label>
                <input type="text" placeholder="e.g. Main Warehouse" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address / Details</label>
                <input type="text" placeholder="Location details..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>
            <div className="form-actions-end">
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-primary">{editingId ? 'Update Location' : 'Save Location'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel table-panel" style={{ marginTop: '1.5rem' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Location Name</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s) => (
                <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.6 }}>
                  <td>
                    <div className="val-primary flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                      <MapPin size={16} className="text-muted" /> {s.name}
                    </div>
                  </td>
                  <td>{s.address || '-'}</td>
                  <td>
                    {s.isActive ? (
                      <span className="badge-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>Active</span>
                    ) : (
                      <span className="badge-outline" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => handleEdit(s)}><Edit size={16} /></button>
                      {s.isActive && <button className="btn-icon danger" onClick={() => handleDelete(s.id)}><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {shops.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No store locations found. Add one to get started.
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

export default Shops;
