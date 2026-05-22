const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function parseError(err, fallback = DEFAULT_ERROR_MESSAGE) {
  const errors = err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) return errors[0].description;
  return fallback;
}

export function getErrorCode(err) {
  const errors = err.response?.data;
  return Array.isArray(errors) ? (errors[0]?.code ?? null) : null;
}

export function isNetworkError(err) {
  return !err.response;
}
