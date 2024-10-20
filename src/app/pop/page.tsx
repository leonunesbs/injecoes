// src/app/pop/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'POP - Procedimento Operacional Padrão para Injeções Intravítreas',
  description: `Procedimento Operacional Padrão (POP) para a execução de injeções intravítreas no Setor de Oftalmologia do Hospital Geral de Fortaleza, garantindo segurança e precisão no acompanhamento dos pacientes.`,
  keywords: [
    'POP oftalmologia',
    'injeções intravítreas',
    'procedimentos médicos',
    'Oftalmologia HGF',
    'procedimento operacional padrão',
    'retina',
    'hospital',
  ],
  openGraph: {
    title: 'POP - Procedimento Operacional Padrão para Injeções Intravítreas',
    description:
      'Guia detalhado dos procedimentos para injeções intravítreas no Setor de Oftalmologia do Hospital Geral de Fortaleza (HGF).',
    url: 'https://antivegf.vercel.app/pop',
    siteName: 'POP - Setor de Oftalmologia HGF',
    images: [
      {
        url: 'https://antivegf.vercel.app/pop-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'POP - Injeções Intravítreas',
      },
    ],
    locale: 'pt_BR',
    type: 'article',
  },

  alternates: {
    canonical: 'https://antivegf.vercel.app/pop',
    languages: {
      'pt-BR': 'https://antivegf.vercel.app/pop',
    },
  },
};

export default function PopPage() {
  return (
    <article className="container mx-auto py-12 prose text-justify">
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
        <strong>1.2 Descrição do Processo:</strong> Durante o atendimento ambulatorial, o médico identificará a
        necessidade de aplicação de injeção intravítrea conforme os critérios clínicos estabelecidos, com base em
        diagnóstico documentado e respaldado por exame oftalmológico.
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
        <strong>2.2 Descrição do Processo:</strong> Após o preenchimento e envio do formulário de indicação ao NIR, o
        médico assistente ou colaborador administrativo responsável deverá proceder com o registro do paciente no
        sistema AntiVEGF, garantindo a correta inserção dos dados referentes ao número do prontuário e quantidade de
        doses necessárias para cada olho. Este processo tem por finalidade a gestão eficiente das doses indicadas,
        possibilitando o acompanhamento detalhado da evolução do tratamento e evitando a duplicidade de informações ou a
        aplicação indevida em olho não indicado.
      </p>
      <p>
        <strong>2.3 Potenciais Riscos:</strong> Erro no Registro no Sistema: Dados incorretos podem resultar em falhas
        na administração da dose ou no controle inadequado do número de injeções pendentes. Perda de Rastreamento das
        Doses: A não atualização do sistema pode acarretar em perda de controle sobre as doses restantes e comprometer a
        segurança do tratamento.
      </p>
      <p>
        <strong>2.4 Medidas de Mitigação:</strong> Implementar dupla conferência dos dados inseridos no sistema AntiVEGF
        por parte de dois profissionais distintos (médico e colaborador administrativo), assegurando que não haja
        incongruências entre o prontuário clínico e o sistema de gestão de injeções.
      </p>

      <h2>3. Emissão de Relatórios Pré-Procedimento</h2>
      <p>
        <strong>3.1 Responsável:</strong> Colaborador Administrativo ou Médico Designado
      </p>
      <p>
        <strong>3.2 Descrição do Processo:</strong> Antes de cada dia de aplicação de injeções intravítreas, deverá ser
        gerado um relatório contendo a lista de pacientes agendados, seus respectivos prontuários, lateralidade, doses
        indicadas e demais informações relevantes. Este relatório será processado no sistema AntiVEGF para gerar
        automaticamente os formulários clínicos necessários: receituário, relatório cirúrgico e relatório de alta.
      </p>
      <p>
        <strong>3.3 Potenciais Riscos:</strong> Erro na Emissão de Relatórios: Dados incorretos ou incompletos podem
        resultar em aplicação equivocada de doses. Falha na Atualização Automática do Sistema: A não atualização
        adequada compromete o acompanhamento correto do paciente.
      </p>
      <p>
        <strong>3.4 Medidas de Mitigação:</strong> Revisão detalhada dos relatórios gerados antes da aplicação das
        injeções, com verificação cruzada junto ao prontuário físico do paciente e sistema eletrônico hospitalar.
      </p>

      <h2>4. Verificação Redundante e Conferência dos Relatórios</h2>
      <p>
        <strong>4.1 Responsável:</strong> Médico Responsável e Equipe Administrativa
      </p>
      <p>
        <strong>4.2 Descrição do Processo:</strong> O relatório emitido, contendo a lateralidade e doses a serem
        aplicadas, deverá ser obrigatoriamente conferido junto aos prontuários dos pacientes para garantir que os dados
        estejam corretos. Este procedimento de dupla verificação deve ser realizado antes do início das injeções.
      </p>
      <p>
        <strong>4.3 Potenciais Riscos:</strong> Erro de Lateralidade: A não conferência adequada da lateralidade pode
        resultar em aplicação indevida da injeção no olho incorreto. Falta de Encaminhamento para Reavaliação: Pacientes
        que completaram o ciclo de injeções podem não ser devidamente reavaliados, comprometendo o acompanhamento
        clínico.
      </p>
      <p>
        <strong>4.4 Medidas de Mitigação:</strong> Implementar a conferência obrigatória dos relatórios por dois
        profissionais distintos e inserção de uma checagem final antes do procedimento.
      </p>

      <h2>5. Execução do Procedimento e Conferência Final</h2>
      <p>
        <strong>5.1 Responsável:</strong> Médico Responsável pela Aplicação das Injeções
      </p>
      <p>
        <strong>5.2 Descrição do Processo:</strong> Ao término da sessão de injeções, o médico responsável deve proceder
        com a conferência de todos os olhos injetados e confirmar as informações no relatório de alta do paciente,
        assinando o documento e garantindo sua acurácia. Correção de Faltas: O médico deverá também verificar quais
        pacientes faltaram ao procedimento e proceder com a devida correção nos registros, já que o sistema considera
        que a injeção foi realizada no momento da emissão do relatório.
      </p>
      <p>
        <strong>5.3 Potenciais Riscos:</strong> Erro de Registro de Injeção: O não registro correto das injeções pode
        comprometer a continuidade do tratamento. Falta de Notificação de Ausências: Pacientes que faltaram podem não
        ter seus tratamentos reagendados corretamente.
      </p>
      <p>
        <strong>5.4 Medidas de Mitigação:</strong> Estabelecer uma revisão final pós-aplicação, com confirmação das
        injeções realizadas e correção imediata dos prontuários dos pacientes ausentes.
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
      <p className="mt-4 text-sm text-gray-500">
        Última atualização: <time dateTime="2024-10-20">20 de outubro de 2024</time>
      </p>
      <div className="flex justify-between mt-4">
        <Link href={'/'} className="btn btn-primary">
          Página Inicial
        </Link>
      </div>
    </article>
  );
}
