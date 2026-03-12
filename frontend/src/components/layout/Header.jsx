import { Search, Bell, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search products, orders..." />
      </div>
      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        <div className="profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="profile-info">
            <span className="name">Admin</span>
            <span className="role">Owner</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
