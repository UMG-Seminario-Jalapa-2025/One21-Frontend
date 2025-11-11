// Re-export middleware from project root to ensure Next picks it up when using `src` layout
console.log('### src/middleware.ts loaded — proxy to root middleware ###')
export { middleware, config } from '../middleware'
