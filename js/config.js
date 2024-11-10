export const base_url =
  'https://we-meet-server-production-8d76.up.railway.app/we-meet';

export function getAccessToken() {
  const accessToken = localStorage.getItem('accessToken') ?? '';
  return accessToken;
}
