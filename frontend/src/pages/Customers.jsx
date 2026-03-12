import { Search } from 'lucide-react';
import './Products.css';

const mockCustomers = [
  { id: 1, name: 'Rahul Sharma', phone: '+91 9123456780', address: 'Sector 14, Noida', totalPurchases: '₹ 1,24,000', credit: '₹ 5,000' },
  { id: 2, name: 'Amit Singh', phone: '+91 9123456781', address: 'Lajpat Nagar, Delhi', totalPurchases: '₹ 45,000', credit: '₹ 0' },
];

const Customers = () => {
  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <p className="text-muted">View customer history and credit balances</p>
        </div>
      </div>

      <div className="glass-panel table-panel">
        <div className="table-controls">
          <div className="search-bar">
            <Search size={18} className="icon" />
            <input type="text" placeholder="Search customers..." />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Total Purchases</th>
                <th>Credit Balance</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((c) => (
                <tr key={c.id}>
                  <td><div className="val-primary">{c.name}</div></td>
                  <td>{c.phone}</td>
                  <td>{c.address}</td>
                  <td>{c.totalPurchases}</td>
                  <td>
                    <span style={{color: c.credit !== '₹ 0' ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 600}}>
                      {c.credit}
                    </span>
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
export default Customers;
