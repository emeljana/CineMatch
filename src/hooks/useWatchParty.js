import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createWatchParty,
  joinWatchParty,
  leaveWatchParty,
} from '../services/watchPartyService';
import { useWatchParty as useWatchPartyContext } from '../context/watchPartyContext';
import { useToast } from '../context/toastContext';

function parseError(err) {
  const errors = err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) return errors[0].description;
  return 'Something went wrong. Please try again.';
}

export function useWatchParty() {
  const [loading, setLoading] = useState(false);
  const { setWatchParty } = useWatchPartyContext();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleCreate() {
    setLoading(true);
    try {
      const { data } = await createWatchParty();
      setWatchParty(data);
      toast.success('WatchParty created.');
      navigate(`/watchparty/${data.id}`);
    } catch (err) {
      const message = parseError(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(joinCode) {
    setLoading(true);
    try {
      const { data } = await joinWatchParty(joinCode);
      setWatchParty(data);
      toast.success('Joined WatchParty.');
      navigate(`/watchparty/${data.id}`);
    } catch (err) {
      const message = parseError(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave(id) {
    setLoading(true);
    try {
      await leaveWatchParty(id);
      setWatchParty(null);
      toast.info('You left the WatchParty.');
      navigate('/home');
    } catch (err) {
      const message = parseError(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return { handleCreate, handleJoin, handleLeave, loading };
}
