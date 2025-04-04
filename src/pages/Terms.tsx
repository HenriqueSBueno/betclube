
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o site Betclub ("Site"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar ou usar nosso Site.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Alterações nos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento, a nosso critério. As alterações terão efeito imediatamente após a publicação dos Termos atualizados. É sua responsabilidade revisar periodicamente estes Termos para manter-se informado sobre as atualizações.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Acesso ao Site</h2>
            <p>
              Concedemos a você uma licença limitada, não exclusiva e revogável para acessar e usar nosso Site para fins pessoais e não comerciais. Esta licença não inclui qualquer revenda ou uso comercial do Site ou de seu conteúdo, nem qualquer coleta e uso de listas, descrições ou preços de produtos.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Contas de Usuário</h2>
            <p>
              Ao criar uma conta em nosso Site, você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador. Você concorda em aceitar responsabilidade por todas as atividades que ocorram em sua conta ou senha. Você deve informar-nos imediatamente sobre qualquer uso não autorizado de sua conta.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Conduta do Usuário</h2>
            <p>
              Ao usar nosso Site, você concorda em:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Não violar quaisquer leis ou regulamentos aplicáveis.</li>
              <li>Não publicar ou transmitir material que seja difamatório, obsceno, ameaçador, ou que viole os direitos de qualquer pessoa.</li>
              <li>Não interferir na operação normal do Site ou tomar medidas que imponham uma carga desproporcional em nossa infraestrutura.</li>
              <li>Não tentar obter acesso não autorizado a partes do Site que não são públicas.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, recursos e funcionalidades disponíveis em nosso Site, incluindo, mas não se limitando a textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, são de propriedade do Betclub, seus licenciadores ou outros fornecedores de conteúdo e são protegidos pelas leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Links para Terceiros</h2>
            <p>
              Nosso Site pode conter links para sites ou serviços de terceiros que não são de propriedade ou são controlados pelo Betclub. Não temos controle sobre o conteúdo, políticas de privacidade ou práticas de qualquer site ou serviço de terceiros e não assumimos responsabilidade por eles.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Isenção de Responsabilidade</h2>
            <p>
              O Site é fornecido "como está" e "conforme disponível", sem quaisquer garantias, expressas ou implícitas. Não garantimos que o Site será ininterrupto, seguro ou livre de erros. Você usa o Site por sua conta e risco.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Limitação de Responsabilidade</h2>
            <p>
              Em nenhum caso o Betclub, seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de seu acesso ou uso ou incapacidade de acessar ou usar o Site.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">10. Lei Aplicável</h2>
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições de conflito de leis.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">11. Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do e-mail: contato@betclub.com.br.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
