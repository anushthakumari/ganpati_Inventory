import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MoreVertical } from 'lucide-react';
import './Products.css';

const mockProducts = [
  { id: 1, name: 'Premium Ceramic Tiles 2x2', category: 'Tiles', brand: 'Kajaria', price: 850, stock: 450, shop: 'Shop 1' },
  { id: 2, name: 'Asian Paints Apex 20L', category: 'Paints', brand: 'Asian Paints', price: 3200, stock: 32, shop: 'Shop 1 & 2' },
  { id: 3, name: 'Hindware Wash Basin', category: 'Sanitaryware', brand: 'Hindware', price: 1500, stock: 15, shop: 'Shop 2' },
  { id: 4, name: 'Italian Marble Slab', category: 'Marble', brand: 'Imported', price: 5500, stock: 120, shop: 'Shop 1' },
  { id: 5, name: 'Berger Easy Clean 10L', category: 'Paints', brand: 'Berger', price: 1800, stock: 45, shop: 'Shop 2' },
];

const Products = () => {
  const [showForm, setShowForm] = useState(false);

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
          <form className="product-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <div className="form-group"><label>Product Name</label><input type="text" placeholder="Enter product name..." /></div>
              <div className="form-group"><label>Category</label>
                <select>
                  <option>Sanitaryware</option><option>Paints</option>
                  <option>Tiles</option><option>Marble</option><option>Granite</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Brand</label><input type="text" placeholder="Brand name" /></div>
              <div className="form-group"><label>Size / Variant</label><input type="text" placeholder="e.g. 2x2, 20L" /></div>
              <div className="form-group"><label>Unit</label>
                <select><option>Piece</option><option>Box</option><option>Litre</option><option>Sq ft</option></select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Purchase Price (₹)</label><input type="number" placeholder="0.00" /></div>
              <div className="form-group"><label>Selling Price (₹)</label><input type="number" placeholder="0.00" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Stock Shop 1</label><input type="number" placeholder="0" /></div>
              <div className="form-group"><label>Stock Shop 2</label><input type="number" placeholder="0" /></div>
              <div className="form-group"><label>Min Alert Qty</label><input type="number" placeholder="10" /></div>
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
            <input type="text" placeholder="Search products..." />
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
              {mockProducts.map((p) => (
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
                      <button className="btn-icon danger"><Trash2 size={16} /></button>
                      <button className="btn-icon"><MoreVertical size={16} /></button>
                    </div>
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

export default Products;
