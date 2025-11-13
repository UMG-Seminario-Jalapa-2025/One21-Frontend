// Proxy loader: forward middleware execution to the TypeScript `middleware.ts` implementation
// This ensures Next's JS loader will pick the file but delegate logic to the TS file.
console.log('### middleware.js loaded — proxying to src/middleware_impl ###')

import { middleware as tsMiddleware, config as tsConfig } from './src/middleware_impl'

export function middleware(request) {
  return tsMiddleware(request)
}

export const config = tsConfig
