// src/app/pop/page.tsx
import Link from 'next/link';

export default function PopPage() {
  return (
    <article className="container mx-auto py-12 prose">
      <h1>Procedimento Operacional Padrão</h1>

      <p>
        <strong>Setor:</strong> Oftalmologia - Ambulatório de Retina
        <br />
        <strong>Instituição:</strong> Hospital Geral de Fortaleza
      </p>
      <p>
        <strong>Objetivo:</strong> Estabelecer, com rigor e clareza, os procedimentos padronizados para a execução da
        aplicação de injeções intravítreas, a fim de minimizar riscos de incongruências e erros, assegurando a precisão
        no fluxo de informações, controle de doses e acompanhamento dos pacientes, conforme as normativas de boas
        práticas clínicas e diretrizes regulamentadoras vigentes.
      </p>

      <p>
        <strong>Abrangência:</strong> Este POP aplica-se a todos os profissionais de saúde envolvidos no processo de
        indicação, agendamento, aplicação e controle de injeções intravítreas no Setor de Oftalmologia.
      </p>

      <p>
        <strong>Responsáveis:</strong> Médicos oftalmologistas, Equipe de Agendamento do NIR (Núcleo Interno de
        Regulação), Colaboradores Administrativos e demais profissionais vinculados ao processo de atendimento
        oftalmológico.
      </p>

      <hr className="my-4" />

      <h2>1. Identificação da Necessidade de Injeção Intravítrea</h2>
      <p>
        <strong>1.1 Responsável:</strong> Médico Oftalmologista do Ambulatório de Retina
      </p>
      <p>
        <strong>1.2 Descrição do Processo:</strong>
      </p>
      <p>
        Durante o atendimento ambulatorial, o médico identificará a necessidade de aplicação de injeção intravítrea
        conforme os critérios clínicos estabelecidos, com base em diagnóstico documentado e respaldado por exame
        oftalmológico.
      </p>
      <ul>
        <li>
          <strong>Preenchimento do Formulário de Indicação:</strong> Após a identificação da necessidade de tratamento,
          o médico deverá preencher o formulário padronizado, detalhando obrigatoriamente o número de injeções
          indicadas, bem como a lateralidade (Olho Direito - OD, Olho Esquerdo - OE, ou ambos).
        </li>
        <li>
          <strong>Encaminhamento para Agendamento:</strong> O formulário preenchido deverá ser encaminhado ao NIR para
          realização do agendamento, observando-se os prazos definidos e a disponibilidade do setor, sendo permitido o
          agendamento de até 30 pacientes por dia, nos dias predefinidos (segunda, terça e quinta-feira).
        </li>
      </ul>
      <p>
        <strong>1.4 Medidas de Mitigação:</strong> Revisão obrigatória do formulário preenchido pelo médico assistente,
        com verificação cruzada dos dados entre o prontuário físico e o sistema eletrônico hospitalar antes de seu
        envio.
      </p>

      <h2>2. Registro e Organização das Doses no Sistema AntiVEGF</h2>
      <p>
        <strong>2.1 Responsável:</strong> Médico Oftalmologista e Colaboradores Administrativos designados
      </p>
      <p>
        <strong>2.2 Descrição do Processo:</strong>
      </p>
      <p>
        Após o preenchimento e envio do formulário de indicação ao NIR, o médico assistente ou colaborador
        administrativo responsável deverá proceder com o registro do paciente no sistema AntiVEGF, garantindo a correta
        inserção dos dados referentes ao número do prontuário e quantidade de doses necessárias para cada olho.
      </p>
      <p>
        Este processo tem por finalidade a gestão eficiente das doses indicadas, possibilitando o acompanhamento
        detalhado da evolução do tratamento e evitando a duplicidade de informações ou a aplicação indevida em olho não
        indicado.
      </p>
      <ul>
        <li>Erro no Registro no Sistema</li>
        <li>Perda de Rastreamento das Doses</li>
      </ul>
      <p>
        <strong>2.4 Medidas de Mitigação:</strong> Implementar dupla conferência dos dados inseridos no sistema
        AntiVEGF.
      </p>

      <h2>3. Emissão de Relatórios Pré-Procedimento</h2>
      <p>
        <strong>3.1 Responsável:</strong> Colaborador Administrativo ou Médico Designado
      </p>
      <p>
        <strong>3.2 Descrição do Processo:</strong>
      </p>
      <p>
        Antes de cada dia de aplicação de injeções intravítreas, deverá ser gerado um relatório contendo a lista de
        pacientes agendados, seus respectivos prontuários, lateralidade, doses indicadas e demais informações
        relevantes.
      </p>
      <p>
        <strong>3.3 Potenciais Riscos:</strong> Erro na Emissão de Relatórios, Falha na Atualização Automática do
        Sistema
      </p>
      <p>
        <strong>3.4 Medidas de Mitigação:</strong> Revisão detalhada dos relatórios gerados antes da aplicação das
        injeções.
      </p>

      <h2>4. Verificação Redundante e Conferência dos Relatórios</h2>
      <p>
        <strong>4.1 Responsável:</strong> Médico Responsável e Equipe Administrativa
      </p>
      <p>
        <strong>4.2 Descrição do Processo:</strong> Conferência Redundante dos relatórios com prontuários dos pacientes.
      </p>
      <p>
        <strong>4.3 Potenciais Riscos:</strong> Erro de Lateralidade, Falta de Encaminhamento para Reavaliação
      </p>
      <p>
        <strong>4.4 Medidas de Mitigação:</strong> Conferência obrigatória por dois profissionais distintos.
      </p>

      <h2>5. Execução do Procedimento e Conferência Final</h2>
      <p>
        <strong>5.1 Responsável:</strong> Médico Responsável pela Aplicação das Injeções
      </p>
      <p>
        <strong>5.2 Descrição do Processo:</strong> Conferência final pós-aplicação das injeções e atualização dos
        relatórios.
      </p>
      <ul>
        <li>Erro de Registro de Injeção</li>
        <li>Falta de Notificação de Ausências</li>
      </ul>
      <p>
        <strong>5.4 Medidas de Mitigação:</strong> Revisão final e correção imediata de prontuários dos pacientes
        ausentes.
      </p>

      <h2>Disposições Finais</h2>
      <p>
        Este POP deverá ser revisado periodicamente e atualizado conforme as alterações nas normativas internas do
        hospital ou em legislação aplicável.
      </p>
      <p>
        Todos os profissionais envolvidos são obrigados a seguir rigorosamente os procedimentos estabelecidos e reportar
        qualquer inconformidade ao Comitê de Qualidade.
      </p>

      <div className="flex justify-between mt-4">
        <Link href={'/'} className="btn btn-primary">
          Página Inicial
        </Link>
      </div>
    </article>
  );
}
