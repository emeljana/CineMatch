import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { useWatchParty } from '../../hooks/useWatchParty';
import AppHeader from '../../components/layout/AppHeader/AppHeader';
import Button from '../../components/Button/Button';
import CurtainScene from '../../components/cinema/CurtainScene';

const JOIN_CODE_LENGTH = 6;
const ROLE_ADMIN = 1;

function Home() {
  const { user } = useUser();
  const { handleCreate, handleJoin, loading } = useWatchParty();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [joinCodeError, setJoinCodeError] = useState(null);

  async function handleCreateParty() {
    const data = await handleCreate({ navigateOnSuccess: false });
    if (!data) return;
    navigate(`/watchparty/${data.id}/lobby`);
  }

  async function handleJoinSubmit(e) {
    e.preventDefault();
    if (joinCode.length !== JOIN_CODE_LENGTH) {
      setJoinCodeError('Enter a 6-character join code.');
      return;
    }

    const data = await handleJoin(joinCode.toUpperCase(), { navigateOnSuccess: false });
    if (!data) return;
    navigate(`/watchparty/${data.id}/lobby`);
  }

  function handleJoinCodeChange(e) {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= JOIN_CODE_LENGTH) {
      setJoinCode(value);
      setJoinCodeError(null);
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-bg overflow-hidden">
      <CurtainScene variant="backdrop" className="z-0" />
      <AppHeader
        className="relative z-[2] backdrop-blur-[10px] bg-[rgba(26,27,37,0.9)]"
        action={user?.role === ROLE_ADMIN && (
          <Button variant="secondary" onClick={() => navigate('/admin')}>
            Admin panel
          </Button>
        )}
      />

      <main className="relative z-[2] flex-1 flex flex-col items-center justify-center px-6 py-12 max-[600px]:justify-start max-[600px]:py-8 max-[600px]:px-4">
        <h1 className="text-[36px] font-bold text-center mb-3 max-[600px]:text-[30px]">Movie night starts here</h1>
        <p className="text-[16px] text-muted text-center mb-10">Create a party or join one with a code.</p>

        <div className="flex items-center gap-6 max-w-[720px] w-full flex-wrap justify-center max-[600px]:flex-col max-[600px]:flex-nowrap max-[600px]:gap-4">
          <div className="flex-1 min-w-[260px] max-w-[320px] flex flex-col gap-3 border border-border rounded-[16px] p-8 bg-[rgba(26,27,37,0.86)] backdrop-blur-[10px] max-[600px]:min-w-0 max-[600px]:max-w-full max-[600px]:w-full max-[600px]:p-6">
            <h2 className="text-[18px] font-semibold">Create a party</h2>
            <p className="text-[14px] text-muted leading-[1.6]">Start a new WatchParty and invite your friends with a join code.</p>
            <Button onClick={handleCreateParty} disabled={loading} fullWidth>
              {loading ? 'Creating...' : 'Create WatchParty'}
            </Button>
          </div>

          <div className="text-[14px] text-muted shrink-0 max-[600px]:leading-none">or</div>

          <div className="flex-1 min-w-[260px] max-w-[320px] flex flex-col gap-3 border border-border rounded-[16px] p-8 bg-[rgba(26,27,37,0.86)] backdrop-blur-[10px] max-[600px]:min-w-0 max-[600px]:max-w-full max-[600px]:w-full max-[600px]:p-6">
            <h2 className="text-[18px] font-semibold">Join a party</h2>
            <p className="text-[14px] text-muted leading-[1.6]">Enter the 6-character code from the host to join their party.</p>
            <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={handleJoinCodeChange}
                placeholder="ABC123"
                maxLength={JOIN_CODE_LENGTH}
                disabled={loading}
                className="py-2.5 px-3.5 bg-surface-2 border border-border rounded-md text-foreground text-[18px] font-semibold tracking-[4px] text-center outline-none transition-[border-color] duration-150 focus:border-accent disabled:opacity-60"
                aria-label="Join code"
                aria-invalid={Boolean(joinCodeError)}
                aria-describedby={joinCodeError ? 'join-code-error' : undefined}
              />
              {joinCodeError && (
                <p id="join-code-error" className="text-[14px] text-dislike bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-sm px-3.5 py-2.5 text-center">
                  {joinCodeError}
                </p>
              )}
              <Button type="submit" disabled={loading} fullWidth>
                {loading ? 'Joining...' : 'Join WatchParty'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
