// Root re-export: delegate implementation to src/middleware_impl.ts to avoid circular imports
console.log('### middleware (root) re-export loaded ###')
export { middleware, config } from './src/middleware_impl'
