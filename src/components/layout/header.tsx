
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, LayoutDashboard, Settings } from "lucide-react";
import { OnlineCountDisplay } from "@/components/online-users/online-count-display";

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "register">("login");
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const getUserInitials = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const handleLoginClick = () => {
    setAuthModalView("login");
    setIsAuthModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-1 rounded">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-primary-foreground"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <span className="font-bold text-xl">Betclube</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/home" className="text-sm font-medium hover:underline">
              Rankings
            </Link>
            
            {isAuthenticated && isAdmin() && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-1 text-sm font-medium hover:underline text-primary"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Painel de Administração</span>
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <OnlineCountDisplay />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.username || user?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin() && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Painel de Administração</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={handleLoginClick}
              className="gap-1"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView}
      />
    </header>
  );
}
