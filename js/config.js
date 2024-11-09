export const base_url = 'https://we-meet-server-1-0-0.onrender.com/we-meet';

export function getAccessToken() {
  const accessToken = localStorage.getItem('accessToken') ?? '';
  return accessToken;
}
