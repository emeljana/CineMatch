import api from './api';

export const swipe = (watchPartyId, movieId, isLiked) =>
  api.post('/swipes', { watchPartyId, movieId, isLiked });

export const getQueue = (watchPartyId, count = 10) =>
  api.get(`/swipes/queue/${watchPartyId}`, { params: { count } });
