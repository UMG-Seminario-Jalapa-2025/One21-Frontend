export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME || 'one21_token';

export const AUTH_COOKIE_MAX_AGE =
  Number(process.env.AUTH_COOKIE_MAX_AGE || 60 * 60 * 24 * 7); // 7 días

export const AUTH_API_BASE =
  process.env.AUTH_API_BASE || 'https://dev.one21.app';

export const AUTH_STATIC_BEARER =
  process.env.AUTH_STATIC_BEARER || '';

export const AUTH_TENANT =
  process.env.AUTH_TENANT || 'one21';
