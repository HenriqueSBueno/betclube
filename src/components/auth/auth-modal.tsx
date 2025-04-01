
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>
          {isLogin ? "Sign In" : "Sign Up"}
        </DialogTitle>
        {isLogin ? (
          <LoginForm 
            onToggleForm={() => setIsLogin(false)} 
            onLoginSuccess={onClose}
          />
        ) : (
          <RegisterForm 
            onToggleForm={() => setIsLogin(true)} 
            onRegisterSuccess={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
