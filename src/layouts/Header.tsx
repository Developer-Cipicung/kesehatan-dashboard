import { Menu, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <h1 className="text-lg font-semibold md:hidden">Posyandu Cipicung</h1>
      </div>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            }
          />
          <PopoverContent className="w-56" align="end">
            <div className="flex flex-col space-y-2 p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Kader</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email as string || 'kader@posyandu.com'}
                </p>
              </div>
              <div className="border-t my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
