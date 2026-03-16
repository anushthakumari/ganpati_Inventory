import { useState, useEffect } from 'react';
import { Search, Trash2, Printer, CreditCard, Banknote, Smartphone, Save, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Billing.css';

const Billing = () => {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', gstin: '' });
  const [initialPayment, setInitialPayment] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [dimensionModal, setDimensionModal] = useState({ isOpen: false, product: null, length: '', width: '', pieces: '1' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editingId = searchParams.get('edit');

  const closeDimensionModal = () => setDimensionModal({ isOpen: false, product: null, length: '', width: '', pieces: '1' });

  const handleDimensionSubmit = (e) => {
    e.preventDefault();
    const { product, length, width, pieces } = dimensionModal;
    const L = parseFloat(length);
    const W = parseFloat(width);
    const P = parseInt(pieces);
    
    if (isNaN(L) || isNaN(W) || isNaN(P) || L <= 0 || W <= 0 || P <= 0) {
      return alert("Please enter valid dimensions.");
    }

    // Area calculation (Assuming price is per Sq Ft and dimensions are in Inches)
    // Area in Sq Ft = (L * W * P) / 144
    const totalArea = (L * W * P) / 144;
    const roundedArea = parseFloat(totalArea.toFixed(2));

    const itemToAdd = {
      ...product,
      productId: product.id,
      qty: roundedArea,
      gst: 18,
      length: L,
      width: W,
      pieces: P,
      isGranite: true
    };

    setCart([...cart, itemToAdd]);
    closeDimensionModal();
  };

  useEffect(() => {
    if (editingId) {
      const loadInvoice = async () => {
        try {
          const invoices = await api.invoices.getAll();
          const invoice = invoices.find(i => i.id === editingId);
          if (invoice) {
            setCart(invoice.items.map(item => ({ 
              ...item, 
              id: item.productId || item.id,
              isGranite: !!item.length 
            })));
            setCustomer(invoice.customer);
            setPaymentMethod(invoice.paymentMethod);
          }
        } catch (err) {
          console.error('Error loading invoice:', err);
        }
      };
      loadInvoice();
    }
  }, [editingId]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const allProducts = await api.products.getAll();
      setSearchResults(allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase())));
    } else {
      setSearchResults([]);
    }
  };

  const handleCustomerSearch = async (e) => {
    const query = e.target.value;
    setCustomerSearch(query);
    if (query.length > 2) {
      const allCustomers = await api.customers.getAll();
      setCustomerSuggestions(allCustomers.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.phone.includes(query)
      ));
    } else {
      setCustomerSuggestions([]);
    }
  };

  const selectCustomer = (c) => {
    setCustomer({ name: c.name, phone: c.phone, address: c.address || '', gstin: c.gstin || '' });
    setCustomerSearch('');
    setCustomerSuggestions([]);
  };

  const addToCart = (product) => {
    if (product.category === 'Granite') {
      setDimensionModal({ isOpen: true, product, length: '', width: '', pieces: '1' });
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, productId: product.id, qty: 1, gst: 18 }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateQty = (id, newQty) => {
    setCart(cart.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  const removeItem = (id) => setCart(cart.filter(item => item.id !== id));

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalGst = cart.reduce((acc, item) => acc + ((item.price * item.qty) * (item.gst / 100)), 0);
  const total = subtotal + totalGst;

  const handleFinalize = async (status = 'finalized') => {
    if (cart.length === 0) return alert('Cart is empty');
    try {
      // Check if customer exists, if not and has phone, save it
      if (customer.phone) {
        const allCustomers = await api.customers.getAll();
        const exists = allCustomers.find(c => c.phone === customer.phone);
        if (!exists) {
          await api.customers.add(customer);
        }
      }

      // Determine effective status based on initial payment
      const paid = parseFloat(initialPayment) || 0;
      let effectiveStatus = status;
      if (status !== 'draft') {
        if (paid <= 0) effectiveStatus = 'finalized'; // Fully on credit
        else if (paid >= total) effectiveStatus = 'fully_paid';
        else effectiveStatus = 'partially_paid';
      }

      // Collect payments array for initial upfront payment
      const initialPayments = paid > 0 ? [{ amount: paid, method: paymentMethod, note: 'Initial payment' }] : [];

      const invoiceData = {
        customer,
        items: cart,
        subtotal,
        totalGst,
        grandTotal: total,
        amountPaid: paid,
        payments: initialPayments,
        paymentMethod,
        status: effectiveStatus
      };
      
      if (editingId) {
        await api.invoices.update(editingId, invoiceData);
        alert(status === 'draft' ? 'Draft updated!' : 'Invoice finalized!');
      } else {
        await api.invoices.create(invoiceData);
        alert(status === 'draft' ? 'Draft saved!' : 'Invoice created!');
      }
      
      if (status !== 'draft') {
        setCart([]);
        setCustomer({ name: '', phone: '', address: '', gstin: '' });
        setInitialPayment(0);
        if (editingId) navigate('/billing');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert(`Failed to save invoice: ${error.message}`);
    }
  };

  return (
    <div className="billing-page">
      <div className="billing-main">
        <div className="glass-panel pos-wrapper">
          <div className="pos-header">
            <h2>New Invoice</h2>
            <div className="pos-search">
              <Search size={18} className="pos-search-icon" />
              <input type="text" placeholder="Search product..." value={searchQuery} onChange={handleSearch} />
              {searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map(p => (
                    <div key={p.id} className="search-result-item" onClick={() => addToCart(p)}>
                      <div className="item-info">
                        <span className="item-name">{p.name}</span>
                        <span className="item-meta">{p.category} | {p.brand}</span>
                      </div>
                      <div className="item-price-stock">
                        <span className="price">₹{p.price}</span>
                        <span className="stock">{p.stock} in stock</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="cart-list">
            <div className="cart-header">
              <span>Item Description</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Total</span>
              <span></span>
            </div>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="text-muted">GST: {item.gst}%</span>
                    {item.isGranite && (
                      <span className="badge-outline" style={{ fontSize: '0.7rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                        {item.length}" x {item.width}" @ {item.pieces} pcs
                      </span>
                    )}
                  </div>
                </div>
                <div className="item-price">₹{item.price.toFixed(2)}</div>
                <div className="item-qty">
                  <input type="number" min="1" value={item.qty} onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)} />
                </div>
                <div className="item-total">₹ {(item.price * item.qty).toFixed(2)}</div>
                <div className="item-remove">
                  <button className="btn-icon danger" onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && <div className="empty-cart">Cart is empty. Search products to add.</div>}
          </div>
        </div>
      </div>

      <div className="billing-sidebar flex-col">
        <div className="glass-panel customer-panel">
          <h3 className="panel-title">Customer Details</h3>
          <div className="pos-search mb-2" style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
             <Search size={16} className="pos-search-icon" style={{ opacity: 0.6 }} />
             <input 
              type="text" 
              placeholder="Search existing customer..." 
              style={{ fontSize: '0.9rem' }}
              value={customerSearch}
              onChange={handleCustomerSearch}
             />
             {customerSuggestions.length > 0 && (
                <div className="search-dropdown" style={{ top: 'calc(100% + 5px)' }}>
                  {customerSuggestions.map(c => (
                    <div key={c.id} className="search-result-item" onClick={() => selectCustomer(c)}>
                      <div className="item-info">
                        <span className="item-name">{c.name}</span>
                        <span className="item-meta">{c.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
          <div className="form-group mb-2">
            <input type="text" placeholder="Customer Name" className="full-input" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
          </div>
          <div className="form-group mb-2">
            <input type="text" placeholder="Phone" className="full-input" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
          </div>
          <div className="form-group mb-2">
            <input type="text" placeholder="Address (Optional)" className="full-input" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
          </div>
          <div className="form-group">
            <input type="text" placeholder="GSTIN (Optional)" className="full-input" value={customer.gstin} onChange={e => setCustomer({...customer, gstin: e.target.value})} />
          </div>
        </div>

        <div className="glass-panel summary-panel flex-1">
          <h3 className="panel-title">Payment Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>GST (CGST + SGST)</span>
            <span>₹{totalGst.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Discount</span>
            <span style={{color: 'var(--success)'}}>- ₹0.00</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Grand Total</span>
            <span className="grand-total">₹{total.toFixed(2)}</span>
          </div>

          {/* Upfront Payment Field */}
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount Paid Now (₹)</div>
            <input
              type="number"
              min="0"
              max={total}
              placeholder="0.00"
              value={initialPayment || ''}
              onChange={e => setInitialPayment(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)', outline: 'none', padding: 0 }}
            />
            {parseFloat(initialPayment) > 0 && parseFloat(initialPayment) < total && (
              <div style={{ fontSize: '0.85rem', color: 'var(--warning)', marginTop: '0.25rem' }}>
                Balance due: ₹{(total - parseFloat(initialPayment)).toFixed(2)}
              </div>
            )}
            {parseFloat(initialPayment) >= total && (
              <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '0.25rem' }}>✓ Fully paid</div>
            )}
          </div>

          <div className="payment-methods" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
            <button className={`pay-btn ${paymentMethod === 'cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('cash')}>
              <Banknote size={20}/> Cash
            </button>
            <button className={`pay-btn ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>
              <Smartphone size={20}/> UPI
            </button>
            <button className={`pay-btn ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
              <CreditCard size={20}/> Card
            </button>
            <button className={`pay-btn ${paymentMethod === 'cheque' ? 'active' : ''}`} onClick={() => setPaymentMethod('cheque')}>
              <Banknote size={20}/> Cheque
            </button>
          </div>

          <div className="billing-actions">
                <button className="btn-secondary w-full flex-center justify-center" onClick={() => handleFinalize('draft')}>
                  <Save size={18}/> {editingId ? 'Update Udhaar (Draft)' : 'Save as Udhaar (Draft)'}
                </button>
                <button className="btn-primary w-full shadow-glow flex-center justify-center" onClick={() => handleFinalize('finalized')}>
                  <Printer size={18}/> {editingId ? 'Pay & Finalize' : 'Pay & Finalize Invoice'}
                </button>
          </div>
        </div>
      </div>

      {/* Granite Dimension Modal */}
      {dimensionModal.isOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Granite Dimensions</h3>
              <button className="btn-icon" onClick={closeDimensionModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleDimensionSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Product</p>
                <div className="val-primary" style={{ fontSize: '1.1rem' }}>{dimensionModal.product?.name}</div>
              </div>

              <div className="responsive-grid-3">
                <div className="form-group">
                  <label>Length (in)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="L" 
                    required 
                    value={dimensionModal.length} 
                    onChange={e => setDimensionModal({...dimensionModal, length: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Width (in)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="W" 
                    required 
                    value={dimensionModal.width} 
                    onChange={e => setDimensionModal({...dimensionModal, width: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Pieces</label>
                  <input 
                    type="number" 
                    placeholder="Pcs" 
                    required 
                    value={dimensionModal.pieces} 
                    onChange={e => setDimensionModal({...dimensionModal, pieces: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Calculated Area</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {dimensionModal.length && dimensionModal.width && dimensionModal.pieces ? 
                    ((parseFloat(dimensionModal.length) * parseFloat(dimensionModal.width) * parseInt(dimensionModal.pieces)) / 144).toFixed(2) : '0.00'
                  } <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Sq Ft</span>
                </div>
              </div>

              <div className="form-actions-end">
                <button type="button" className="btn-secondary" onClick={closeDimensionModal}>Cancel</button>
                <button type="submit" className="btn-primary">Add to Cart</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
