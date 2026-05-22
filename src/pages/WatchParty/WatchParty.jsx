import { useRef, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWatchParty } from '../../services/watchPartyService';
import { getQueue, swipe } from '../../services/swipeService';
import { getMatches, markWatched } from '../../services/matchService';
import { useWatchParty } from '../../hooks/useWatchParty';
import { useToast } from '../../context/toastContext';
import { useUser } from '../../context/userContext';
import { parseError, getErrorCode } from '../../helpers/errorHelpers';
import MovieCard from '../../components/MovieCard/MovieCard';
import Button from '../../components/Button/Button';
import JoinCode from '../../components/party/JoinCode/JoinCode';
import Modal from '../../components/ui/Modal/Modal';
import CurtainScene from '../../components/cinema/CurtainScene';
import './WatchParty.css';

const QUEUE_REFILL_THRESHOLD = 2;
const QUEUE_BATCH_SIZE = 10;
const MATCH_POLL_INTERVAL_MS = 1000;
const swipeSessionKey = (id) => `cinematch_swipe_${id}`;

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
  const curtainsOpen = true;

  useEffect(() => {
    async function init() {
      try {
        const saved = sessionStorage.getItem(swipeSessionKey(id));
        const savedState = saved ? JSON.parse(saved) : null;

        const [partyRes, matchesRes] = await Promise.all([
          getWatchParty(id),
          getMatches(id),
        ]);
        setParty(partyRes.data);
        setMatchCount(matchesRes.data.length);

        if (savedState) {
          setQueue(savedState.queue);
          setCurrentIndex(savedState.currentIndex);
        } else {
          const queueRes = await getQueue(id, QUEUE_BATCH_SIZE);
          setQueue(queueRes.data);
          setHasMoreMovies(queueRes.data.length > 0);
        }
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

  useEffect(() => {
    if (loading || queue.length === 0) return;
    sessionStorage.setItem(swipeSessionKey(id), JSON.stringify({ queue, currentIndex, curtainsOpen }));
  }, [id, loading, queue, currentIndex, curtainsOpen]);

  useEffect(() => {
    if (loading || match) return;

    const intervalId = window.setInterval(async () => {
      try {
        const { data: matches } = await getMatches(id);
        if (matches.length <= matchCount) return;

        setMatchCount(matches.length);
        const latestMatch = matches[0];
        const movieInQueue = queue.find((m) => m.id === latestMatch.movieId);
        if (!movieInQueue) return;

        setMatch({
          ...movieInQueue,
          matchId: latestMatch.id,
          isWatched: latestMatch.isWatched,
        });
      } catch {
        // ignore transient poll errors
      }
    }, MATCH_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [id, loading, match, matchCount, queue]);

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
      sessionStorage.removeItem(swipeSessionKey(id));
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
      const code = getErrorCode(err);
      if (code === 'Match.AlreadyWatched') {
        setMatch((prev) => ({ ...prev, isWatched: true }));
      }
      toast.error(parseError(err, 'Could not mark the movie as watched.'));
    } finally {
      setMarkingWatched(false);
    }
  }

  if (loadFailed) {
    return <div className="flex items-center justify-center min-h-screen text-[15px] text-dislike">WatchParty unavailable.</div>;
  }

  const currentMovie = queue[currentIndex];
  const queueExhausted = !loading && currentIndex >= queue.length;
  const activeMembers = party?.members?.filter((m) => m.isActive) ?? [];

  return (
    <div className="relative flex flex-col h-dvh overflow-hidden bg-bg">
      <CurtainScene
        isOpen={curtainsOpen}
        variant="backdrop"
        className="z-0"
      />
      <header className="relative z-[2] flex items-center justify-between px-6 py-4 border-b border-border bg-[rgba(26,27,37,0.9)] backdrop-blur-[10px] max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3 max-[640px]:px-4 max-[640px]:py-3.5">
        <div className="flex items-center gap-4 max-[640px]:flex-wrap max-[640px]:gap-x-3 max-[640px]:gap-y-2">
          <span className="text-[12px] text-muted uppercase tracking-[0.08em]">Join code</span>
          <JoinCode
            code={party?.joinCode}
            codeClassName="text-[18px] tracking-[3px]"
          />
          <div className="flex gap-1.5" aria-label={`${activeMembers.length} active members`}>
            {activeMembers.map((m) => (
              <span
                key={m.userId}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-[11px] font-bold tracking-[0.05em] cursor-default select-none"
                title={m.username}
              >
                {m.username.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 max-[640px]:w-full">
          <Link
            className="inline-flex items-center justify-center px-[18px] py-2.5 border border-accent rounded-md bg-[rgba(170,59,255,0.12)] text-accent text-[15px] font-bold leading-none no-underline whitespace-nowrap hover:bg-[rgba(170,59,255,0.2)] transition-[background] duration-150 max-[640px]:flex-1"
            to={`/watchparty/${id}/matches`}
          >
            {matchCount} match{matchCount === 1 ? '' : 'es'}
          </Link>
          <Button
            variant="secondary"
            onClick={onLeaveClick}
            disabled={leaveLoading}
            className="max-[640px]:flex-1"
          >
            Leave party
          </Button>
        </div>
      </header>

      <main className="watchparty-main relative z-[2] min-h-0 flex-1 flex flex-col items-center justify-center px-6 py-4 gap-3 min-[641px]:absolute min-[641px]:top-[clamp(16px,2vh,42px)] min-[641px]:left-1/2 min-[641px]:-translate-x-1/2 min-[641px]:w-[min(300px,24vw)] min-[641px]:p-0 max-[640px]:justify-start max-[640px]:px-4 max-[640px]:pt-3.5 max-[640px]:pb-28">
        {loading ? (
          <div aria-busy="true" />
        ) : queueExhausted ? (
          <div className="text-center text-muted flex flex-col gap-2">
            <p>No more movies in the queue.</p>
            <p className="text-[14px]">Wait for new movies or check your matches.</p>
          </div>
        ) : !currentMovie ? (
          <div className="text-center text-muted flex flex-col gap-2">
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
            <p
              className="text-[13px] text-muted tracking-[0.04em] min-[641px]:[text-shadow:0_2px_10px_rgba(0,0,0,0.9)]"
              aria-live="polite"
            >
              Movie {currentIndex + 1} of {queue.length}
            </p>
            <div className="watchparty-actions flex gap-6 max-[640px]:fixed max-[640px]:right-4 max-[640px]:bottom-[calc(16px+env(safe-area-inset-bottom))] max-[640px]:left-4 max-[640px]:z-[20] max-[640px]:gap-3 max-[640px]:p-3 max-[640px]:border max-[640px]:border-border max-[640px]:rounded-[16px] max-[640px]:bg-[rgba(26,27,37,0.96)] max-[640px]:shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
              <Button
                variant="dislike"
                onClick={() => triggerSwipeAnimation('dislike')}
                disabled={swiping || cardAnimating}
                className="max-[640px]:flex-1 max-[640px]:min-w-0"
              >
                Pass
              </Button>
              <Button
                variant="like"
                onClick={() => triggerSwipeAnimation('like')}
                disabled={swiping || cardAnimating}
                className="max-[640px]:flex-1 max-[640px]:min-w-0"
              >
                Like
              </Button>
            </div>
            {swipeError && (
              <button
                className="bg-transparent border-none text-muted text-[13px] cursor-pointer px-2 py-1 underline underline-offset-[3px] hover:text-foreground max-[640px]:fixed max-[640px]:right-4 max-[640px]:bottom-[calc(88px+env(safe-area-inset-bottom))] max-[640px]:left-4 max-[640px]:z-[21] max-[640px]:py-2 max-[640px]:bg-[rgba(13,14,20,0.9)]"
                onClick={skipCurrentMovie}
              >
                Skip this movie
              </button>
            )}
          </>
        )}
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
            onClick={() => { setConfirmLeaveOpen(false); sessionStorage.removeItem(swipeSessionKey(id)); handleLeave(id); }}
            disabled={leaveLoading}
          >
            Leave anyway
          </Button>
        </div>
      </Modal>

      {match && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center p-5 z-[100] overflow-y-auto max-[640px]:items-start"
          onClick={dismissMatch}
        >
          <div
            className="bg-surface border border-accent rounded-[16px] p-6 max-w-[680px] max-h-[calc(100dvh-40px)] w-full grid grid-cols-[minmax(180px,240px)_1fr] gap-6 overflow-y-auto shadow-[0_0_40px_rgba(170,59,255,0.3)] max-[640px]:grid-cols-1 max-[640px]:max-w-[380px] max-[640px]:p-5 max-[640px]:gap-[18px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 max-[640px]:max-w-[220px] max-[640px]:w-full max-[640px]:mx-auto">
              {match.posterUrl ? (
                <img
                  src={match.posterUrl}
                  alt={match.title}
                  className="w-full rounded-md aspect-[2/3] object-cover block"
                />
              ) : (
                <div className="w-full rounded-md aspect-[2/3] bg-surface-2" />
              )}
            </div>
            <div className="min-w-0 max-[640px]:text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-accent mb-2">It's a match!</p>
              <h2 className="text-[28px] font-bold leading-[1.15] max-[640px]:text-[23px]">{match.title}</h2>
              {match.releaseYear && (
                <p className="mt-2 text-[14px] text-muted">{match.releaseYear}</p>
              )}
              {match.overview && (
                <p className="mt-4 text-[15px] leading-[1.6] text-muted max-[640px]:text-left">{match.overview}</p>
              )}
            </div>
            {match.matchId && (
              match.isWatched ? (
                <p className="col-span-full text-center text-[14px] font-semibold text-like">✓ Marked as watched</p>
              ) : (
                <Button
                  variant="secondary"
                  onClick={handleMarkWatched}
                  disabled={markingWatched}
                  fullWidth
                  className="col-span-full"
                >
                  {markingWatched ? 'Saving...' : 'Mark as watched'}
                </Button>
              )
            )}
            <Button onClick={dismissMatch} fullWidth className="col-span-full">
              Keep swiping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchParty;
