import * as React from "react"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface NumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, className, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      // Allow only numbers and optionally one decimal point
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        onChange?.(e)
      }
    }

    return (
      <div className="grid w-full items-center gap-1.5">
        {label && <Label htmlFor={props.id} className="text-sm leading-snug sm:text-[15px]">{label}</Label>}
        <Input
          type="text"
          inputMode="decimal"
          ref={ref}
          onChange={handleChange}
          className={cn('h-9 min-w-0 px-3 text-sm sm:h-10 sm:text-base', className, error && 'border-destructive')}
          {...props}
        />
        {error && <span className="text-xs text-destructive sm:text-sm">{error}</span>}
      </div>
    )
  }
)
NumberInput.displayName = 'NumberInput'
