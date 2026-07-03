const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const normalizedBase = rawApiUrl.replace(/\/$/, '');

export const API_URL = normalizedBase.endsWith('/api')
  ? normalizedBase
  : `${normalizedBase}/api`;
