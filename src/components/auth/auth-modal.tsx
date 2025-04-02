
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = () => {
    onClose();
  };

  const handleRegisterSuccess = () => {
    // Não fechamos mais o modal após o registro, pois precisamos mostrar a tela de verificação
    // O formulário de registro cuidará de mostrar a tela de verificação
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
      </DialogContent>
    </Dialog>
  );
}
