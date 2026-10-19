# NutriTrack

O NutriTrack é um diário nutricional pessoal em formato de Progressive Web App (PWA). A interface está em português do Brasil. Alimentos, refeições, metas, treinos e pesagens ficam no IndexedDB do navegador deste aparelho. O app não tem conta, análise de uso, API externa de nutrição nem sincronização. No iPhone com iOS 17 ou posterior, ele também pede o modo de armazenamento persistente e exibe em Ajustes se o navegador concedeu o pedido.

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
- Catálogo local pesquisável com cerca de 10 opções em cada categoria (pães, proteínas, frutas, acompanhamentos, vegetais, laticínios, cereais, frios, lanches e suplementos). Os valores nutricionais são estimativas identificadas como tal e podem ser ajustados conforme o rótulo.
- Aba **Plano** por data: associe modelos de refeição ao café da manhã, almoço, lanche ou jantar; consulte os totais planejados, lance ingredientes no diário sem apagar registros e veja dias planejados no calendário. O plano fica salvo separadamente do diário.
- Refeições reutilizáveis, modelos iniciais e cópia de refeições de um dia para outro com confirmação; os registros existentes são preservados.
- Calendário mensal com indicadores separados para registros de alimentos e pesagens.
- Histórico de peso com gráfico das medições registradas, média das últimas sete pesagens, campo opcional para cintura e visualizações de 7, 30, 90 dias ou todo o período.
- Registro de corrida, musculação e jiu-jítsu, com duração, distância, esforço percebido, notas e estimativa aproximada de calorias. O cálculo considera o peso registrado mais recente até a data do treino (ou 102 kg iniciais), a duração e, quando informado, ritmo ou esforço. O app não desconta calorias de exercício da meta alimentar.
- Registro opcional de água, tema escuro, exportação Excel `.xlsx` com abas de resumo diário, diário alimentar, treinos, pesagens, planos, alimentos, modelos e metas; backup e restauração JSON e exportação CSV de alimentos, peso e treinos.
- Estimativa local de gasto por exercício baseada em METs de referência; serve apenas como orientação, não como medição individual.
- Arquivos principais disponíveis offline após o primeiro carregamento online bem-sucedido. Alterações feitas offline são gravadas localmente.

## Observações

- Os valores do catálogo inicial são estimativas. Corrija-os usando o rótulo do produto ou uma fonte confiável. O ISO100 começa sem valores nutricionais preenchidos; configure o sabor, o tamanho da medida e os dados do rótulo em **Ajustes → Alimentos**. Depois, ajuste os ingredientes e as quantidades do modelo de shake.
- Os dados ficam neste navegador e não são sincronizados entre aparelhos. Restaurar um backup substitui o conjunto local atual após confirmação. A importação valida a estrutura do arquivo; não mescla backups.
- Esta versão funcional foi feita com JavaScript do navegador e IndexedDB, sem dependências externas. Ela não usa React, TypeScript nem Dexie. Portanto, a implementação não atende a esse requisito técnico do pedido original, embora forneça o diário PWA funcional e local.
