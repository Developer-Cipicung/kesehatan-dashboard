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
    onSuccess: (data) => {
      const token = data.data.session.access_token
      const user = data.data.user
      login(token, user)
      toast.success('Login berhasil')
      navigate('/', { replace: true })
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.'
      toast.error(message)
    },
  })
}
