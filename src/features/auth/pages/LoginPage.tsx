import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormField } from '@/components/forms/FormField'
import { AlertCircle } from 'lucide-react'
import { LoginRequest, loginSchema } from '../services/authService'
import { useLogin } from '../hooks/useLogin'
import { useAuthStore } from '@/stores/authStore'
import { Navigate } from 'react-router-dom'

export function LoginPage() {
  const { mutate: login, isPending, isError, error } = useLogin()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function onSubmit(values: LoginRequest) {
    login(values)
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Masukkan username dan password untuk masuk ke dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isError && (
              <div className="bg-[#ef4444] border border-[#dc2626] text-white text-sm px-4 py-3.5 rounded-lg flex items-center shadow-md animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-white" />
                <span className="font-medium">
                  {((error as any)?.response?.data?.message || '').includes('Invalid login credentials') 
                    ? 'Username atau password yang Anda masukkan salah.' 
                    : ((error as any)?.response?.data?.message || 'Login gagal. Periksa kembali data Anda.')}
                </span>
              </div>
            )}
            <FormField
              control={form.control}
              name="username"
              label="Username"
              placeholder="Contoh: kader_cipicung"
              type="text"
              disabled={isPending}
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="********"
              type="password"
              disabled={isPending}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
