import React, { useState } from 'react';
import { ArrowRightLeft, Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useShops } from '../hooks/useShops';
import api from '../services/api';
import './Products.css'; // Reusing table styles

const Inventory = () => {
  const { products, loading: productsLoading, setProducts } = useProducts();
  const { shops, loading: shopsLoading } = useShops();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    product: null,
    fromShopId: '',
    toShopId: '',
    quantity: ''
  });

  if (productsLoading || shopsLoading) return <div className="products-page"><h1>Loading Inventory...</h1></div>;

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const { product, fromShopId, toShopId, quantity } = transferModal;
    const qty = parseInt(quantity);

    if (!product || !fromShopId || !toShopId || isNaN(qty) || qty <= 0) return;
    if (fromShopId === toShopId) {
      alert("Source and Destination shops must be different.");
      return;
    }

    try {
      // Find current locations
      const locs = [...(product.inventoryLocations || [])];

      const fromIdx = locs.findIndex(l => l.shopId === fromShopId);
      if (fromIdx === -1 || locs[fromIdx].stock < qty) {
        alert("Not enough stock in the source shop.");
        return;
      }

      const toIdx = locs.findIndex(l => l.shopId === toShopId);
      const toShopName = shops.find(s => s.id === toShopId)?.name || '';

      // Deduct from source
      locs[fromIdx].stock -= qty;

      // Add to destination
      if (toIdx !== -1) {
        locs[toIdx].stock += qty;
      } else {
        // If the shop doesn't have this product yet, add a new location entry
        // We inherit the unit from the source location
        locs.push({
          shopId: toShopId,
          shopName: toShopName,
          stock: qty,
          unit: locs[fromIdx].unit
        });
      }

      // Filter out locations with 0 stock if necessary (optional)
      const updatedProduct = { ...product, inventoryLocations: locs };

      // Call API
      const result = await api.products.update(product.id || product._id, updatedProduct);

      // Update local state by directly updating the product record format the UI expects
      setProducts(products.map(p => p.id === product.id ? result : p));

      closeTransferModal();
    } catch (err) {
      console.error('Failed to transfer stock', err);
      alert("Failed to transfer stock.");
    }
  };

  const closeTransferModal = () => {
    setTransferModal({ isOpen: false, product: null, fromShopId: '', toShopId: '', quantity: '' });
  };

  const filteredItems = products
    .filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(p => {
      const locs = p.inventoryLocations || [];
      const total = locs.reduce((sum, loc) => sum + loc.stock, 0);
      const minAlert = p.minAlertQty || 10;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        locations: locs,
        total: total,
        status: total === 0 ? 'Out of Stock' : (total <= minAlert) ? 'Low Stock' : 'Healthy'
      };
    });

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Inventory & Stock Transfers</h1>
          <p className="text-muted">Monitor stock levels across all locations</p>
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
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr style={{ cursor: 'pointer', background: expandedRows.has(item.id) ? 'var(--bg-light)' : 'transparent' }} onClick={() => toggleRow(item.id)}>
                    <td style={{ textAlign: 'center' }}>
                      {expandedRows.has(item.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                    <td><div className="val-primary">{item.name}</div></td>
                    <td><span className="badge-outline">{item.category}</span></td>
                    <td><div className="val-primary">{item.total}</div></td>
                    <td>
                      <span style={{ color: item.status.includes('Low') || item.status.includes('Out') ? 'var(--warning)' : 'var(--success)', fontSize: '0.85rem', fontWeight: 500 }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-outline flex-center"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const fullProductRecord = products.find(p => p.id === item.id);
                          setTransferModal({ ...transferModal, isOpen: true, product: fullProductRecord });
                        }}
                      >
                        <ArrowRightLeft size={14} /> Transfer
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row for Shop Breakdown */}
                  {expandedRows.has(item.id) && (
                    <tr className="expanded-row" style={{ background: 'var(--bg-dark)' }}>
                      <td colSpan="6" style={{ padding: 0 }}>
                        <div style={{ padding: '1rem', paddingLeft: '4rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                          <h5 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location Breakdown</h5>

                          {item.locations.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>No inventory locations assigned.</p>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                              {item.locations.map((loc, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 500 }}>{loc.shopName}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{loc.stock}</strong> {loc.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No inventory items found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal Overlay */}
      {transferModal.isOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Transfer Stock</h3>
              <button className="btn-icon" onClick={closeTransferModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleTransferSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Product</p>
                <div className="val-primary" style={{ fontSize: '1.1rem' }}>{transferModal.product?.name}</div>
              </div>

              <div className="form-group">
                <label>From Shop</label>
                <select
                  value={transferModal.fromShopId}
                  onChange={e => setTransferModal({ ...transferModal, fromShopId: e.target.value })}
                  required
                >
                  <option value="">Select source...</option>
                  {(transferModal.product?.inventoryLocations || []).filter(loc => loc.stock > 0).map(loc => (
                    <option key={loc.shopId} value={loc.shopId}>
                      {loc.shopName} (Available: {loc.stock} {loc.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>To Shop</label>
                <select
                  value={transferModal.toShopId}
                  onChange={e => setTransferModal({ ...transferModal, toShopId: e.target.value })}
                  required
                >
                  <option value="">Select destination...</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity to Transfer</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter quantity"
                  value={transferModal.quantity}
                  onChange={e => setTransferModal({ ...transferModal, quantity: e.target.value })}
                />
              </div>

              <div className="form-actions-end" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" onClick={closeTransferModal}>Cancel</button>
                <button type="submit" className="btn-primary flex-center">
                  <ArrowRightLeft size={16} /> Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
