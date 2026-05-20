import { useRef, useState, useEffect } from 'react';
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
  const movieCardRef = useRef(null);

  const [party, setParty] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiping, setSwiping] = useState(false);
  const [cardAnimating, setCardAnimating] = useState(false);

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
      setCardAnimating(false);
    }
  }

  function handleSwipeStart() {
    setCardAnimating(true);
  }

  function triggerSwipeAnimation(direction) {
    const currentMovie = queue[currentIndex];
    if (!currentMovie || swiping || cardAnimating) return;

    movieCardRef.current?.swipe(direction);
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
            <MovieCard
              key={currentMovie.id}
              ref={movieCardRef}
              movie={currentMovie}
              onSwipe={handleSwipe}
              onSwipeStart={handleSwipeStart}
            />
            <div className="watchparty-actions">
              <Button
                variant="dislike"
                onClick={() => triggerSwipeAnimation('dislike')}
                disabled={swiping || cardAnimating}
              >
                Pass
              </Button>
              <Button
                variant="like"
                onClick={() => triggerSwipeAnimation('like')}
                disabled={swiping || cardAnimating}
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
            <p className="match-label">It's a match!</p>
            <h2 className="match-title">{match.title}</h2>
            {match.posterUrl && (
              <img
                src={match.posterUrl}
                alt={match.title}
                className="match-poster"
              />
            )}
            <Button onClick={dismissMatch} fullWidth>
              Continue swiping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchParty;
