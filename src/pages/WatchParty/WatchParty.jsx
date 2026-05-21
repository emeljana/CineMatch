import { useRef, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWatchParty } from '../../services/watchPartyService';
import { getQueue, swipe } from '../../services/swipeService';
import { getMatches, markWatched } from '../../services/matchService';
import { useWatchParty } from '../../hooks/useWatchParty';
import { useToast } from '../../context/toastContext';
import { useUser } from '../../context/userContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import Button from '../../components/Button/Button';
import JoinCode from '../../components/party/JoinCode/JoinCode';
import Modal from '../../components/ui/Modal/Modal';
import './WatchParty.css';

const QUEUE_REFILL_THRESHOLD = 2;
const QUEUE_BATCH_SIZE = 10;

function WatchParty() {
  const { id } = useParams();
  const { handleLeave, loading: leaveLoading } = useWatchParty();
  const toast = useToast();
  const { user } = useUser();

  const movieCardRef = useRef(null);

  const [party, setParty] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [markingWatched, setMarkingWatched] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [swipeError, setSwipeError] = useState(false);
  const [cardAnimating, setCardAnimating] = useState(false);
  const [queueRefilling, setQueueRefilling] = useState(false);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    async function init() {
      try {
        const [partyRes, queueRes, matchesRes] = await Promise.all([
          getWatchParty(id),
          getQueue(id, QUEUE_BATCH_SIZE),
          getMatches(id),
        ]);
        setParty(partyRes.data);
        setQueue(queueRes.data);
        setHasMoreMovies(queueRes.data.length > 0);
        setMatchCount(matchesRes.data.length);
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
    setSwipeError(false);
    try {
      const { data } = await swipe(id, currentMovie.id, isLiked);
      if (data.isMatch) {
        setMatchCount((currentCount) => currentCount + 1);
        try {
          const { data: matches } = await getMatches(id);
          const matchRecord = matches.find((m) => m.movieId === data.matchedMovie.id);
          setMatch({
            ...data.matchedMovie,
            matchId: matchRecord?.id ?? null,
            isWatched: matchRecord?.isWatched ?? false,
          });
        } catch {
          setMatch({ ...data.matchedMovie, matchId: null, isWatched: false });
        }
      }
      setCurrentIndex((prev) => prev + 1);
    } catch {
      toast.error('Could not save your swipe. Try again or skip the movie.');
      setSwipeError(true);
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

  function skipCurrentMovie() {
    setSwipeError(false);
    setCurrentIndex((prev) => prev + 1);
  }

  function onLeaveClick() {
    if (party?.hostUsername === user?.username) {
      setConfirmLeaveOpen(true);
    } else {
      handleLeave(id);
    }
  }

  function dismissMatch() {
    setMatch(null);
  }

  async function handleMarkWatched() {
    if (!match?.matchId) return;
    setMarkingWatched(true);
    try {
      await markWatched(match.matchId);
      setMatch((prev) => ({ ...prev, isWatched: true }));
    } catch (err) {
      const errors = err.response?.data;
      const code = Array.isArray(errors) ? errors[0]?.code : null;
      if (code === 'Match.AlreadyWatched') {
        setMatch((prev) => ({ ...prev, isWatched: true }));
      }
      toast.error(
        Array.isArray(errors) && errors[0]?.description
          ? errors[0].description
          : 'Kunde inte markera filmen som sedd.'
      );
    } finally {
      setMarkingWatched(false);
    }
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
          <JoinCode code={party?.joinCode} />
          <div className="member-avatars" aria-label={`${activeMembers.length} active members`}>
            {activeMembers.map((m) => (
              <span key={m.userId} className="member-avatar" title={m.username}>
                {m.username.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="watchparty-header-actions">
          <Link className="watchparty-match-badge" to={`/watchparty/${id}/matches`}>
            {matchCount} match{matchCount === 1 ? '' : 'es'}
          </Link>
          <Button
            variant="secondary"
            onClick={() => handleLeave(id)}
            disabled={leaveLoading}
          >
            Leave party
          </Button>
        </div>
      </header>

      <main className="watchparty-main">
        {loading ? (
          <div className="watchparty-loading" aria-busy="true" />
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
            <MovieCard
              key={currentMovie.id}
              ref={movieCardRef}
              movie={currentMovie}
              onSwipe={handleSwipe}
              onSwipeStart={handleSwipeStart}
            />
            <p className="swipe-progress" aria-live="polite">
              Movie {currentIndex + 1} of {queue.length}
            </p>
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
            {swipeError && (
              <button className="skip-link" onClick={skipCurrentMovie}>
                Skip this movie
              </button>
            )}
          </>
        )}
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
            {match.matchId && (
              match.isWatched ? (
                <p className="match-watched-label">✓ Markerad som sedd</p>
              ) : (
                <Button
                  variant="secondary"
                  onClick={handleMarkWatched}
                  disabled={markingWatched}
                  fullWidth
                >
                  {markingWatched ? 'Sparar...' : 'Markera som sedd'}
                </Button>
              )
            )}
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
