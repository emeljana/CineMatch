import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { getMatches, markWatched } from '../../services/matchService';
import { useToast } from '../../context/toastContext';
import './MatchHistory.css';

const MATCH_TIME_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// --- TODO --- Align these fallbacks with the final backend match DTO field names.
function getMatchMovie(match) {
  return {
    title: match.title ?? match.movieTitle ?? match.movie?.title ?? match.matchedMovie?.title,
    posterUrl: match.posterUrl ?? match.moviePosterUrl ?? match.movie?.posterUrl ?? match.matchedMovie?.posterUrl,
    releaseYear: match.releaseYear ?? match.movieReleaseYear ?? match.movie?.releaseYear ?? match.matchedMovie?.releaseYear,
    overview: match.overview ?? match.movieOverview ?? match.movie?.overview ?? match.matchedMovie?.overview,
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

  if (loading) return <div className="match-history-status">Loading matches...</div>;
  if (loadFailed) {
    return <div className="match-history-status match-history-status--error">Match history unavailable.</div>;
  }

  return (
    <div className="match-history-page">
      <header className="match-history-header">
        <div>
          <span className="match-history-eyebrow">WatchParty</span>
          <h1>Match history</h1>
        </div>
        <Link className="match-history-back" to={`/watchparty/${id}`}>
          Back to swiping
        </Link>
      </header>

      <main className="match-history-main">
        {matches.length === 0 ? (
          <div className="match-history-empty">
            <p>No matches yet.</p>
            <p>Keep swiping until everyone likes the same movie.</p>
          </div>
        ) : (
          <ul className="match-history-list">
            {matches.map((match) => {
              const movie = getMatchMovie(match);
              const title = movie.title ?? `Movie ${match.movieId?.slice(0, 8)}`;

              return (
                <li className="match-history-item" key={match.id}>
                  <div className="match-history-poster-frame">
                    {movie.posterUrl ? (
                      <img className="match-history-poster" src={movie.posterUrl} alt={title} />
                    ) : (
                      <div className="match-history-poster-placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <div className="match-history-details">
                    <div className="match-history-title-row">
                      <h2>{title}</h2>
                      <span className={`match-history-badge${match.isWatched ? ' match-history-badge--watched' : ''}`}>
                        {match.isWatched ? 'Watched' : 'Unwatched'}
                      </span>
                    </div>
                    <p className="match-history-time">
                      Matched {formatMatchTime(match.matchedAt)}
                    </p>
                    {match.isWatched && match.watchedAt && (
                      <p className="match-history-watched-time">
                        Watched {formatMatchTime(match.watchedAt)}
                      </p>
                    )}
                  </div>
                  {!match.isWatched && (
                    <Button
                      variant="secondary"
                      onClick={() => handleMarkWatched(match.id)}
                      disabled={updatingMatchId === match.id}
                    >
                      {updatingMatchId === match.id ? 'Saving...' : 'Mark watched'}
                    </Button>
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
