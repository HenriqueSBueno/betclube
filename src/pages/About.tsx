import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Sobre o Betclube</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl mb-6">
              Betclube é uma plataforma comunitária criada para conectar apostadores e entusiastas
              de jogos online no Brasil, oferecendo rankings transparentes de casas de apostas.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Nossa Missão</h2>
            <p>
              O Betclube foi criado com uma missão clara: fornecer aos apostadores brasileiros
              informações confiáveis e transparentes sobre as melhores plataformas de apostas
              disponíveis no mercado. Acreditamos que o conhecimento compartilhado pela comunidade
              é mais valioso do que avaliações pagas ou afiliações tendenciosas.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Por que o Betclube existe?</h2>
            <p>
              Em um mercado cada vez mais saturado de sites de apostas, torna-se difícil para os
              usuários identificarem quais plataformas são realmente confiáveis e oferecem a melhor
              experiência. O Betclube nasceu da necessidade de criar um espaço onde apostadores
              reais pudessem compartilhar suas experiências e votar nos sites que realmente entregam
              o que prometem.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Como funcionamos</h2>
            <p>
              Nossa plataforma é baseada em um sistema de votos da comunidade. Cada usuário registrado
              pode votar nos sites que considera melhores, contribuindo para um ranking diário atualizado
              e genuíno. Não aceitamos pagamentos para manipular posições em nossos rankings - o que você
              vê é o resultado real da opinião coletiva dos apostadores brasileiros.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Nossos valores</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Transparência:</strong> Todos os nossos rankings são baseados exclusivamente
                nos votos da comunidade.
              </li>
              <li>
                <strong>Comunidade:</strong> Valorizamos a experiência coletiva dos apostadores
                brasileiros.
              </li>
              <li>
                <strong>Acessibilidade:</strong> Nossa plataforma é e sempre será 100% gratuita
                para todos os usuários.
              </li>
              <li>
                <strong>Responsabilidade:</strong> Promovemos o jogo responsável e consciente.
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Junte-se à nossa comunidade</h2>
            <p>
              O Betclube é mais do que um site de rankings - somos uma comunidade crescente de
              apostadores brasileiros que compartilham conhecimento e experiências. Ao se juntar
              a nós, você não apenas ganha acesso a informações valiosas, mas também contribui
              para uma plataforma que valoriza a transparência e a opinião dos usuários reais.
            </p>
            <p className="mt-4">
              Estamos comprometidos em continuar evoluindo e melhorando nossa plataforma para
              atender às necessidades dos apostadores brasileiros, mantendo sempre nossos valores
              de comunidade e transparência como pilares fundamentais.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
