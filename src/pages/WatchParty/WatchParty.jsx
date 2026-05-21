import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getWatchParty } from '../../services/watchPartyService';
import { getQueue, swipe } from '../../services/swipeService';
import { useWatchParty } from '../../hooks/useWatchParty';
import MovieCard from '../../components/MovieCard/MovieCard';
import Button from '../../components/Button/Button';
import './WatchParty.css';

function WatchParty() {
  const { id } = useParams();
  const { handleLeave, loading: leaveLoading } = useWatchParty();

  const [party, setParty] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [partyRes, queueRes] = await Promise.all([
          getWatchParty(id),
          getQueue(id),
        ]);
        setParty(partyRes.data);
        setQueue(queueRes.data);
      } catch {
        setError('Could not load the party. It may no longer exist.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  async function handleSwipe(isLiked) {
    const currentMovie = queue[currentIndex];
    if (!currentMovie || swiping) return;

    setSwiping(true);
    try {
      const { data } = await swipe(id, currentMovie.id, isLiked);
      if (data.isMatch) {
        setMatch(data.matchedMovie);
      }
      setCurrentIndex((prev) => prev + 1);
    } catch {
      // skip and move on — the queue may have diverged
      setCurrentIndex((prev) => prev + 1);
    } finally {
      setSwiping(false);
    }
  }

  function dismissMatch() {
    setMatch(null);
  }

  if (loading) return <div className="watchparty-status">Loading...</div>;
  if (error) return <div className="watchparty-status watchparty-status--error">{error}</div>;

  const currentMovie = queue[currentIndex];
  const queueExhausted = currentIndex >= queue.length;
  const activeMembers = party?.members?.filter((m) => m.isActive) ?? [];

  return (
    <div className="watchparty-page">
      <header className="watchparty-header">
        <div className="watchparty-meta">
          <span className="watchparty-code-label">Join code</span>
          <span className="watchparty-code">{party?.joinCode}</span>
          <span className="watchparty-members">
            {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          variant="secondary"
          onClick={() => handleLeave(id)}
          disabled={leaveLoading}
        >
          Leave party
        </Button>
      </header>

      <main className="watchparty-main">
        {queueExhausted ? (
          <div className="watchparty-empty">
            <p>No more movies in the queue.</p>
            <p className="watchparty-empty-sub">
              Wait for new movies or check your matches.
            </p>
          </div>
        ) : (
          <>
            <MovieCard movie={currentMovie} />
            <div className="watchparty-actions">
              <Button
                variant="dislike"
                onClick={() => handleSwipe(false)}
                disabled={swiping}
              >
                Pass
              </Button>
              <Button
                variant="like"
                onClick={() => handleSwipe(true)}
                disabled={swiping}
              >
                Like
              </Button>
            </div>
          </>
        )}
      </main>

      {match && (
        <div className="match-overlay" onClick={dismissMatch}>
          <div className="match-card" onClick={(e) => e.stopPropagation()}>
            <div className="match-poster-frame">
              {match.posterUrl ? (
                <img
                  src={match.posterUrl}
                  alt={match.title}
                  className="match-poster"
                />
              ) : (
                <div className="match-poster-placeholder" />
              )}
            </div>
            <div className="match-details">
              <p className="match-label">Det är en match!</p>
              <h2 className="match-title">{match.title}</h2>
              {match.releaseYear && (
                <p className="match-year">{match.releaseYear}</p>
              )}
              {match.overview && (
                <p className="match-overview">{match.overview}</p>
              )}
            </div>
            <Button onClick={dismissMatch} fullWidth>
              Fortsätt svepa
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchParty;
