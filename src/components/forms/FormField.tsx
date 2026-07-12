import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Control, FieldValues, Path } from 'react-hook-form'

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: React.ReactNode | string
  placeholder?: string
  description?: string
  type?: React.HTMLInputTypeAttribute
  disabled?: boolean
  required?: boolean
  children?: (field: unknown) => React.ReactNode
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = 'text',
  disabled,
  required = false,
  children,
}: FormFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-sm leading-snug sm:text-[15px]">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {children ? (
              children(field)
            ) : (
              <Input
                placeholder={placeholder}
                type={type}
                disabled={disabled}
                className="h-9 px-3 text-sm sm:h-10 sm:text-base"
                {...field}
              />
            )}
          </FormControl>
          {description && <FormDescription className="text-xs sm:text-sm">{description}</FormDescription>}
          <FormMessage className="text-xs sm:text-sm" />
        </FormItem>
      )}
    />
  )
}
