import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import './MovieCard.css';

const EXIT_DISTANCE_PX = 520;
const MAX_ROTATION_DEG = 14;
const OVERLAY_VISIBLE_AT_PX = 24;
const SWIPE_THRESHOLD_PX = 110;
const EXIT_ANIMATION_MS = 260;

const MovieCard = forwardRef(function MovieCard({ movie, onSwipe, onSwipeStart }, ref) {
  const cardRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [activeDirection, setActiveDirection] = useState(null);

  const updateCardPosition = useCallback((x, y) => {
    const card = cardRef.current;
    if (!card) return;

    const rotation = Math.max(
      -MAX_ROTATION_DEG,
      Math.min(MAX_ROTATION_DEG, x / 12),
    );
    const confidence = Math.min(Math.abs(x) / SWIPE_THRESHOLD_PX, 1);

    card.style.setProperty('--movie-card-x', `${x}px`);
    card.style.setProperty('--movie-card-y', `${y}px`);
    card.style.setProperty('--movie-card-rotation', `${rotation}deg`);
    card.style.setProperty('--movie-card-like-opacity', x > OVERLAY_VISIBLE_AT_PX ? confidence : 0);
    card.style.setProperty('--movie-card-dislike-opacity', x < -OVERLAY_VISIBLE_AT_PX ? confidence : 0);
  }, []);

  const resetCardPosition = useCallback(() => {
    updateCardPosition(0, 0);
    setActiveDirection(null);
    setIsDragging(false);
    setIsAnimatingOut(false);
  }, [updateCardPosition]);

  const animateOut = useCallback((direction) => {
    const x = direction === 'like' ? EXIT_DISTANCE_PX : -EXIT_DISTANCE_PX;
    const y = dragOffsetRef.current.y * 0.35;

    onSwipeStart(direction);
    setActiveDirection(direction);
    setIsDragging(false);
    setIsAnimatingOut(true);
    updateCardPosition(x, y);

    window.setTimeout(() => {
      onSwipe(direction === 'like');
      resetCardPosition();
    }, EXIT_ANIMATION_MS);
  }, [onSwipe, onSwipeStart, resetCardPosition, updateCardPosition]);

  useImperativeHandle(ref, () => ({
    swipe(direction) {
      if (isDragging || isAnimatingOut) return;
      animateOut(direction);
    },
  }), [animateOut, isDragging, isAnimatingOut]);

  function handlePointerDown(e) {
    if (isAnimatingOut) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { x: 0, y: 0 };
    setIsDragging(true);
  }

  function handlePointerMove(e) {
    if (!isDragging || isAnimatingOut) return;

    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    dragOffsetRef.current = { x, y };
    setActiveDirection(x > OVERLAY_VISIBLE_AT_PX ? 'like' : x < -OVERLAY_VISIBLE_AT_PX ? 'dislike' : null);
    updateCardPosition(x, y);
  }

  function handlePointerEnd(e) {
    if (!isDragging || isAnimatingOut) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const { x } = dragOffsetRef.current;
    if (Math.abs(x) >= SWIPE_THRESHOLD_PX) {
      animateOut(x > 0 ? 'like' : 'dislike');
      return;
    }

    resetCardPosition();
  }

  return (
    <div
      className={`movie-card${isDragging ? ' movie-card--dragging' : ''}${isAnimatingOut ? ' movie-card--animating-out' : ''}`}
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div
        className={`movie-card-feedback movie-card-feedback--like${activeDirection === 'like' ? ' movie-card-feedback--active' : ''}`}
        aria-hidden="true"
      >
        <span className="movie-card-feedback-icon">+</span>
      </div>
      <div
        className={`movie-card-feedback movie-card-feedback--dislike${activeDirection === 'dislike' ? ' movie-card-feedback--active' : ''}`}
        aria-hidden="true"
      >
        <span className="movie-card-feedback-icon">-</span>
      </div>
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
});

export default MovieCard;
