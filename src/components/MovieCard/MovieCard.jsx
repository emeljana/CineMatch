import './MovieCard.css';

function MovieCard({ movie, loading = false }) {
  if (loading) {
    return (
      <div className="movie-card" aria-busy="true" aria-label="Loading movie">
        <div className="movie-card-poster movie-card-skeleton" />
        <div className="movie-card-info">
          <div className="movie-card-skeleton movie-card-skeleton--title" />
          <div className="movie-card-skeleton movie-card-skeleton--year" />
          <div className="movie-card-skeleton movie-card-skeleton--line" />
          <div className="movie-card-skeleton movie-card-skeleton--line" />
          <div className="movie-card-skeleton movie-card-skeleton--line-short" />
        </div>
      </div>
    );
  }

  return (
    <div className="movie-card">
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-card-poster"
        />
      ) : (
        <div className="movie-card-poster-placeholder" />
      )}
      <div className="movie-card-info">
        <h2 className="movie-card-title">{movie.title}</h2>
        {movie.releaseYear && (
          <span className="movie-card-year">{movie.releaseYear}</span>
        )}
        {movie.overview && (
          <p className="movie-card-overview">{movie.overview}</p>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
