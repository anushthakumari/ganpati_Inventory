import { Store, User, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-glass-panel">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo">
              <Store size={32} />
            </div>
          </div>
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to Ganpati Hardware IMS</p>
        </div>
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username or Email</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input type="text" placeholder="admin@ganpati.com" required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="•••••••••" required />
            </div>
          </div>
          
          <div className="form-actions">
            <label className="checkbox-label">
              <input type="checkbox" /> <span className="checkmark-text">Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>
          
          <button type="submit" className="btn-primary w-full login-btn">
            Sign In to Dashboard <ArrowRight size={18} />
          </button>
        </form>
      </div>
      
      <div className="login-footer">
        <p>Ganpati Hardware &copy; 2026</p>
      </div>
    </div>
  );
};

export default Login;
