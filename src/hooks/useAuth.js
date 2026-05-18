import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authService';
import { useUser } from '../context/userContext';

function parseError(err) {
  const errors = err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) return errors[0].description;
  return 'Something went wrong. Please try again.';
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser, logout } = useUser();
  const navigate = useNavigate();

  async function handleLogin(email, password) {
    setError(null);
    setLoading(true);
    try {
      const { data } = await login(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      navigate('/home');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(username, email, password) {
    setError(null);
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/login');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return { handleLogin, handleRegister, handleLogout, loading, error, setError };
}
