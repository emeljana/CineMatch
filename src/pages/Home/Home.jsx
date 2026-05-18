import { useState } from 'react';
import { useUser } from '../../context/userContext';
import { useAuth } from '../../hooks/useAuth';
import { useWatchParty } from '../../hooks/useWatchParty';
import Button from '../../components/Button/Button';
import './Home.css';

const JOIN_CODE_LENGTH = 6;

function Home() {
  const { user } = useUser();
  const { handleLogout } = useAuth();
  const { handleCreate, handleJoin, loading, error, setError } = useWatchParty();
  const [joinCode, setJoinCode] = useState('');

  async function handleJoinSubmit(e) {
    e.preventDefault();
    await handleJoin(joinCode.toUpperCase());
  }

  function handleJoinCodeChange(e) {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= JOIN_CODE_LENGTH) {
      setJoinCode(value);
      setError(null);
    }
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <span className="home-logo">CineMatch</span>
        <div className="home-header-right">
          <span className="home-username">{user?.username}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="home-main">
        <h1 className="home-heading">Movie night starts here</h1>
        <p className="home-subheading">Create a party or join one with a code.</p>

        {error && <p className="home-error">{error}</p>}

        <div className="home-cards">
          <div className="home-card">
            <h2>Create a party</h2>
            <p>Start a new WatchParty and invite your friends with a join code.</p>
            <Button onClick={handleCreate} disabled={loading} fullWidth>
              {loading ? 'Creating...' : 'Create WatchParty'}
            </Button>
          </div>

          <div className="home-card-divider">or</div>

          <div className="home-card">
            <h2>Join a party</h2>
            <p>Enter the 6-character code from the host to join their party.</p>
            <form onSubmit={handleJoinSubmit} className="home-join-form">
              <input
                type="text"
                value={joinCode}
                onChange={handleJoinCodeChange}
                placeholder="ABC123"
                maxLength={JOIN_CODE_LENGTH}
                disabled={loading}
                className="home-join-input"
                aria-label="Join code"
              />
              <Button
                type="submit"
                disabled={loading || joinCode.length !== JOIN_CODE_LENGTH}
                fullWidth
              >
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
