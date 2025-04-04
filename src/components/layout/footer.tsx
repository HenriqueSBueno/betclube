
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <Link to="/" className="font-bold">
            Betclub
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            © {new Date().getFullYear()} Betclub Rankings. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">
            Sobre
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Termos
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
