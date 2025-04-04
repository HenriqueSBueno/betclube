
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmailVerificationNotice } from "./email-verification-notice";

interface LoginFormProps {
  onToggleForm: () => void;
  onLoginSuccess?: () => void;
}

export function LoginForm({ onToggleForm, onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success && onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao fazer login";
      setError(errorMessage);
      
      // Se o erro for relacionado à confirmação do email, mostrar a tela de verificação
      if (errorMessage.includes("Email não confirmado") || 
          errorMessage.includes("Email not confirmed") ||
          errorMessage.toLowerCase().includes("email") && 
          errorMessage.toLowerCase().includes("confirm")) {
        setShowVerificationNotice(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerificationNotice) {
    return <EmailVerificationNotice email={email} onBack={() => setShowVerificationNotice(false)} />;
  }

  return (
    <div className="w-full max-w-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Login</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-2" 
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="text-sm text-center mt-6">
        Não tem uma conta?{" "}
        <Button variant="link" onClick={onToggleForm} className="p-0">
          Registre-se
        </Button>
      </div>
    </div>
  );
}
