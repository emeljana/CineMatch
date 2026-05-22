import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { getMatches, markWatched } from '../../services/matchService';
import { useToast } from '../../context/toastContext';

const MATCH_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function getMatchMovie(match) {
  return {
    title: match.movieTitle,
    posterUrl: match.moviePosterUrl,
    releaseYear: match.movieReleaseYear,
    overview: match.movieOverview,
  };
}

function formatMatchTime(value) {
  if (!value) return 'Unknown time';
  return MATCH_TIME_FORMATTER.format(new Date(value));
}

function MatchHistory() {
  const { id } = useParams();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [updatingMatchId, setUpdatingMatchId] = useState(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const { data } = await getMatches(id);
        setMatches(data);
      } catch {
        setLoadFailed(true);
        toast.error('Could not load match history.');
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [id, toast]);

  async function handleMarkWatched(matchId) {
    setUpdatingMatchId(matchId);
    try {
      const { data } = await markWatched(matchId);
      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match.id === matchId ? { ...match, ...data } : match,
        ),
      );
      toast.success('Movie marked as watched.');
    } catch {
      toast.error('Could not mark the movie as watched.');
    } finally {
      setUpdatingMatchId(null);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-[15px] text-muted">Loading matches...</div>;
  }
  if (loadFailed) {
    return <div className="flex items-center justify-center min-h-screen text-[15px] text-dislike">Match history unavailable.</div>;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between gap-5 px-6 py-5 border-b border-border bg-surface max-[680px]:flex-col max-[680px]:items-start">
        <div>
          <span className="block mb-1 text-[12px] font-bold text-accent uppercase tracking-[0.08em]">WatchParty</span>
          <h1 className="text-[26px] leading-[1.15]">Match history</h1>
        </div>
        <Link
          className="inline-flex items-center justify-center px-[18px] py-2.5 border border-border rounded-md text-muted text-[15px] font-medium no-underline whitespace-nowrap hover:border-muted hover:text-foreground transition-[border-color,color] duration-150 max-[680px]:w-full"
          to={`/watchparty/${id}`}
        >
          Back to swiping
        </Link>
      </header>

      <main className="w-[min(920px,100%)] mx-auto px-6 py-8">
        {matches.length === 0 ? (
          <div className="flex flex-col gap-2 p-8 border border-border rounded-md bg-surface text-center text-muted">
            <p>No matches yet.</p>
            <p>Keep swiping until everyone likes the same movie.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4 p-0 m-0 list-none">
            {matches.map((match) => {
              const movie = getMatchMovie(match);
              const title = movie.title ?? `Movie ${match.movieId?.slice(0, 8)}`;
              return (
                <li
                  className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-[18px] p-4 border border-border rounded-md bg-surface max-[680px]:grid-cols-[72px_minmax(0,1fr)]"
                  key={match.id}
                >
                  <div className="w-[88px] max-[680px]:w-[72px]">
                    {movie.posterUrl ? (
                      <img
                        className="block w-full aspect-[2/3] rounded-sm object-cover"
                        src={movie.posterUrl}
                        alt={title}
                      />
                    ) : (
                      <div className="block w-full aspect-[2/3] rounded-sm bg-surface-2" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start gap-3 justify-between max-[680px]:flex-col">
                      <h2 className="min-w-0 text-xl leading-[1.25] break-words">{title}</h2>
                      <span
                        className={`shrink-0 py-1 px-2.5 rounded-sm text-[12px] font-bold uppercase tracking-[0.06em] ${
                          match.isWatched
                            ? 'bg-[rgba(34,197,94,0.14)] text-like'
                            : 'bg-[rgba(139,139,168,0.16)] text-muted'
                        }`}
                      >
                        {match.isWatched ? 'Watched' : 'Unwatched'}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] text-muted">Matched {formatMatchTime(match.matchedAt)}</p>
                    {match.isWatched && match.watchedAt && (
                      <p className="mt-2 text-[14px] text-muted">Watched {formatMatchTime(match.watchedAt)}</p>
                    )}
                  </div>
                  {!match.isWatched && (
                    <div className="max-[680px]:col-span-full">
                      <Button
                        variant="secondary"
                        onClick={() => handleMarkWatched(match.id)}
                        disabled={updatingMatchId === match.id}
                        fullWidth
                      >
                        {updatingMatchId === match.id ? 'Saving...' : 'Mark watched'}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

export default MatchHistory;
