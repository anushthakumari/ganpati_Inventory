import { useState } from 'react';
import { Store, User, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
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
          {error && <div className="error-message" style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input type="email" placeholder="admin@ganpati.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="•••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          
          <div className="form-actions">
            <label className="checkbox-label">
              <input type="checkbox" /> <span className="checkmark-text">Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>
          
          <button type="submit" className="btn-primary w-full login-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="flex-center gap-2">
                <div className="spinner-small" /> Signing In...
              </span>
            ) : (
              <>Sign In to Dashboard <ArrowRight size={18} /></>
            )}
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
