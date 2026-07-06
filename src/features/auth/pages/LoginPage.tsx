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
import { LoginRequest, loginSchema } from '../services/authService'
import { useLogin } from '../hooks/useLogin'
import { useAuthStore } from '@/stores/authStore'
import { Navigate } from 'react-router-dom'

export function LoginPage() {
  const { mutate: login, isPending } = useLogin()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
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
          Masukkan email dan password untuk masuk ke dashboard kader.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="kader@posyandu.com"
              type="email"
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
