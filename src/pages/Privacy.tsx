
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <p>
              Esta Política de Privacidade descreve como suas informações pessoais são coletadas, usadas e compartilhadas quando você visita ou faz uma compra no Betclub ("Site").
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Informações que coletamos</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Informações pessoais</h3>
            <p>
              Quando você se registra no Site, podemos coletar certas informações de identificação pessoal suas, incluindo, mas não se limitando a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome</li>
              <li>Endereço de e-mail</li>
              <li>Nome de usuário e senha</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Informações de uso</h3>
            <p>
              Também coletamos informações sobre como você acessa e usa nosso Site, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Endereço IP</li>
              <li>Tipo de navegador</li>
              <li>Sistema operacional</li>
              <li>Páginas visualizadas</li>
              <li>Tempo gasto no Site</li>
              <li>Sites de referência</li>
              <li>Cliques e interações no Site</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Como usamos suas informações</h2>
            <p>
              Usamos as informações que coletamos para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer, manter e melhorar nosso Site</li>
              <li>Processar suas votações e participação em nossos rankings</li>
              <li>Comunicar-nos com você, incluindo responder às suas dúvidas e fornecer suporte</li>
              <li>Personalizar sua experiência de usuário</li>
              <li>Monitorar e analisar tendências, uso e atividades relacionadas ao nosso Site</li>
              <li>Detectar, prevenir e resolver atividades fraudulentas ou problemas técnicos</li>
              <li>Cumprir obrigações legais</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Cookies e tecnologias semelhantes</h2>
            <p>
              Usamos cookies, pixels de rastreamento e tecnologias semelhantes para coletar informações sobre sua navegação no Site e reconhecê-lo quando você retornar. Isso nos ajuda a melhorar a funcionalidade do Site e analisar o uso.
            </p>
            
            <p className="mt-4">
              Você pode instruir seu navegador a recusar todos os cookies ou a indicar quando um cookie está sendo enviado. No entanto, se você não aceitar cookies, talvez não consiga usar algumas partes do nosso Site.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Compartilhamento de informações</h2>
            <p>
              Podemos compartilhar suas informações pessoais nas seguintes circunstâncias:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Com provedores de serviços que nos ajudam a operar nosso Site (como serviços de hospedagem ou análise)</li>
              <li>Para cumprir com obrigações legais, como para responder a intimações ou ordens judiciais</li>
              <li>Para proteger os direitos, propriedade ou segurança do Betclub, nossos usuários ou terceiros</li>
              <li>Com seu consentimento ou conforme divulgado no momento da coleta</li>
            </ul>

            <p className="mt-4">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing direto sem seu consentimento.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Retenção de dados</h2>
            <p>
              Manteremos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta Política de Privacidade, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Segurança</h2>
            <p>
              Tomamos medidas razoáveis para proteger suas informações pessoais contra perda, uso indevido, acesso não autorizado, divulgação, alteração ou destruição. No entanto, nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Seus direitos</h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (LGPD) do Brasil, você tem direitos relacionados às suas informações pessoais, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Direito de acesso às suas informações pessoais</li>
              <li>Direito de correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Direito de eliminar seus dados pessoais</li>
              <li>Direito de portabilidade dos dados</li>
              <li>Direito de revogar o consentimento</li>
            </ul>

            <p className="mt-4">
              Para exercer esses direitos, entre em contato conosco através dos métodos listados na seção "Contato" abaixo.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política de privacidade periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulatórios. Notificaremos você sobre quaisquer alterações significativas publicando a nova Política de Privacidade em nosso Site.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>E-mail: privacidade@betclub.com.br</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
