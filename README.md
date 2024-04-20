# Manual de Uso

## Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades Principais](#funcionalidades-principais)
3. [Instruções de Uso](#instruções-de-uso)
4. [Tutorial: Emissão de Relatório no Integra](#tutorial-emissão-de-relatório-no-integra)
5. [Autoria e Créditos](#autoria-e-créditos)

## Visão Geral:

Este código é uma aplicação web que permite carregar arquivos no formato XLS, XLSX ou CSV gerados no INTEGRA, processá-los e gerar um PDF preenchido com os dados desses arquivos. O PDF gerado é uma versão personalizada de um modelo padrão, onde os dados carregados são inseridos em campos específicos.

## Funcionalidades Principais:

1. **Carregamento de Arquivo:**
   - Os usuários podem carregar arquivos nos formatos XLS, XLSX ou CSV gerados no INTEGRA.
   - Os arquivos carregados devem seguir as seguintes regras:
     - A primeira linha de dados deve iniciar na quinta linha do arquivo.
     - O número do prontuário do paciente deve estar na primeira coluna.
     - O nome do paciente deve estar na terceira coluna.
     - O nome do profissional deve estar na sexta coluna.
     - O tratamento deve estar na décima primeira coluna.
   - Essas regras devem ser seguidas para garantir o processamento correto dos dados e o preenchimento adequado do PDF.

2. **Processamento de Arquivo:**
   - Os arquivos carregados são processados para extrair os dados relevantes, conforme as regras especificadas.
   - Dependendo do formato do arquivo (CSV, XLS ou XLSX), os dados são extraídos de maneira apropriada.

3. **Preenchimento do PDF:**
   - Os dados extraídos dos arquivos são inseridos em campos específicos de um modelo PDF padrão.
   - O preenchimento é realizado em várias páginas do PDF, seguindo um layout predefinido.

4. **Ordenação das Páginas do PDF:**
   - As páginas preenchidas do PDF são ordenadas de acordo com um layout específico.

5. **Visualização do PDF:**
   - Após o processamento e a geração do PDF, os usuários podem visualizar o PDF resultante.
   - O PDF gerado será aberto automaticamente em uma nova guia do navegador.

## Instruções de Uso:

1. **Carregar Arquivo:**
   - Clique no botão "Escolher arquivo" e selecione um arquivo nos formatos XLS, XLSX ou CSV [gerados no INTEGRA](#tutorial-emissão-de-relatório-no-integra).
   - Certifique-se de que o arquivo selecionado segue as regras especificadas para garantir o processamento correto.
   - Caso o arquivo não esteja no formato correto ou não siga as regras especificadas, o processo de processamento e geração do PDF pode falhar.

2. **Processar Arquivo:**
   - Após selecionar o arquivo, clique no botão "Processar".
   - Aguarde até que o processo de carregamento e processamento do arquivo seja concluído.
   - Durante o processamento, uma barra de progresso pode ser exibida para indicar o progresso do processo.

3. **Visualizar PDF:**
   - Após o processamento bem-sucedido, o PDF preenchido será gerado.
   - O PDF gerado será aberto automaticamente em uma nova guia do navegador.
   - Você pode visualizar e baixar o PDF conforme necessário.

4. **Considerações Adicionais:**
   - Certifique-se de que os arquivos carregados estejam no formato correto (XLS, XLSX ou CSV gerados no INTEGRA).
   - Verifique se os dados nos arquivos seguem as regras especificadas para garantir o preenchimento correto do PDF.

## Tutorial: Emissão de Relatório no Integra

Para utilizar o aplicativo e gerar o PDF preenchido, primeiro você precisará obter um arquivo nos formatos XLS, XLSX ou CSV gerado no Integra. Siga os passos abaixo para emitir o relatório no Integra:

1. **Acesso ao Integra:**
   - Acesse o Integra utilizando suas credenciais de usuário.

2. **Navegação para Relatórios:**
   - Após o login, navegue até a aba de "Relatórios" no menu superior.

3. **Seleção de Relatórios por Ambulatório e Especialidades:**
   - Dentro da seção de relatórios, localize e selecione a opção "Relatórios por Ambulatório e Especialidades".

4. **Definição do Intervalo de Datas:**
   - Digite o intervalo de datas desejado para o relatório.

5. **Seleção do Tipo de Tratamento:**
   - Selecione o tipo de tratamento desejado, como "EYLIA - Injeção Intravítria" ou "Avastin - Injeção Intravítria".

6. **Busca e Download da Planilha:**
   - Após configurar os filtros necessários, clique em "Buscar" para gerar o relatório correspondente.
   - Localize a opção para fazer o download da planilha gerada e clique para baixá-la em um formato compatível (XLS, XLSX ou CSV).

Após seguir esses passos e obter o arquivo do relatório no Integra, você estará pronto para carregar e processar o arquivo no aplicativo, conforme descrito nas instruções de uso.

## Autoria e Créditos:

Este código foi desenvolvido por @leonunesbs. Para mais informações, sugestões ou suporte, entre em contato com o autor.
