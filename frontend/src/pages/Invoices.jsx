import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, FileText, ChevronDown, ChevronUp, X, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Products.css';

const STATUS_CONFIG = {
  draft:          { label: 'Credit (Udhaar)', color: 'var(--warning)' },
  finalized:      { label: 'Unpaid',          color: 'var(--danger)'  },
  partially_paid: { label: 'Partially Paid',  color: '#f59e0b'        },
  fully_paid:     { label: 'Fully Paid',      color: 'var(--success)' },
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, invoice: null, amount: '', method: 'cash', note: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await api.invoices.getAll();
        setInvoices(data.map(i => ({ ...i, id: i._id || i.id })));
      } catch (err) {
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedRows(next);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this invoice? Stock will be reverted.')) {
      try {
        await api.invoices.delete(id);
        setInvoices(invoices.filter(i => i.id !== id));
      } catch (err) {
        alert('Failed to delete invoice');
      }
    }
  };

  const openPaymentModal = (inv) => {
    setPaymentModal({ isOpen: true, invoice: inv, amount: '', method: 'cash', note: '' });
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, invoice: null, amount: '', method: 'cash', note: '' });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const { invoice, amount, method, note } = paymentModal;
    const paid = parseFloat(amount);
    const balanceDue = (invoice.grandTotal || 0) - (invoice.amountPaid || 0);

    if (isNaN(paid) || paid <= 0) return alert('Enter a valid amount');
    if (paid > balanceDue) return alert(`Amount exceeds balance due (₹${balanceDue.toFixed(2)})`);

    try {
      const updated = await api.invoices.addPayment(invoice.id, { amount: paid, method, note });
      const mapped = { ...updated, id: updated._id || updated.id };
      setInvoices(invoices.map(i => i.id === invoice.id ? mapped : i));
      closePaymentModal();
    } catch (err) {
      alert(`Failed to record payment: ${err.message}`);
    }
  };

  const filteredInvoices = invoices.filter(i =>
    i.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="products-page"><h1>Loading Invoices...</h1></div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Invoices & Payments</h1>
          <p className="text-muted">Manage invoices, track instalments and balances</p>
        </div>
        <button className="btn-primary flex-center" onClick={() => navigate('/billing')}>
          <FileText size={18} /> New Invoice
        </button>
      </div>

      <div className="glass-panel table-panel">
        <div className="table-controls">
          <div className="search-bar">
            <Search size={18} className="icon" />
            <input
              type="text"
              placeholder="Search by customer or invoice ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const balanceDue = (inv.grandTotal || 0) - (inv.amountPaid || 0);
                const statusCfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.finalized;
                const isExpanded = expandedRows.has(inv.id);
                const canPay = inv.status !== 'fully_paid' && inv.status !== 'draft';

                return (
                  <React.Fragment key={inv.id}>
                    <tr style={{ cursor: 'pointer', background: isExpanded ? 'var(--bg-light)' : 'transparent' }} onClick={() => toggleRow(inv.id)}>
                      <td style={{ textAlign: 'center' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td><div className="val-primary">#{(inv.id || '').slice(-6).toUpperCase()}</div></td>
                      <td>{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>{inv.customer?.name || 'Walk-in'}</td>
                      <td>₹ {(inv.grandTotal || 0).toFixed(2)}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹ {(inv.amountPaid || 0).toFixed(2)}</td>
                      <td style={{ color: balanceDue > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                        ₹ {balanceDue.toFixed(2)}
                      </td>
                      <td>
                        <span className="badge-outline" style={{ borderColor: statusCfg.color, color: statusCfg.color, fontSize: '0.8rem' }}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" onClick={e => e.stopPropagation()}>
                          {canPay && (
                            <button className="btn-outline flex-center" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }} onClick={() => openPaymentModal(inv)}>
                              <IndianRupee size={13} /> Pay
                            </button>
                          )}
                          <button className="btn-icon" title="Edit" onClick={() => navigate(`/billing?edit=${inv.id}`)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(inv.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Payment History Accordion */}
                    {isExpanded && (
                      <tr style={{ background: 'var(--bg-dark)' }}>
                        <td colSpan="9" style={{ padding: 0 }}>
                          <div style={{ padding: '1rem', paddingLeft: '4rem', background: 'rgba(255,255,255,0.02)' }}>
                            <h5 style={{ margin: '0 0 0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Payment History ({(inv.payments || []).length} entries)
                            </h5>
                            {(!inv.payments || inv.payments.length === 0) ? (
                              <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>No payments recorded yet.</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {inv.payments.map((p, idx) => (
                                  <div key={idx} style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>₹ {p.amount.toFixed(2)}</span>
                                    <span className="badge-outline" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{p.method}</span>
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>{new Date(p.date).toLocaleString('en-IN')}</span>
                                    {p.note && <span className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>"{p.note}"</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '420px', maxWidth: '90%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Record Payment</h3>
                <p className="text-muted" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                  Invoice #{(paymentModal.invoice?.id || '').slice(-6).toUpperCase()} — {paymentModal.invoice?.customer?.name || 'Walk-in'}
                </p>
              </div>
              <button className="btn-icon" onClick={closePaymentModal}><X size={20} /></button>
            </div>

            {/* Balance Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Grand Total', val: paymentModal.invoice?.grandTotal, color: 'var(--text-main)' },
                { label: 'Amount Paid', val: paymentModal.invoice?.amountPaid || 0, color: 'var(--success)' },
                { label: 'Balance Due', val: (paymentModal.invoice?.grandTotal || 0) - (paymentModal.invoice?.amountPaid || 0), color: 'var(--danger)' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: 'var(--bg-light)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontWeight: 700, color, fontSize: '1rem' }}>₹{(val || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={(paymentModal.invoice?.grandTotal || 0) - (paymentModal.invoice?.amountPaid || 0)}
                  step="0.01"
                  required
                  placeholder="Enter amount received"
                  value={paymentModal.amount}
                  onChange={e => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentModal.method} onChange={e => setPaymentModal({ ...paymentModal, method: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="form-group">
                <label>Note (Optional)</label>
                <input type="text" placeholder="e.g. 2nd installment" value={paymentModal.note} onChange={e => setPaymentModal({ ...paymentModal, note: e.target.value })} />
              </div>
              <div className="form-actions-end" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={closePaymentModal}>Cancel</button>
                <button type="submit" className="btn-primary flex-center">
                  <IndianRupee size={16} /> Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
