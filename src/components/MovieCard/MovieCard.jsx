import './MovieCard.css';

function MovieCard({ movie }) {
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
