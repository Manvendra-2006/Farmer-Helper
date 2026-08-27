let authToken = null;

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token) {
  authToken = token || null;
}

export function clearAuthToken() {
  authToken = null;
}