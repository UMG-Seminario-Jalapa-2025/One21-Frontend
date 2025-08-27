import ProtectedRoute from '@/components/ProtectedRoute'

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1>Bienvenido al Home</h1>
      </div>
    </ProtectedRoute>
  )
}
