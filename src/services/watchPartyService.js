import api from './api';

export const createWatchParty = () =>
  api.post('/watchparties');

export const joinWatchParty = (joinCode) =>
  api.post('/watchparties/join', { joinCode });

export const leaveWatchParty = (id) =>
  api.post(`/watchparties/${id}/leave`);

export const getWatchParty = (id) =>
  api.get(`/watchparties/${id}`);
