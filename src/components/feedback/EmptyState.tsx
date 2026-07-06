import { FolderX } from 'lucide-react'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  title = 'Tidak ada data',
  description = 'Belum ada data yang dapat ditampilkan.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          {icon || <FolderX className="h-10 w-10 text-muted-foreground" />}
        </div>
        <h2 className="mt-6 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-center text-sm font-normal leading-6 text-muted-foreground">
          {description}
        </p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  )
}
