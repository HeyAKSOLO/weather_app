import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingState from './LoadingState.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingState message="Checking your login..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
