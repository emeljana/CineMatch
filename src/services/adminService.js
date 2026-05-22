import api from './api';

export const getUserCount = () =>
  api.get('/admin/users/count');

export const getAllWatchParties = () =>
  api.get('/admin/watchparties');
