import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWatchParty, startWatchParty } from '../../services/watchPartyService';
import { useUser } from '../../context/userContext';
import { useWatchParty } from '../../hooks/useWatchParty';
import { useToast } from '../../context/toastContext';
import Button from '../../components/Button/Button';
import JoinCode from '../../components/party/JoinCode/JoinCode';
import Modal from '../../components/ui/Modal/Modal';
import CurtainScene from '../../components/cinema/CurtainScene';

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
  }, [id, navigate, toast]);

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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-[15px] text-muted">Loading lobby...</div>;
  }
  if (loadFailed) {
    return <div className="flex items-center justify-center min-h-screen text-[15px] text-dislike">Lobby unavailable.</div>;
  }

  const activeMembers = party?.members?.filter((member) => member.isActive) ?? [];
  const isHost = party?.hostUsername === user?.username;

  return (
    <div className="relative min-h-screen bg-bg overflow-hidden">
      <CurtainScene variant="backdrop" className="z-0" />

      <header className="relative z-[2] flex items-center justify-between gap-5 px-6 py-5 border-b border-border bg-[rgba(26,27,37,0.9)] backdrop-blur-[10px] max-[560px]:flex-col max-[560px]:items-start">
        <div>
          <span className="block mb-1 text-[13px] font-bold text-accent">CineMatch</span>
          <h1 className="text-2xl font-bold">WatchParty lobby</h1>
        </div>
        <Button variant="secondary" onClick={onLeaveClick} disabled={leaveLoading}>
          Leave party
        </Button>
      </header>

      <main className="relative z-[2] w-[min(760px,100%)] mx-auto px-6 py-10 flex flex-col gap-6">
        <section className="flex flex-col items-center gap-2 p-7 border border-border rounded-md bg-[rgba(26,27,37,0.88)] backdrop-blur-[10px]" aria-label="Join code">
          <span className="text-[12px] text-muted uppercase tracking-[0.08em]">Join code</span>
          <JoinCode
            code={party?.joinCode}
            codeClassName="text-[42px] leading-none tracking-[8px] max-[560px]:text-[34px] max-[560px]:tracking-[5px]"
          />
        </section>

        <section className="p-6 border border-border rounded-md bg-[rgba(26,27,37,0.88)] backdrop-blur-[10px]">
          <div className="flex items-start justify-between gap-4 mb-5 max-[560px]:flex-col">
            <div>
              <h2 className="text-xl font-bold">Active participants</h2>
              <p className="text-[14px] text-muted">{activeMembers.length} ready to swipe</p>
            </div>
            {refreshing && <span className="text-[14px] text-muted">Updating...</span>}
          </div>

          <ul className="flex flex-col gap-3 p-0 m-0 list-none">
            {activeMembers.map((member) => (
              <li className="flex items-center gap-3 p-3 rounded-md bg-surface-2" key={member.userId}>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent text-white text-[15px] font-bold">
                  {member.username.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 min-w-0 break-words font-semibold">{member.username}</span>
                {member.username === party?.hostUsername && (
                  <span className="py-1 px-2.5 rounded-sm bg-[rgba(170,59,255,0.14)] text-accent text-[12px] font-bold uppercase tracking-[0.06em]">
                    Host
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex justify-center p-6 border border-border rounded-md bg-[rgba(26,27,37,0.88)] backdrop-blur-[10px]">
          {isHost ? (
            <Button onClick={handleStartSession} disabled={starting}>
              {starting ? 'Starting...' : 'Start session'}
            </Button>
          ) : (
            <p className="text-muted text-center">Waiting for the host to start...</p>
          )}
        </section>
      </main>

      <Modal
        isOpen={confirmLeaveOpen}
        onClose={() => setConfirmLeaveOpen(false)}
        title="Leave party?"
      >
        <p className="modal-body">
          If you leave as host, the party will end for all participants.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirmLeaveOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => { setConfirmLeaveOpen(false); handleLeave(id); }}
            disabled={leaveLoading}
          >
            Leave anyway
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Lobby;
