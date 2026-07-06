import * as React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, placeholder = 'Cari nama atau NIK...', ...props }, ref) => {
    return (
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className={cn('pl-8', className)}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'
