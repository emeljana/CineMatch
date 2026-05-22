/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/userService';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    async function fetchUser() {
      try {
        const { data } = await getMe();
        setUser(data);
      } catch {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
