import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: '/',
        element: <div>Dashboard Content</div>,
      },
    ],
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        path: '',
        element: <div>Login Form</div>,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
