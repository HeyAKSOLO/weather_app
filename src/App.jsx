import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

export default function App() {
  return (
    <div className="relative min-h-svh overflow-x-hidden text-slate-800 dark:text-slate-100">
      <Header />
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
