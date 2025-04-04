
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Users, Star, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "register">("register");
  const isMobile = useIsMobile();
  
  const handleStartNowClick = () => {
    setAuthModalView("register");
    setIsAuthModalOpen(true);
  };
  
  return <div className="flex flex-col items-center">
      <section className="relative w-full py-12 md:py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5dff9_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="inline-flex gap-2 items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-600 font-medium">
              <Check className="h-4 w-4" />
              100% Gratuito para Sempre
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl/none lg:text-6xl/none">
                Descubra as <span className="text-primary">Melhores Bets e Apps</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">Junte-se à nossa comunidade e vote na melhor Bet do dia. Veja as recomendações de outros usuários e tome a melhor decisão</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button size={isMobile ? "default" : "lg"} onClick={handleStartNowClick} className="w-full sm:w-auto">
                Comece Agora
              </Button>
              <Button size={isMobile ? "default" : "lg"} variant="secondary" className="w-full sm:w-auto group relative overflow-hidden transition-all duration-300" asChild>
                <Link to="/home">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Ver Rankings
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-secondary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Por que escolher o Betclub?</h2>
            <p className="mt-2 text-muted-foreground">Oferecemos uma experiência única e totalmente gratuita para os apostadores</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col justify-between p-6 bg-background rounded-lg border shadow-sm hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Comunidade Ativa</h3>
                <p className="text-muted-foreground">
                  Rankings baseados em votos e experiências reais, não em anúncios pagos.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-6 bg-background rounded-lg border shadow-sm hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">Atualizações Diárias</h3>
                <p className="text-muted-foreground">
                  Nossos rankings são atualizados todos os dias para refletir os últimos votos e tendências.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-6 bg-background rounded-lg border shadow-sm hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Múltiplas Categorias</h3>
                <p className="text-muted-foreground">
                  Encontre os melhores sites para apostas esportivas, jogos de cassino, poker e mais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center">
            <div className="inline-block px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-primary/20 text-primary">
              Sem custos escondidos
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Completamente Gratuito</h2>
            <p className="max-w-[700px] text-lg text-muted-foreground mb-8">
              O Betclub é e sempre será 100% gratuito para todos os usuários. Sem taxas, sem assinaturas, sem limitações.
            </p>
            <Button size="lg" onClick={handleStartNowClick} className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-md">
              Crie Sua Conta Grátis Agora
            </Button>
          </div>
        </div>
      </section>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authModalView} />
    </div>;
}
