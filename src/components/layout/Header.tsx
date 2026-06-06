import { Home, ListTodo, Target, Calendar, Heart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

interface HeaderProps {
  currentPage: string
}

export function Header({ currentPage }: HeaderProps) {
  const { user, signOut } = useAuth()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/todos', label: '待办', icon: ListTodo },
    { href: '/goals', label: '目标', icon: Target },
    { href: '/notes/calendar', label: '笔记', icon: Calendar },
    { href: '/memorials', label: '纪念日', icon: Heart },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold">PlanToDo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="rounded-full"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button>登录</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}