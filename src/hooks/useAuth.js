import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authService';
import { useUser } from '../context/userContext';
import { useToast } from '../context/toastContext';

function parseError(err) {
  const errors = err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) return errors[0].description;
  return 'Something went wrong. Please try again.';
}

function isNetworkError(err) {
  return !err.response;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser, logout } = useUser();
  const toast = useToast();
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
      const message = parseError(err);
      if (isNetworkError(err)) {
        toast.error(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(username, email, password) {
    setError(null);
    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Account created. You can log in now.');
      navigate('/login');
    } catch (err) {
      const message = parseError(err);
      if (isNetworkError(err)) {
        toast.error(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setError(null);
    logout();
    navigate('/login');
  }

  return { handleLogin, handleRegister, handleLogout, loading, error, setError };
}
