#!/usr/bin/env node
// Simple script to check if the middleware runs by requesting a URL
// Usage: node ./scripts/check-middleware.js [URL]
// Default URL: http://localhost:3000/admin

const url = process.argv[2] || process.env.URL || 'http://localhost:3000/admin'

console.log(`Checking middleware header at: ${url}`)

// Use global fetch (Node 18+). If not available, the script will fail and you can run with `node --experimental-fetch`.
;(async () => {
  try {
    const res = await fetch(url, { redirect: 'manual' })
    console.log(`Status: ${res.status} ${res.statusText}`)
    const header = res.headers.get('x-one21-middleware')
    const setCookie = res.headers.get('set-cookie')
    console.log('x-one21-middleware:', header)
    console.log('set-cookie:', setCookie)

    if (header || setCookie) {
      console.log('Middleware detected (header or set-cookie present) -> OK')
      process.exit(0)
    } else {
      console.error('Middleware NOT detected -> check middleware or server')
      process.exit(2)
    }
  } catch (err) {
    console.error('Error performing request:', err && err.message ? err.message : err)
    process.exit(1)
  }
})()
