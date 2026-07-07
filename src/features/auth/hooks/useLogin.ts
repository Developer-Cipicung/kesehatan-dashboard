import { useMutation } from '@tanstack/react-query'
import { authService, LoginRequest } from '../services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

export function useLogin() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (data) => {
      const token = data.data.session.access_token
      const user = data.data.user
      // Fetch posyandu info using the new token
      try {
        const meData = await authService.getMe(token)
        login(token, user, meData?.data?.posyandu ?? undefined)
      } catch {
        login(token, user)
      }
      toast.success('Login berhasil')
      navigate('/', { replace: true })
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      // Hanya mengandalkan inline error di form login
    },
  })
}
