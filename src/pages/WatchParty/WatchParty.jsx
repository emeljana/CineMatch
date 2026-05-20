import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getWatchParty } from '../../services/watchPartyService';
import { getQueue, swipe } from '../../services/swipeService';
import { useWatchParty } from '../../hooks/useWatchParty';
import { useToast } from '../../context/toastContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import Button from '../../components/Button/Button';
import './WatchParty.css';

const QUEUE_REFILL_THRESHOLD = 2;
const QUEUE_BATCH_SIZE = 10;

function WatchParty() {
  const { id } = useParams();
  const { handleLeave, loading: leaveLoading } = useWatchParty();
  const toast = useToast();

  const [party, setParty] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [queueRefilling, setQueueRefilling] = useState(false);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [partyRes, queueRes] = await Promise.all([
          getWatchParty(id),
          getQueue(id, QUEUE_BATCH_SIZE),
        ]);
        setParty(partyRes.data);
        setQueue(queueRes.data);
        setHasMoreMovies(queueRes.data.length > 0);
      } catch {
        setLoadFailed(true);
        toast.error('Could not load the party. It may no longer exist.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, toast]);

  useEffect(() => {
    const remainingMovies = queue.length - currentIndex;
    const shouldRefillQueue =
      !loading &&
      !queueRefilling &&
      hasMoreMovies &&
      remainingMovies <= QUEUE_REFILL_THRESHOLD;

    if (!shouldRefillQueue) return;

    async function refillQueue() {
      setQueueRefilling(true);
      try {
        const { data } = await getQueue(id, QUEUE_BATCH_SIZE);
        if (data.length === 0) {
          setHasMoreMovies(false);
          return;
        }

        const queuedMovieIds = new Set(queue.map((movie) => movie.id));
        const newMovies = data.filter((movie) => !queuedMovieIds.has(movie.id));

        if (newMovies.length === 0) {
          setHasMoreMovies(false);
          return;
        }

        setQueue((currentQueue) => [...currentQueue, ...newMovies]);
      } catch {
        setHasMoreMovies(false);
      } finally {
        setQueueRefilling(false);
      }
    }

    refillQueue();
  }, [currentIndex, hasMoreMovies, id, loading, queue, queueRefilling]);

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
      toast.error('Could not save your swipe.');
      setCurrentIndex((prev) => prev + 1);
    } finally {
      setSwiping(false);
    }
  }

  function dismissMatch() {
    setMatch(null);
  }

  if (loadFailed) {
    return <div className="watchparty-status watchparty-status--error">WatchParty unavailable.</div>;
  }

  const currentMovie = queue[currentIndex];
  const queueExhausted = !loading && currentIndex >= queue.length;
  const activeMembers = party?.members?.filter((m) => m.isActive) ?? [];

  return (
    <div className="watchparty-page">
      <header className="watchparty-header">
        <div className="watchparty-meta">
          <span className="watchparty-code-label">Join code</span>
          <span className="watchparty-code">{party?.joinCode}</span>
          <div className="member-avatars" aria-label={`${activeMembers.length} active members`}>
            {activeMembers.map((m) => (
              <span key={m.userId} className="member-avatar" title={m.username}>
                {m.username.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
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
        {loading ? (
          <MovieCard loading />
        ) : queueExhausted ? (
          <div className="watchparty-empty">
            <p>No more movies in the queue.</p>
            <p className="watchparty-empty-sub">
              Wait for new movies or check your matches.
            </p>
          </div>
        ) : !currentMovie ? (
          <div className="watchparty-empty">
            <p>Loading more movies...</p>
          </div>
        ) : (
          <>
            <p className="swipe-progress" aria-live="polite">
              Movie {currentIndex + 1} of {queue.length}
            </p>
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
