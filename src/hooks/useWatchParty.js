import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createWatchParty,
  joinWatchParty,
  leaveWatchParty,
} from '../services/watchPartyService';
import { useWatchParty as useWatchPartyContext } from '../context/watchPartyContext';

function parseError(err) {
  const errors = err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) return errors[0].description;
  return 'Something went wrong. Please try again.';
}

export function useWatchParty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setWatchParty } = useWatchPartyContext();
  const navigate = useNavigate();

  async function handleCreate() {
    setError(null);
    setLoading(true);
    try {
      const { data } = await createWatchParty();
      setWatchParty(data);
      navigate(`/watchparty/${data.id}`);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(joinCode) {
    setError(null);
    setLoading(true);
    try {
      const { data } = await joinWatchParty(joinCode);
      setWatchParty(data);
      navigate(`/watchparty/${data.id}`);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave(id) {
    setError(null);
    setLoading(true);
    try {
      await leaveWatchParty(id);
      setWatchParty(null);
      navigate('/');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  return { handleCreate, handleJoin, handleLeave, loading, error, setError };
}
