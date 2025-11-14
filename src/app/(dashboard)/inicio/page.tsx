'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [message, setMessage] = useState('Cargando...')

  useEffect(() => {
    const fetchWelcome = async () => {
      try {
        const res = await fetch('/api/sistem/welcome', { cache: 'no-store' })
        const json = await res.json()

        if (res.ok && json.message) {
          setMessage(json.message)
        } else {
          setMessage('Bienvenido')
        }
      } catch (err) {

        setMessage('Bienvenido devuelta administrador')
      }
    }

    fetchWelcome()
  }, [])

  return (
    <div className="p-4">
      <h1>{message}</h1>
    </div>
  )
}
