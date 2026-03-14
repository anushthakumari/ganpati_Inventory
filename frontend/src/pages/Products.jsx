import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import api from '../services/api';
import './Products.css';

const Products = () => {
  const { products, loading, error, setProducts } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sanitaryware',
    brand: '',
    sizeVariant: '',
    unit: 'Piece',
    purchasePrice: '',
    sellingPrice: '',
    stockShop1: 0,
    stockShop2: 0,
    minAlertQty: 10
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProduct = await api.products.add(formData);
      // Map for display
      const displayProduct = {
        ...newProduct,
        id: newProduct._id || newProduct.id,
        price: newProduct.sellingPrice,
        stock: (newProduct.stockShop1 || 0) + (newProduct.stockShop2 || 0),
        shop: (newProduct.stockShop1 > 0 && newProduct.stockShop2 > 0) ? 'Shop 1 & 2' : (newProduct.stockShop1 > 0 ? 'Shop 1' : 'Shop 2')
      };
      setProducts([displayProduct, ...products]);
      setShowForm(false);
      setFormData({
        name: '', category: 'Sanitaryware', brand: '', sizeVariant: '', unit: 'Piece',
        purchasePrice: '', sellingPrice: '', stockShop1: 0, stockShop2: 0, minAlertQty: 10
      });
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.products.delete(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="products-page"><h1>Loading Products...</h1></div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Products Inventory</h1>
          <p className="text-muted">Manage your hardware, paints, tiles, and sanitaryware</p>
        </div>
        <button className="btn-primary flex-center" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel form-panel">
          <h3>Add New Product</h3>
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Product Name</label>
                <input type="text" placeholder="Enter product name..." required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group"><label>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Sanitaryware</option><option>Paints</option>
                  <option>Tiles</option><option>Marble</option><option>Granite</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Brand</label><input type="text" placeholder="Brand name" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
              <div className="form-group"><label>Size / Variant</label><input type="text" placeholder="e.g. 2x2, 20L" value={formData.sizeVariant} onChange={e => setFormData({...formData, sizeVariant: e.target.value})} /></div>
              <div className="form-group"><label>Unit</label>
                <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                  <option>Piece</option><option>Box</option><option>Litre</option><option>Sq ft</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Purchase Price (₹)</label><input type="number" placeholder="0.00" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} /></div>
              <div className="form-group"><label>Selling Price (₹)</label><input type="number" placeholder="0.00" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Stock Shop 1</label><input type="number" placeholder="0" value={formData.stockShop1} onChange={e => setFormData({...formData, stockShop1: parseInt(e.target.value) || 0})} /></div>
              <div className="form-group"><label>Stock Shop 2</label><input type="number" placeholder="0" value={formData.stockShop2} onChange={e => setFormData({...formData, stockShop2: parseInt(e.target.value) || 0})} /></div>
              <div className="form-group"><label>Min Alert Qty</label><input type="number" placeholder="10" value={formData.minAlertQty} onChange={e => setFormData({...formData, minAlertQty: parseInt(e.target.value) || 10})} /></div>
            </div>
            <div className="form-actions-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Product</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel table-panel">
        <div className="table-controls">
          <div className="search-bar">
            <Search size={18} className="icon" />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="btn-outline flex-center"><Filter size={18} /> Filters</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Shop Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td><div className="val-primary">{p.name}</div></td>
                  <td><span className="badge-outline">{p.category}</span></td>
                  <td>{p.brand}</td>
                  <td>₹ {p.price}</td>
                  <td>
                    <div className="stock-indicator">
                      <div className={`indicator-dot ${p.stock > 20 ? 'safe' : 'low'}`}></div>
                      {p.stock}
                    </div>
                  </td>
                  <td>{p.shop}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon"><Edit size={16} /></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                      <button className="btn-icon"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No products found matching your search.
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

export default Products;
