import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from './app/query-client'
import { AppRouter } from './routes'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster richColors position="top-right" duration={2000} />
    </QueryClientProvider>
  )
}

export default App
