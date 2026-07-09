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
  children,
}: FormFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {children ? (
              children(field)
            ) : (
              <Input
                placeholder={placeholder}
                type={type}
                disabled={disabled}
                {...field}
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
