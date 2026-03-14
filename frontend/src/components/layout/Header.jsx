import { Search, Bell, User, LogOut, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const allProducts = await api.products.getAll();
        const filtered = allProducts.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        setSearchResults(filtered);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResultClick = (id) => {
    setSearchQuery('');
    setShowResults(false);
    navigate('/inventory'); // Or /products
  };

  return (
    <header className="header">
      <div className="header-search" ref={searchRef}>
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search products, orders..." 
          value={searchQuery} 
          onChange={handleSearch} 
          onFocus={() => searchQuery.length > 2 && setShowResults(true)}
        />
        {showResults && searchResults.length > 0 && (
          <div className="global-search-results">
            {searchResults.map(p => (
              <div key={p.id} className="search-result-row" onClick={() => handleResultClick(p.id)}>
                <div className="result-icon"><Package size={16} /></div>
                <div className="result-info">
                  <div className="result-name">{p.name}</div>
                  <div className="result-meta">{p.category} • ₹{p.price}</div>
                </div>
                <ArrowRight size={14} className="result-arrow" />
              </div>
            ))}
            <div className="search-footer" onClick={() => navigate('/products')}>
              View all products
            </div>
          </div>
        )}
      </div>
      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">0</span>
        </button>
        <div className="profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="profile-info">
            <span className="name">{user?.username || 'Admin'}</span>
            <span className="role" style={{ textTransform: 'capitalize' }}>{user?.role || 'User'}</span>
          </div>
          <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout" style={{ marginLeft: '1rem', color: 'var(--danger)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
