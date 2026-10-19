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
- Catálogo local pesquisável com 597 itens da TACO 4ª edição, com os macros disponíveis por 100 g; alimentos comuns existentes mantêm suas porções e favoritos. Campos que a tabela não informa aparecem como — e os totais indicam quando um macro está incompleto. Itens de marcas e preparações sem correspondência na tabela ficam pendentes até serem configurados pelo rótulo.
- Aba **Plano** por data: associe modelos de refeição ao café da manhã, almoço, lanche ou jantar; consulte os totais planejados, lance ingredientes no diário sem apagar registros e veja dias planejados no calendário. O plano fica salvo separadamente do diário.
- Modelos de refeição editáveis, ação para salvar uma refeição do diário como modelo, lista dos 10 alimentos recentes e atalho para repetir cada refeição de ontem. A cópia adiciona itens sem apagar registros existentes.
- Calendário mensal com indicadores de diário, pesagens e plano; o resumo da data selecionada também mostra os treinos registrados. Treinos podem ser editados ou removidos no Hoje e no Calendário.
- Histórico de peso com escala adaptada ao período, datas reais no eixo horizontal, pesagens e tendência por média móvel exponencial (alfa 0,1 por pesagem); inclui mudança semanal da tendência, cintura opcional e filtros de 7, 30, 90 dias ou período completo.
- Registro de corrida, musculação e jiu-jítsu com duração, distância, esforço percebido e notas; os treinos podem ser editados ou removidos. A estimativa de calorias usa a pesagem mais recente até a data do treino ou o peso inicial ajustável em Perfil. O app não desconta calorias de exercício da meta alimentar.
- Registro opcional de água com ação para desfazer cada lançamento; tema escuro; exportação Excel `.xlsx` com abas de resumo diário, diário alimentar, treinos, pesagens, planos, alimentos, modelos e metas; backup e restauração JSON v2 e exportação CSV. O app avisa quando o último backup JSON tem mais de 7 dias.
- Ao criar um alimento, informe a quantidade base (100 g/ml ou 1 unidade/fatia/colher/porção/medida), os valores nutricionais por essa base e a fonte no campo de observação. É possível cadastrar medidas caseiras em gramas e selecioná-las ao registrar o alimento.
- Marcação de dia completo por data; Progresso mostra médias semanais de calorias e macros, aderência dentro de ±10% da meta e proteína em g/kg. Após 14 dias completos e 10 pesagens, exibe gasto adaptativo com faixa de incerteza: “estimativa; premissa de 7.700 kcal/kg”.
- Service worker usa rede primeiro para atualizar a tela inicial e cache primeiro para os outros arquivos; quando há versão nova, oferece “Nova versão disponível — toque para atualizar”. Os ícones PNG atendem à instalação no iPhone e a ícones maskable.

## Observações

- A fonte nutricional do catálogo é a [TACO 4ª edição do NEPA/UNICAMP](https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/). Produtos e preparações sem correspondência na tabela ficam bloqueados até receberem valores do rótulo; configure o ISO100, o tamanho da medida e os demais itens pendentes em **Ajustes → Alimentos**. Os campos marcados como traço são tratados como zero; valores indisponíveis aparecem como —, e itens sem valor calórico não podem ser registrados até você informar esse valor. Depois, ajuste os ingredientes e as quantidades do modelo de shake.
- Os dados ficam neste navegador e não são sincronizados entre aparelhos. Atualizar o app preserva o diário e os alimentos que você personalizou; os padrões antigos do catálogo recebem os novos dados quando não foram editados. Restaurar um backup substitui o conjunto local atual após confirmação. A importação valida os registros antes de gravar e restaura as sete stores do IndexedDB numa única transação; também aceita backups JSON v2 antigos que ainda não tinham as listas de treinos, modelos ou planos. O marcador de dia completo reutiliza a store `plans`, sem remover ou renomear stores existentes.
- Esta versão funcional foi feita com JavaScript do navegador e IndexedDB, sem dependências externas. Ela não usa React, TypeScript nem Dexie. Portanto, a implementação não atende a esse requisito técnico do pedido original, embora forneça o diário PWA funcional e local.
