
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialView === "login");
  
  // Update isLogin state when initialView prop changes
  useEffect(() => {
    setIsLogin(initialView === "login");
  }, [initialView]);

  const handleLoginSuccess = () => {
    onClose();
  };

  const handleRegisterSuccess = () => {
    // We don't close the modal after registration as we need to show the verification screen
    // The registration form will handle showing the verification screen
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 bg-background border-none">
        <div className="w-full flex items-center justify-center">
          {isLogin ? (
            <LoginForm 
              onToggleForm={() => setIsLogin(false)} 
              onLoginSuccess={handleLoginSuccess}
            />
          ) : (
            <RegisterForm 
              onToggleForm={() => setIsLogin(true)} 
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
