import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { removeToken, isAuthenticated } from '@/lib/auth'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const auth = isAuthenticated()

  const handleLogout = () => {
    removeToken()
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grain" />
      
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 blur-lg bg-primary/20 group-hover:bg-primary/40 transition-colors" />
            </div>
            <h1 className="text-2xl font-serif">Fynd AI</h1>
          </Link>

          <nav className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <Link to="/">
                  <Button 
                    variant={location.pathname === '/' ? 'default' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Submit Review
                  </Button>
                </Link>
                <Link to="/admin/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              </>
            )}
            
            {isAdmin && !auth && (
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Submit Review
                </Button>
              </Link>
            )}

            {isAdmin && auth && (
              <>
                <Link to="/admin/dashboard">
                  <Button 
                    variant={location.pathname === '/admin/dashboard' ? 'default' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Submit Review
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Fynd AI Feedback System · Built with precision</p>
        </div>
      </footer>
    </div>
  )
}
