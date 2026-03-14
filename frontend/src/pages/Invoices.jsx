import { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Products.css'; // Reusing table styles

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await api.invoices.getAll();
        setInvoices(data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice? Stock will be reverted if finalized.')) {
      try {
        await api.invoices.delete(id);
        setInvoices(invoices.filter(i => i.id !== id));
      } catch (err) {
        console.error('Error deleting invoice:', err);
        alert('Failed to delete invoice');
      }
    }
  };

  const filteredInvoices = invoices.filter(i => 
    i.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="products-page"><h1>Loading Invoices...</h1></div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Invoices & Drafts</h1>
          <p className="text-muted">Manage finalized invoices and pending drafts</p>
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
          <button className="btn-outline flex-center"><Filter size={18} /> Filters</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td><div className="val-primary">#{inv.id.slice(-6).toUpperCase()}</div></td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td>{inv.customer?.name || 'Walk-in Customer'}</td>
                  <td>₹ {inv.grandTotal.toFixed(2)}</td>
                  <td>
                    <span className={`badge-outline ${inv.status === 'draft' ? 'warning' : 'success'}`} 
                          style={{
                            borderColor: inv.status === 'draft' ? 'var(--warning)' : 'var(--success)',
                            color: inv.status === 'draft' ? 'var(--warning)' : 'var(--success)'
                          }}>
                      {inv.status === 'draft' ? 'Credit (Draft)' : 'Paid (Finalized)'}
                    </span>
                  </td>
                  <td style={{textTransform: 'capitalize'}}>{inv.paymentMethod}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/billing?edit=${inv.id}`)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(inv.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No invoices found.
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

export default Invoices;
