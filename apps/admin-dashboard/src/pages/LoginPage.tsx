import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import { isFirebaseConfigured } from '../services/firebase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAdminStore((s) => s.login);
  const loginWithGoogle = useAdminStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form className="card" style={{ width: 400 }} onSubmit={handleSubmit}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Rentify Admin</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Sign in with your admin account</p>
        {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}
        <input
          className="input"
          type="email"
          placeholder="admin@rentify.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        {isFirebaseConfigured && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginTop: 12 }}
            disabled={loading}
            onClick={handleGoogle}
          >
            Continue with Google
          </button>
        )}
      </form>
    </div>
  );
}
