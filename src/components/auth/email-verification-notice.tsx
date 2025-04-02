
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MailCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmailVerificationNoticeProps {
  email: string;
  onBack?: () => void;
}

export function EmailVerificationNotice({ email, onBack }: EmailVerificationNoticeProps) {
  const navigate = useNavigate();
  
  const handleBackToLogin = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };
  
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verifique seu email</CardTitle>
        <CardDescription>
          Enviamos um link de confirmação para:
        </CardDescription>
        <div className="mt-2 text-center font-medium">{email}</div>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          Por favor, verifique sua caixa de entrada e clique no link que enviamos para confirmar seu endereço de email.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Não recebeu o email? Verifique sua pasta de spam ou solicite um novo email de verificação.</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          onClick={handleBackToLogin} 
          variant="outline" 
          className="w-full"
        >
          Voltar para o login
        </Button>
      </CardFooter>
    </Card>
  );
}
