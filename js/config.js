export const base_url = 'http://localhost:8080/we-meet';

export function getAccessToken() {
  const accessToken = localStorage.getItem('accessToken') ?? '';
  return accessToken;
}
