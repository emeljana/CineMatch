import api from './api';

export const getMatches = (watchPartyId) =>
  api.get(`/matches/party/${watchPartyId}`);

export const markWatched = (matchId) =>
  api.post(`/matches/${matchId}/watched`);
