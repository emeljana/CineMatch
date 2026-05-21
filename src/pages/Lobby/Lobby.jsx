import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWatchParty, startWatchParty } from '../../services/watchPartyService';
import { useUser } from '../../context/userContext';
import { useWatchParty } from '../../hooks/useWatchParty';
import { useToast } from '../../context/toastContext';
import Button from '../../components/Button/Button';
import JoinCode from '../../components/party/JoinCode/JoinCode';
import Modal from '../../components/ui/Modal/Modal';
import './Lobby.css';

const POLL_INTERVAL_MS = 5000;

function Lobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { handleLeave, loading: leaveLoading } = useWatchParty();
  const toast = useToast();

  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadParty({ showRefreshing = false } = {}) {
      if (showRefreshing) setRefreshing(true);

      try {
        const { data } = await getWatchParty(id);
        if (!isMounted) return;
        setParty(data);
        setLoadFailed(false);

        if (data.isStarted) {
          navigate(`/watchparty/${id}`);
        }
      } catch {
        if (!isMounted) return;
        setLoadFailed(true);
        toast.error('Could not load the lobby.');
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadParty();
    const intervalId = window.setInterval(
      () => loadParty({ showRefreshing: true }),
      POLL_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [id, toast]);

  async function handleStartSession() {
    setStarting(true);
    try {
      await startWatchParty(id);
      navigate(`/watchparty/${id}`);
    } catch {
      toast.error('Could not start the session. Try again.');
    } finally {
      setStarting(false);
    }
  }

  function onLeaveClick() {
    if (party?.hostUsername === user?.username) {
      setConfirmLeaveOpen(true);
    } else {
      handleLeave(id);
    }
  }

  if (loading) return <div className="lobby-status">Loading lobby...</div>;
  if (loadFailed) {
    return <div className="lobby-status lobby-status--error">Lobby unavailable.</div>;
  }

  const activeMembers = party?.members?.filter((member) => member.isActive) ?? [];
  const isHost = party?.hostUsername === user?.username;

  return (
    <div className="lobby-page">
      <header className="lobby-header">
        <div>
          <span className="lobby-logo">CineMatch</span>
          <h1 className="lobby-title">WatchParty lobby</h1>
        </div>
        <Button
          variant="secondary"
          onClick={onLeaveClick}
          disabled={leaveLoading}
        >
          Leave party
        </Button>
      </header>

      <main className="lobby-main">
        <section className="lobby-code-panel" aria-label="Join code">
          <span className="lobby-code-label">Join code</span>
          <JoinCode code={party?.joinCode} />
        </section>

        <section className="lobby-content">
          <div className="lobby-members-header">
            <div>
              <h2>Active participants</h2>
              <p>{activeMembers.length} ready to swipe</p>
            </div>
            {refreshing && <span className="lobby-refreshing">Updating...</span>}
          </div>

          <ul className="lobby-member-list">
            {activeMembers.map((member) => (
              <li className="lobby-member" key={member.userId}>
                <span className="lobby-member-avatar">
                  {member.username.charAt(0).toUpperCase()}
                </span>
                <span className="lobby-member-name">{member.username}</span>
                {member.username === party?.hostUsername && (
                  <span className="lobby-host-badge">Host</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="lobby-actions">
          {isHost ? (
            <Button onClick={handleStartSession} disabled={starting}>
              {starting ? 'Startar...' : 'Starta session'}
            </Button>
          ) : (
            <p className="lobby-waiting">Väntar på att hosten startar...</p>
          )}
        </section>
      </main>
      <Modal
        isOpen={confirmLeaveOpen}
        onClose={() => setConfirmLeaveOpen(false)}
        title="Lämna partyt?"
      >
        <p className="modal-body">
          Om du lämnar som host stängs partyt för alla deltagare.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirmLeaveOpen(false)}>
            Avbryt
          </Button>
          <Button
            variant="danger"
            onClick={() => { setConfirmLeaveOpen(false); handleLeave(id); }}
            disabled={leaveLoading}
          >
            Lämna ändå
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Lobby;
