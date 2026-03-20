const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const REMEMBER_ME_DAYS = 30
export const authService = {
  async login(email: string, password: string, rememberMe: boolean = false): Promise<boolean> {
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email, password }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciales inválidas')
        }
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      
      if (rememberMe) {
        const expiryDate = Date.now() + (REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000)
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_token_expiry', expiryDate.toString())
      } else {
        localStorage.setItem('auth_token', data.token)
        localStorage.removeItem('auth_token_expiry')
      }
      return true
    } catch (error) {
      if (error instanceof TypeError || error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión')
      }
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido')
    }
  },

  logout(): void {
    localStorage.removeItem('auth_token')
  },

  getToken(): string | null {
    const expiry = localStorage.getItem('auth_token_expiry')
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_token_expiry')
      return null
    }
    return localStorage.getItem('auth_token')
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null
  },

  async register(email: string, username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      })

      if (!response.ok) {
        let message = `Error: ${response.status}`;
        try {
          const data = await response.json();
          if (data && (data.message || data.error)) {
            message = data.message || data.error;
          }
        } catch {}
        throw new Error(message);
      }
      return true;
    } catch (error) {
      if (error instanceof TypeError || error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido');
    }
  },
  
}
