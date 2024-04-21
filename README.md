# Guia Prático para Injeções Intravítreas: Uso da Aplicação HGF e Protocolos de Checagem de Prontuário

Este manual combinado fornece um guia completo sobre como utilizar a aplicação web HGF Injeções para facilitar o preenchimento automático e a geração de documentos PDF a partir de dados médicos, bem como instruções detalhadas para a checagem de prontuários no contexto de tratamentos com injeções.

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Instruções de Uso](#instruções-de-uso)
  - [Carregar Arquivo](#carregar-arquivo)
  - [Processar Arquivo](#processar-arquivo)
  - [Visualizar PDF](#visualizar-pdf)
- [Tutorial: Checagem de Prontuário](#tutorial-checagem-de-prontuário)
  - [Primeira Injeção](#primeira-injeção)
  - [Injeções Subsequentes](#injeções-subsequentes)
  - [Última Injeção e Conclusão de Tratamento](#última-injeção-e-conclusão-de-tratamento)
- [Tutorial: Emissão de Relatório no Integra](#tutorial-emissão-de-relatório-no-integra)
- [Autoria e Créditos](#autoria-e-créditos)

## Visão Geral

A aplicação HGF Injeções foi desenvolvida para otimizar o processo de documentação de procedimentos médicos, transformando arquivos de dados em documentos PDF estruturados. Complementarmente, o tutorial de checagem de prontuário orienta sobre como verificar a adequação e a sequência de tratamentos com injeções.

## Funcionalidades Principais

- **Carregamento de Arquivo:** Suporte a XLS, XLSX ou CSV com dados de pacientes e procedimentos médicos.
- **Processamento de Arquivo:** Extração e validação das informações dos arquivos, preparando para geração do PDF.
- **Preenchimento do PDF:** Geração de documentos PDF a partir de um modelo pré-definido com os dados processados.
- **Ordenação e Visualização do PDF:** Organização lógica das páginas do PDF e opções para visualização, download ou impressão.

## Instruções de Uso

### Carregar Arquivo

1. Acesse a aplicação e localize o campo de carregamento de arquivo.
2. Selecione o arquivo nos [formatos aceitos](#tutorial-emissão-de-relatório-no-integra) e confirme o carregamento.

### Processar Arquivo

1. Clique em "Processar" após o carregamento do arquivo.
2. Acompanhe o processamento até a conclusão.

### Visualizar PDF

1. Após o processamento, o PDF estará disponível para visualização.
2. Baixe ou imprima o documento conforme necessário.

## Tutorial: Checagem de Prontuário

### Primeira Injeção

- Para a primeira injeção indicada, localize a última página de indicação de injeções.
- **Verifique a lateralidade** (OD, OE, AO) e a quantidade de injeções indicadas.
- No mapa de injeções, marque um ✅ no olho indicado.

### Injeções Subsequentes

- Contabilize os documentos de descrição cirúrgica presentes, cada injeção corresponde a 3 documentos adicionais.
- No mapa, verifique quais injeções já foram realizadas e em quais olhos.

### Última Injeção e Conclusão de Tratamento

- Para a última injeção, marque com a letra R (de retorno) e preencha o formulário de retorno para os staffs da Retina com o motivo Pós AA.
- Se todas as injeções prescritas foram realizadas, marque no mapa como (Concluído) e preencha um retorno.

## Tutorial: Emissão de Relatório no Integra

Para gerar um relatório no Integra adequado para uso com esta aplicação, siga os passos abaixo:

1. **Acesso ao Integra:** Entre no sistema Integra com suas credenciais.
2. **Navegação até Relatórios:** Selecione a opção de relatórios no menu principal.
3. **Emissão do Relatório:** Escolha o tipo de relatório desejado, defina os filtros necessários e proceda com a emissão do relatório.
4. **Download do Arquivo:** Faça o download do relatório gerado em um dos formatos aceitos pela aplicação (XLS, XLSX, CSV).

## Autoria e Créditos

Desenvolvida por @leonunesbs. Para suporte ou mais informações, visite o [repositório no GitHub](https://github.com/leonunesbs).

Este manual combinado oferece uma visão abrangente e detalhada tanto da utilização da aplicação HGF Injeções quanto do

procedimento para a checagem de prontuários, assegurando um processo mais eficiente e organizado para os profissionais envolvidos.
