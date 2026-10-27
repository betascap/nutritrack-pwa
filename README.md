# NutriTrack

O NutriTrack é um diário nutricional pessoal em formato de Progressive Web App (PWA). A interface está em português do Brasil. Alimentos, refeições, metas, treinos e pesagens ficam no IndexedDB do navegador deste aparelho. O app não tem conta, análise de uso nem sincronização. A consulta opcional ao Open Food Facts envia somente a marca ou o código pesquisado, além dos dados normais de conexão; os registros pessoais não são enviados. Produtos conferidos e salvos ficam disponíveis offline. No iPhone com iOS 17 ou posterior, ele também pede o modo de armazenamento persistente e exibe em Ajustes se o navegador concedeu o pedido.

## Melhorias de qualidade e uso

- Registro de alimento em destaque, refeições agrupadas, seletor direto de data, totais parciais explícitos e ação de desfazer exclusões.
- Busca local sem depender de acentos, com palavras em qualquer ordem, favoritos, categorias e carregamento de mais resultados. Alimentos sem calorias ou com rótulo pendente podem ser ocultados pelo filtro “Prontos para registrar”.
- Consulta por marca ou código no Open Food Facts, com filtro opcional de Brasil, paginação, intervalo entre consultas, limite de tempo e conferência antes de salvar. O código pode ser digitado, lido pela câmera ou reconhecido em uma foto. A busca por marca usa filtros estruturados; não é uma busca livre por nome de produto.
- Leitura local da tabela nutricional por foto, com recorte, rotação, seleção explícita da coluna e da base (100 g, 100 ml ou outra porção). Todos os valores podem ser corrigidos antes de salvar. A imagem não é enviada ao Open Food Facts nem a um serviço de OCR, e não fica no backup ou no cadastro do alimento.
- Campos nutricionais em branco são desconhecidos. Zero é um valor informado. Essa distinção segue do cadastro ao diário, planejamento, médias e exportações.
- Editar a quantidade de um registro utiliza os valores salvos naquele registro. Alterar um alimento no catálogo não recalcula o histórico.
- Perfil salva altura, peso-alvo e peso inicial. Novos alimentos exigem calorias, base positiva e fonte. Cadastros, macros e backups recebem validação adicional.
- A estimativa exploratória de gasto exige 10 pesagens e pelo menos 10 dias completos, cobrindo 70% de um período de 14 a 28 dias. A ingestão média usa somente os dias elegíveis; a tela mostra a cobertura e avisa sobre possível subestimação se os dias omitidos tiverem consumo maior. Não altera metas nem exibe uma faixa de confiança sem validação estatística.
- Foco de teclado contido na janela, fechamento com Escape, retorno do foco, campos com rótulos associados, contraste aprimorado no tema escuro e verificação de layout a partir de 320 px.

Consulte a [revisão de qualidade](QUALITY_REVIEW.md) para decisões, limitações e validação.

## Abrir uma prévia no computador

Abra um terminal nesta pasta e inicie um servidor local:

```sh
python -m http.server 8000
```

Depois, acesse `http://localhost:8000` no navegador. O endereço `file://` pode permitir uma prévia limitada, mas a instalação como PWA e o funcionamento offline precisam de HTTP ou HTTPS. O endereço local funciona apenas no computador que está executando o servidor.

## Instalar no iPhone

1. Publique os arquivos desta pasta em uma hospedagem estática com HTTPS. A hospedagem entrega os arquivos do app; os registros pessoais permanecem no armazenamento local do navegador.
2. No iPhone, abra o endereço HTTPS no Safari.
3. Toque em **Compartilhar**, escolha **Adicionar à Tela de Início** e confirme.
4. Abra o NutriTrack pela Tela de Início uma vez enquanto estiver conectado. O service worker guarda os arquivos principais do app para uso offline.
5. Exporte backups JSON de tempos em tempos. Apagar os dados de sites do Safari pode remover o banco local.

Uma hospedagem estática com HTTPS pode servir os arquivos sem banco de dados ou servidor de aplicação. Pode haver custos do provedor ou de domínio, conforme o serviço escolhido. O HTTPS é necessário para o service worker e para a instalação normal da PWA.

## Recursos incluídos

- Diário diário de alimentos, calorias e macronutrientes, com edição e exclusão de registros.
- Catálogo local pesquisável com 597 itens da TACO 4ª edição, com os macros disponíveis por 100 g; alimentos comuns existentes mantêm suas porções e favoritos. Campos que a tabela não informa aparecem como — e os totais indicam quando um macro está incompleto. Itens de marcas e preparações sem correspondência na tabela ficam pendentes até serem configurados pelo rótulo.
- Aba **Plano** por data: associe modelos de refeição ao café da manhã, almoço, lanche ou jantar; consulte os totais planejados, lance ingredientes no diário sem apagar registros e veja dias planejados no calendário. O plano fica salvo separadamente do diário.
- Modelos de refeição editáveis, ação para salvar uma refeição do diário como modelo, lista dos 10 alimentos recentes e atalho para repetir cada refeição de ontem. A cópia adiciona itens sem apagar registros existentes.
- Calendário mensal com indicadores de diário, pesagens e plano; o resumo da data selecionada também mostra os treinos registrados. Treinos podem ser editados ou removidos no Hoje e no Calendário.
- Histórico de peso com escala adaptada ao período, datas reais no eixo horizontal, pesagens e tendência por média móvel exponencial (alfa 0,1 por pesagem); inclui mudança semanal da tendência, cintura opcional e filtros de 7, 30, 90 dias ou período completo.
- Registro de corrida, musculação e jiu-jítsu com duração, distância, esforço percebido e notas; os treinos podem ser editados ou removidos. A estimativa de calorias usa a pesagem mais recente até a data do treino ou o peso inicial ajustável em Perfil. O app não desconta calorias de exercício da meta alimentar.
- Registro opcional de água com ação para desfazer cada lançamento; tema escuro; exportação Excel `.xlsx` com abas de resumo diário, diário alimentar, treinos, pesagens, planos, alimentos, modelos e metas; backup e restauração JSON v2 e exportação CSV. O backup usa a folha de compartilhamento quando o navegador permite compartilhar arquivos; nos demais casos, dispara o download. A data do último backup só é gravada após compartilhar ou disparar o download; cancelar a folha mantém a data anterior. O app avisa quando o último backup JSON tem mais de 7 dias.
- Ao criar um alimento, informe a quantidade base (100 g/ml ou 1 unidade/fatia/colher/porção/medida), os valores nutricionais por essa base e a fonte no campo de observação. É possível cadastrar medidas caseiras em gramas e selecioná-las ao registrar o alimento.
- Marcação de dia completo por data; Progresso mostra médias dos dias completos nos últimos sete dias, aderência dentro de ±10% da meta e proteína em g/kg. Macros incompletos não são apresentados como médias completas. O gasto adaptativo é uma estimativa exploratória com a premissa simplificada de 7.700 kcal/kg; não altera as metas.
- O service worker instala HTML, estilos, código e catálogo como uma versão completa. Quando há versão nova, oferece “Nova versão disponível — toque para atualizar”. A versão instalada continua disponível offline. Os ícones PNG atendem à instalação no iPhone e a ícones maskable.

## Observações

- A fonte nutricional do catálogo é a [TACO 4ª edição do NEPA/UNICAMP](https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/). Produtos e preparações sem correspondência na tabela ficam bloqueados até receberem valores do rótulo; configure o ISO100, o tamanho da medida e os demais itens pendentes em **Ajustes → Alimentos**. Os campos marcados como traço são tratados como zero; valores indisponíveis aparecem como —, e itens sem valor calórico não podem ser registrados até você informar esse valor. Depois, ajuste os ingredientes e as quantidades do modelo de shake.
- Os dados ficam neste navegador e não são sincronizados entre aparelhos. Atualizar o app preserva o diário e os alimentos que você personalizou; os padrões antigos do catálogo recebem os novos dados quando não foram editados. Restaurar um backup substitui o conjunto local atual após confirmação. A importação valida os registros antes de gravar e restaura as sete stores do IndexedDB numa única transação; também aceita backups JSON v2 antigos que ainda não tinham as listas de treinos, modelos ou planos. O marcador de dia completo reutiliza a store `plans`, sem remover ou renomear stores existentes.
- Esta versão usa JavaScript do navegador e IndexedDB. Os leitores ZXing e Tesseract são fornecidos com o app, na pasta `vendor`, e executam no aparelho. Ela não usa React, TypeScript nem Dexie.

## Fontes e manutenção

A TACO permanece como base local, com os 597 identificadores originais. A versão 4 do catálogo corrige categorias e trata quatro resultados analíticos de carboidratos ligeiramente negativos como zero para cálculo; o valor recebido da fonte fica em `sourceCarbohydrate`. Alimentos personalizados, favoritos e registros históricos são preservados. Backups antigos com esses quatro valores continuam aceitos.

Produtos importados têm identificador `off-<código>`, campo `source`, link `sourceUrl` e código de barras. Os dados colaborativos do [Open Food Facts](https://world.openfoodfacts.org) estão sob [ODbL](https://opendatacommons.org/licenses/odbl/1-0/). A consulta usa a API v2 para filtros estruturados e nutrientes normalizados por 100 g/ml, com no máximo uma nova consulta a cada 6,5 segundos nesta sessão. Falhas do serviço não bloqueiam o diário local. A disponibilidade e a atualização de rótulos dependem do catálogo externo.

O aplicativo usa cópias locais dos leitores ZXing e Tesseract; não carrega esses motores de um CDN. Playwright e Prettier são ferramentas de desenvolvimento. Os arquivos incluem `app.js`, `nutrition-utils.js`, `food-catalog.js`, `label-parser.js`, `capture.js`, `capture-ui.js` e estilos. Alterações do aplicativo devem atualizar a versão do cache em `sw.js`. Alterar os motores ou o modelo de português exige também atualizar `READER_CACHE` e regenerar `vendor/manifest.json`.

## Usar câmera e foto da tabela

1. Abra **Registrar alimento → Escanear código**. Permita a câmera e enquadre todas as barras. O app verifica o código e procura primeiro no catálogo do aparelho; se necessário, consulta o Open Food Facts. Você também pode escolher uma foto do código ou digitar os números.
2. Para a tabela, use **Registrar alimento → Fotografar tabela**. Tire uma foto ou escolha uma imagem de até 20 MB. Você pode girar a foto e arrastar para selecionar somente a tabela.
3. Toque em **Ler tabela nutricional**. Na primeira leitura, conecte-se à internet: os motores e o modelo de português, cerca de 10 MB, são preparados no aparelho. Depois, a leitura funciona offline enquanto o navegador mantiver os arquivos locais. A foto não é enviada nem armazenada no cadastro.
4. Confira o texto e selecione a coluna desejada, sem usar `%VD`. Confirme se os valores são por 100 g, 100 ml ou por outra porção e informe essa quantidade. Não há conversão silenciosa entre as colunas.
5. Confira os valores e o nome do alimento na etapa seguinte antes de salvar. Se a foto falhar, você pode tentar outra, corrigir o texto reconhecido ou usar o texto copiado da tabela. Valores ausentes continuam desconhecidos.

A câmera requer HTTPS ou localhost, permissão e um navegador compatível com acesso à câmera. Os testes usam imagens geradas e vídeo sintético no Chrome/Windows; o uso com uma câmera física e Safari/iPhone ainda exige conferência. Rótulos borrados, curvos ou com reflexos podem produzir erros; a revisão pelo usuário faz parte do fluxo.

## Testes

Com Node.js instalado, os testes de lógica não exigem pacotes adicionais:

```sh
node --test tests/*.test.cjs
```

Para os testes de navegador, instale as dependências e o Chromium:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test:browser
pnpm test:capture
```

O teste inicia e encerra seu próprio servidor local e usa um perfil isolado com dados sintéticos. As respostas externas de produtos são simuladas. É possível usar um navegador existente com `CHROME_PATH` e um pacote Playwright já instalado com `PLAYWRIGHT_MODULE`. `SCREENSHOT_DIR` salva capturas opcionais fora do repositório.

`test:capture` executa os motores reais de código de barras e OCR com imagens geradas e vídeo sintético. Verifica também permissão negada, encerramento da câmera, cancelamento, porção, ausência de envio de imagens, preparação inicial e leitura offline. Para reproduzir os arquivos dos leitores, execute `pnpm vendor:readers`; as versões e hashes estão em [vendor/manifest.json](vendor/manifest.json), com licenças em `vendor/licenses`. Publique a pasta `vendor` junto aos demais arquivos do aplicativo.
