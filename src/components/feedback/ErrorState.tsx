import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  message = 'Gagal memuat data. Silakan coba lagi.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed border-destructive/50 bg-destructive/10 p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-destructive">{title}</h2>
        <p className="mt-2 text-center text-sm font-normal leading-6 text-destructive/80">
          {message}
        </p>
        {onRetry && (
          <div className="mt-6">
            <Button variant="outline" onClick={onRetry}>
              Coba Lagi
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
