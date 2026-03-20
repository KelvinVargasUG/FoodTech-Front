import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const LoginView = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  const { login, register, isLoading, error, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/mesero')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (demoMode) {
      localStorage.setItem('auth_token', 'demo-token-12345')
      navigate('/mesero')
      return
    }

    if (isRegisterMode) {
      await register(email, username, password)
    } else {
      await login(email, password, rememberMe)
      
    }
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setEmail('')
    setUsername('')
    setPassword('')
    setRememberMe(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight">
      
      <div className="w-full max-w-md bg-charcoal border border-white/5 rounded-2xl p-10 shadow-2xl">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white-text">
            {isRegisterMode ? 'FoodTech Registro' : 'FoodTech Login'}
          </h1>
          <p className="text-silver-text text-sm mt-2">
            {isRegisterMode ? 'Crea tu cuenta en el sistema' : 'Accede al sistema de cocina'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email (login y registro) */}
          <div>
            <label className="block text-sm text-silver-text mb-2">
              {!isRegisterMode ? "Email / Username" : "Email" } 
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={!demoMode}
              disabled={demoMode}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white-text 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         disabled:opacity-40"
              placeholder="tu@email.com"
            />
          </div>

          {/* Username (solo registro) */}
          {isRegisterMode && (
            <div>
              <label className="block text-sm text-silver-text mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isRegisterMode && !demoMode}
                disabled={demoMode}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white-text 
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                           disabled:opacity-40"
                placeholder="tu usuario"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm text-silver-text mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!demoMode}
              disabled={demoMode}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white-text 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         disabled:opacity-40"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm text-center" data-testid="error-message">
              {error}
            </div>
          )}

          {/* Remember me (solo login, no demo) */}
          {!isRegisterMode && !demoMode && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="rememberMe" className="text-sm text-silver-text">
                Recordarme
              </label>
            </div>
          )}

          {/* Demo mode */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="demoMode"
              checked={demoMode}
              onChange={(e) => {
                setDemoMode(e.target.checked)
                if (e.target.checked) setRememberMe(false)
              }}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="demoMode" className="text-sm text-silver-text">
              Modo Demo(sin API)
            </label>
          </div>

          {/* Button */}
          <button
            type="submit"
            data-testid="login-button"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-black font-semibold
                       hover:opacity-90 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (isRegisterMode ? 'Registrando...' : 'Iniciando sesión...') 
              : (isRegisterMode ? 'Registrarse' : 'Iniciar sesión')}
          </button>

          {/* Toggle Login/Register */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-primary hover:underline"
              data-testid="register-link"
            >
              {isRegisterMode 
                ? '¿Ya tienes cuenta? Iniciar sesión' 
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}