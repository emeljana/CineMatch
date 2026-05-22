import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createWatchParty,
  joinWatchParty,
  leaveWatchParty,
} from '../services/watchPartyService';
import { useWatchParty as useWatchPartyContext } from '../context/watchPartyContext';
import { useToast } from '../context/toastContext';
import { parseError } from '../helpers/errorHelpers';

export function useWatchParty() {
  const [loading, setLoading] = useState(false);
  const { setWatchParty } = useWatchPartyContext();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleCreate({ navigateOnSuccess = true } = {}) {
    setLoading(true);
    try {
      const { data } = await createWatchParty();
      setWatchParty(data);
      toast.success('WatchParty created.');
      if (navigateOnSuccess) navigate(`/watchparty/${data.id}/lobby`);
      return data;
    } catch (err) {
      const message = parseError(err);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(joinCode, { navigateOnSuccess = true } = {}) {
    setLoading(true);
    try {
      const { data } = await joinWatchParty(joinCode);
      setWatchParty(data);
      toast.success('Joined WatchParty.');
      if (navigateOnSuccess) navigate(`/watchparty/${data.id}/lobby`);
      return data;
    } catch (err) {
      const message = parseError(err);
      toast.error(message);
      return null;
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
