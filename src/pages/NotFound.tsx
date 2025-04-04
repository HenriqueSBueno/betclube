
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-16 flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Ops! A página que você está procurando não existe.
        </p>
        <Link to="/">
          <Button size="lg">Voltar para a Página Inicial</Button>
        </Link>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
