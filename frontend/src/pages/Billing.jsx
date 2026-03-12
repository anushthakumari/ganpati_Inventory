import { useState } from 'react';
import { Search, Trash2, Printer, CreditCard, Banknote, Smartphone } from 'lucide-react';
import './Billing.css';

const Billing = () => {
  const [cart, setCart] = useState([
    { id: 1, name: 'Premium Ceramic Tiles 2x2', price: 850, qty: 10, gst: 18 },
    { id: 2, name: 'Asian Paints Apex 20L', price: 3200, qty: 1, gst: 18 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const updateQty = (id, newQty) => {
    setCart(cart.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  const removeItem = (id) => setCart(cart.filter(item => item.id !== id));

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalGst = cart.reduce((acc, item) => acc + ((item.price * item.qty) * (item.gst / 100)), 0);
  const total = subtotal + totalGst;

  return (
    <div className="billing-page">
      <div className="billing-main">
        <div className="glass-panel pos-wrapper">
          <div className="pos-header">
            <h2>New Invoice</h2>
            <div className="pos-search">
              <Search size={18} className="pos-search-icon" />
              <input type="text" placeholder="Scan barcode or search product..." autoFocus />
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
                  <span className="text-muted">GST: {item.gst}%</span>
                </div>
                <div className="item-price">₹{item.price.toFixed(2)}</div>
                <div className="item-qty">
                  <input type="number" min="1" value={item.qty} onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)} />
                </div>
                <div className="item-total">₹{(item.price * item.qty).toFixed(2)}</div>
                <button className="btn-icon danger" onClick={() => removeItem(item.id)}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
            {cart.length === 0 && <div className="empty-cart">Cart is empty. Search products to add.</div>}
          </div>
        </div>
      </div>

      <div className="billing-sidebar flex-col">
        <div className="glass-panel customer-panel">
          <h3 className="panel-title">Customer Details</h3>
          <div className="form-group mb-2">
            <input type="text" placeholder="Customer Phone / Name" className="full-input" />
          </div>
          <div className="form-group mb-2">
            <input type="text" placeholder="Address (Optional)" className="full-input" />
          </div>
          <div className="form-group">
            <input type="text" placeholder="GSTIN (Optional)" className="full-input" />
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
            <button className="btn-secondary w-full">Save Draft / Add to Ongoing Bill</button>
            <button className="btn-primary w-full shadow-glow flex-center justify-center">
              <Printer size={18}/> Finalize & Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Billing;
