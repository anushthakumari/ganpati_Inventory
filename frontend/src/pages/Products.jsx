import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useShops } from '../hooks/useShops';
import api from '../services/api';
import './Products.css';

const Products = () => {
  const { products, loading: productsLoading, setProducts } = useProducts();
  const { shops, loading: shopsLoading } = useShops();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sanitaryware',
    brand: '',
    sizeVariant: '',
    purchasePrice: '',
    sellingPrice: '',
    inventoryLocations: [],
    minAlertQty: 10
  });

  const resetForm = () => {
    setFormData({
      name: '', category: 'Sanitaryware', brand: '', sizeVariant: '',
      purchasePrice: '', sellingPrice: '', inventoryLocations: [], minAlertQty: 10
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updatedProduct = await api.products.update(editingId, formData);
        const displayProduct = {
          ...updatedProduct,
          id: updatedProduct._id || updatedProduct.id,
          price: updatedProduct.sellingPrice,
          stock: (updatedProduct.stockShop1 || 0) + (updatedProduct.stockShop2 || 0),
          shop: (updatedProduct.stockShop1 > 0 && updatedProduct.stockShop2 > 0) ? 'Shop 1 & 2' : (updatedProduct.stockShop1 > 0 ? 'Shop 1' : 'Shop 2')
        };
        setProducts(products.map(p => p.id === editingId ? displayProduct : p));
      } else {
        const newProduct = await api.products.add(formData);
        const displayProduct = {
          ...newProduct,
          id: newProduct._id || newProduct.id,
          price: newProduct.sellingPrice,
          stock: (newProduct.stockShop1 || 0) + (newProduct.stockShop2 || 0),
          shop: (newProduct.stockShop1 > 0 && newProduct.stockShop2 > 0) ? 'Shop 1 & 2' : (newProduct.stockShop1 > 0 ? 'Shop 1' : 'Shop 2')
        };
        setProducts([displayProduct, ...products]);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      category: product.category || 'Sanitaryware',
      brand: product.brand || '',
      sizeVariant: product.sizeVariant || '',
      purchasePrice: product.purchasePrice || '',
      sellingPrice: product.price || product.sellingPrice || '',
      inventoryLocations: product.inventoryLocations || [],
      minAlertQty: product.minAlertQty || 10
    });
    setEditingId(product.id);
    setShowForm(true);
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

  const handleAddLocation = () => {
    setFormData({
      ...formData,
      inventoryLocations: [
        ...formData.inventoryLocations,
        { shopId: '', shopName: '', stock: 0, unit: 'Piece' }
      ]
    });
  };

  const handleUpdateLocation = (index, field, value) => {
    const updatedLocations = [...formData.inventoryLocations];
    
    if (field === 'shopId') {
      const selectedShop = shops.find(s => s.id === value);
      updatedLocations[index].shopId = value;
      updatedLocations[index].shopName = selectedShop ? selectedShop.name : '';
    } else {
      updatedLocations[index][field] = value;
    }
    
    setFormData({ ...formData, inventoryLocations: updatedLocations });
  };

  const handleRemoveLocation = (index) => {
    const updatedLocations = formData.inventoryLocations.filter((_, i) => i !== index);
    setFormData({ ...formData, inventoryLocations: updatedLocations });
  };

  if (productsLoading || shopsLoading) return <div className="products-page"><h1>Loading...</h1></div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Products Inventory</h1>
          <p className="text-muted">Manage your hardware, paints, tiles, and sanitaryware</p>
        </div>
        <button className="btn-primary flex-center" onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); } }}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel form-panel">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Product Name</label>
                <input type="text" placeholder="Enter product name..." required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group"><label>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option>Sanitaryware</option><option>Paints</option>
                  <option>Tiles</option><option>Marble</option><option>Granite</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Brand</label><input type="text" placeholder="Brand name" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} /></div>
              <div className="form-group"><label>Size / Variant</label><input type="text" placeholder="e.g. 2x2, 20L" value={formData.sizeVariant} onChange={e => setFormData({ ...formData, sizeVariant: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Purchase Price (₹)</label><input type="number" placeholder="0.00" value={formData.purchasePrice} onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })} /></div>
              <div className="form-group"><label>Selling Price (₹)</label><input type="number" placeholder="0.00" value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })} /></div>
              <div className="form-group"><label>Min Alert Qty</label><input type="number" placeholder="10" value={formData.minAlertQty} onChange={e => setFormData({ ...formData, minAlertQty: parseInt(e.target.value) || 10 })} /></div>
            </div>

            <div className="inventory-allocations" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Inventory Locations</h4>
                <button type="button" className="btn-outline flex-center" onClick={handleAddLocation} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <Plus size={14} /> Add Location
                </button>
              </div>
              
              {formData.inventoryLocations.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>No inventory locations added. Add one to track stock.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.inventoryLocations.map((loc, index) => (
                    <div key={index} className="allocation-row">
                      <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                        <select 
                          value={loc.shopId} 
                          onChange={(e) => handleUpdateLocation(index, 'shopId', e.target.value)}
                          required
                        >
                          <option value="">Select Shop...</option>
                          {shops.map(shop => (
                            <option key={shop.id} value={shop.id}>{shop.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <input 
                          type="number" 
                          placeholder="Qty" 
                          value={loc.stock} 
                          onChange={(e) => handleUpdateLocation(index, 'stock', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <select 
                          value={loc.unit} 
                          onChange={(e) => handleUpdateLocation(index, 'unit', e.target.value)}
                        >
                          <option value="Piece">Piece</option>
                          <option value="Box">Box</option>
                          <option value="Litre">Litre</option>
                          <option value="Sq ft">Sq ft</option>
                          <option value="Meter">Meter</option>
                          <option value="Kg">Kg</option>
                        </select>
                      </div>
                      <button 
                        type="button" 
                        className="btn-icon danger" 
                        onClick={() => handleRemoveLocation(index)}
                        style={{ padding: '0.6rem', height: '100%' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-actions-end">
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-primary">{editingId ? 'Update Product' : 'Save Product'}</button>
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
                      <button className="btn-icon" onClick={() => handleEdit(p)}><Edit size={16} /></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
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
