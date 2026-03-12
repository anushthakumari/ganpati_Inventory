import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  Receipt, 
  Users, 
  Truck,
  BarChart3
} from 'lucide-react';
import './Sidebar.css'; 

const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Products', icon: <Package size={20} />, path: '/products' },
    { label: 'Inventory', icon: <Store size={20} />, path: '/inventory' },
    { label: 'Billing / POS', icon: <Receipt size={20} />, path: '/billing' },
    { label: 'Suppliers', icon: <Truck size={20} />, path: '/suppliers' },
    { label: 'Customers', icon: <Users size={20} />, path: '/customers' },
    { label: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">GH</div>
        <span className="logo-text">Ganpati Hardware</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
