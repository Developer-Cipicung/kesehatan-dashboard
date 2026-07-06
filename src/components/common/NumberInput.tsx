import * as React from "react"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <Input
          type="text"
          inputMode="decimal"
          ref={ref}
          onChange={handleChange}
          className={error ? 'border-destructive' : className}
          {...props}
        />
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    )
  }
)
NumberInput.displayName = 'NumberInput'
