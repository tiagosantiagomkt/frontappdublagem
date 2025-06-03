export default function TermsAndLicense() {
  return (
    <div className="prose prose-slate max-w-none">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Termos de Uso</h1>
        
        <h2 className="text-2xl font-semibold text-text-primary mt-6">1. Objetivo</h2>
        <p className="text-text-secondary mb-4">
          Este software fornece APIs para baixar vídeos, transcrever, traduzir, sintetizar voz e compor vídeos dublados, 
          utilizando tecnologias open source.
        </p>

        <h2 className="text-2xl font-semibold text-text-primary mt-6">2. Uso Permitido</h2>
        <p className="text-text-secondary mb-4">
          Você pode utilizar este software para fins pessoais ou comerciais, inclusive integrá-lo aos seus próprios sistemas 
          ou serviços, respeitando as licenças dos componentes utilizados.
        </p>

        <h2 className="text-2xl font-semibold text-text-primary mt-6">3. Privacidade e Proteção de Dados (LGPD)</h2>
        <p className="text-text-secondary mb-4">
          O sistema não coleta dados pessoais identificáveis dos usuários.
        </p>
        <p className="text-text-secondary mb-4">
          No entanto, algumas funcionalidades permitem que o usuário envie voluntariamente arquivos contendo cookies 
          do navegador (<code>cookies.txt</code>) com o único propósito de autenticar o acesso a vídeos protegidos 
          por login, idade ou região.
        </p>

        <h3 className="text-xl font-semibold text-text-primary mt-6">Sobre o uso de cookies:</h3>
        <ul className="list-disc pl-6 text-text-secondary mb-4">
          <li>O envio é <strong>opcional</strong> e de responsabilidade do usuário.</li>
          <li>O conteúdo do arquivo é usado <strong>somente durante o download</strong> do vídeo.</li>
          <li>O arquivo é <strong>apagado imediatamente após a operação</strong>.</li>
          <li>Nenhum dado contido nos cookies é retido, compartilhado ou armazenado.</li>
        </ul>

        <p className="text-text-secondary mb-4">
          O usuário é o controlador de quaisquer dados pessoais presentes no vídeo ou no cookie enviado, 
          sendo responsável pelo tratamento conforme a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>.
        </p>

        <h2 className="text-2xl font-semibold text-text-primary mt-6">4. Responsabilidade</h2>
        <p className="text-text-secondary mb-4">
          Este software é fornecido "no estado em que se encontra". Não garantimos resultado específico, 
          desempenho ou disponibilidade contínua. O uso é feito por conta e risco do usuário.
        </p>

        <h2 className="text-2xl font-semibold text-text-primary mt-6">5. Contato</h2>
        <p className="text-text-secondary mb-4">
          Para dúvidas, suporte ou solicitações relacionadas à privacidade:
        </p>
        <div className="text-text-secondary mb-8">
          <strong>Naze Tecnologia Ltda</strong><br />
          CNPJ: 58.204.061/0001-50<br />
          E-mail: contato@naze.com.br
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">🔐 Sobre cookies.txt</h2>
          <p className="text-text-secondary mb-4">
            Alguns vídeos do YouTube exigem autenticação para serem baixados (ex: restrição de idade, 
            login obrigatório, vídeos privados).
          </p>
          <p className="text-text-secondary mb-4">
            Esta API permite que você envie um arquivo <code>cookies.txt</code> exportado do seu navegador, 
            para autenticar temporariamente o download.
          </p>

          <h3 className="text-xl font-semibold text-text-primary mt-4 mb-2">Como usar:</h3>
          <ol className="list-decimal pl-6 text-text-secondary mb-4">
            <li>Instale a extensão <a href="https://chrome.google.com/webstore/detail/get-cookiestxt/iekmljdncgmfkjmjepjehhgckfbedpor" 
              className="text-primary hover:text-primary-hover">Get cookies.txt</a></li>
            <li>Acesse <a href="https://youtube.com" className="text-primary hover:text-primary-hover">youtube.com</a> logado 
              na sua conta</li>
            <li>Clique na extensão e salve o <code>cookies.txt</code></li>
            <li>Envie esse arquivo junto à requisição usando <code>curl</code> ou via frontend</li>
          </ol>

          <p className="text-text-secondary font-semibold">
            Importante: o arquivo é apagado automaticamente após o uso. Nenhum dado é retido ou armazenado.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Licença de Uso</h1>
        <p className="text-text-secondary mb-4">
          Este software é um compilado de ferramentas open source sob licenças permissivas (MIT, Unlicense, MPL-2.0, 
          BSD, LGPL) e pode ser utilizado para fins pessoais, acadêmicos ou comerciais.
        </p>

        <h2 className="text-2xl font-semibold text-text-primary mt-6">Componentes e Licenciamento</h2>
        <ul className="list-disc pl-6 text-text-secondary mb-4">
          <li><strong>yt-dlp</strong>: Licença Unlicense — uso irrestrito</li>
          <li><strong>Whisper (OpenAI)</strong>: Licença MIT — uso livre com atribuição opcional</li>
          <li><strong>Argos Translate</strong>: Licença MIT — uso livre</li>
          <li><strong>FastAPI e Uvicorn</strong>: Licença MIT/BSD — uso livre</li>
          <li><strong>FFmpeg</strong>: Utilizado em modo compatível com LGPL</li>
          <li><strong>Coqui TTS</strong>: Licenciado sob <strong>Mozilla Public License 2.0 (MPL-2.0)</strong></li>
        </ul>

        <h3 className="text-xl font-semibold text-text-primary mt-6">Coqui TTS (MPL-2.0)</h3>
        <p className="text-text-secondary mb-2">Você pode utilizar Coqui TTS comercialmente, desde que:</p>
        <ul className="list-disc pl-6 text-text-secondary mb-4">
          <li>Não modifique o core da engine</li>
          <li>Mantenha os avisos de direitos autorais da Coqui se redistribuir o código da engine original</li>
          <li>Consulte <a href="https://github.com/coqui-ai/TTS" className="text-primary hover:text-primary-hover">
            https://github.com/coqui-ai/TTS
          </a> para mais detalhes.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-text-primary mt-8">Declaração de Responsabilidade</h2>
        <p className="text-text-secondary mb-8">
          Este projeto é distribuído <strong>"como está"</strong>, sem garantias de qualquer tipo. 
          O uso é de responsabilidade exclusiva do usuário.
        </p>

        <hr className="my-8" />

        <footer className="text-text-secondary text-sm">
          © 2025 – Naze Tecnologia Ltda<br />
          CNPJ: 58.204.061/0001-50<br />
          Contato: contato@naze.com.br
        </footer>
      </section>
    </div>
  );
} 