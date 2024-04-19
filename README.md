### Manual de Uso para o Código

#### Visão Geral:

Este código é uma aplicação web que permite carregar arquivos no formato XLS, XLSX ou CSV gerados no INTEGRA, processá-los e gerar um PDF preenchido com os dados desses arquivos. O PDF gerado é uma versão personalizada de um modelo padrão, onde os dados carregados são inseridos em campos específicos.

#### Funcionalidades Principais:

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

#### Instruções de Uso:

1. **Carregar Arquivo:**

   - Clique no botão "Escolher arquivo" e selecione um arquivo nos formatos XLS, XLSX ou CSV gerados no INTEGRA.
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

#### Autoria e Créditos:

Este código foi desenvolvido por @leonunesbs. Para mais informações, sugestões ou suporte, entre em contato com o autor através do Instagram.
