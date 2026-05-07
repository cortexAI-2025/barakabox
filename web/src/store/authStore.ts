import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { authApi } from '../services/api'
import { AxiosError } from 'axios'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login(email, password)
          const { user, token } = response.data
          localStorage.setItem('barakabox_token', token)
          localStorage.setItem('barakabox_user', JSON.stringify(user))
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err) {
          const error = err as AxiosError<{ message: string }>
          set({
            error: error.response?.data?.message || 'Identifiants incorrects',
            isLoading: false,
          })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('barakabox_token')
        localStorage.removeItem('barakabox_user')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      loadUser: async () => {
        const token = get().token || localStorage.getItem('barakabox_token')
        if (!token) return

        set({ isLoading: true })
        try {
          const response = await authApi.me()
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          localStorage.removeItem('barakabox_token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'barakabox-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
