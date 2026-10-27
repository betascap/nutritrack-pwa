# Revisão de qualidade do NutriTrack

Data: 27 de outubro de 2026. Base revisada: `be6e4d82d99fc846b2d72db7e00081fd74f50d34`.

O maior ganho está na confiança dos dados e na velocidade de registro. O app já tinha os 597 itens da TACO, planejamento, histórico, treinos e backup. A busca pouco tolerante, os resultados limitados e a mistura entre zero e informação ausente dificultavam aproveitar esses recursos. A revisão inclui implementação e testes com dados sintéticos, sem acessar o diário pessoal do usuário.

## Diagnóstico e implementação

| Prioridade | Problema encontrado | Mudança realizada |
|---|---|---|
| Alta | Busca literal com acentos e limite de nove resultados | Normalização de acentos, combinação de palavras, ordenação, filtros e carregamento adicional |
| Alta | Produtos de marcas exigiam digitação integral | Consulta opcional por marca/código, conferência e cadastro offline com origem identificada |
| Alta | Calorias e macros em branco viravam zero em cadastros/manuais | Calorias obrigatórias, macros desconhecidos explícitos, validação de base e números |
| Alta | Planejamento descartava a indicação de macros ausentes | Metadados preservados entre plano, diário, médias e exportações |
| Alta | Editar quantidade usava o catálogo atual e alterava o significado do histórico | Recálculo pela composição salva no próprio registro |
| Alta | Salvar perfil ignorava altura e peso-alvo | Todos os campos do perfil são persistidos |
| Alta | Estimativa de gasto misturava ingestão histórica com mudança recente de peso | Mesmo intervalo para alimentação e pesagens, cobertura mínima e retirada da faixa fixa de ±300 kcal |
| Alta | Atualização podia combinar documento novo com arquivos antigos | Versão completa do aplicativo instalada pelo service worker |
| Média | Categorias genéricas em parte do catálogo | Grupos da TACO aplicados pelos identificadores originais; migração preserva personalizações |
| Média | Quatro carboidratos analíticos ligeiramente negativos | Zero no cálculo e valor original preservado; compatibilidade com backups anteriores |
| Média | Registro principal pouco visível e refeições fragmentadas | Botão principal no início, cartões agrupados e acesso direto à data |
| Média | Exclusão interrompia o fluxo com confirmação | Remoção com ação Desfazer por dez segundos |
| Média | Contraste escuro, foco e campos sem associação de rótulo | Ajustes de contraste, foco contido, Escape, retorno de foco e rótulos associados |
| Média | Campos e calendário podiam extrapolar celulares estreitos | Grades flexíveis e verificação de todas as abas em 320, 390 e 1440 px |
| Média | Código, estilos e grande catálogo concentrados no HTML | Arquivos separados e funções de cálculo/busca testáveis |

## Decisões sobre nutrição e catálogo

Aumentar a quantidade de nomes sem verificar composição acrescentaria falsa precisão. A expansão implementada permite consultar produtos reais por marca ou código e salvar os que forem conferidos. A TACO continua disponível offline, com seus 597 identificadores. A quantidade de produtos locais aumenta conforme o usuário os salva; esta atualização não acrescenta um pacote fixo de milhares de alimentos.

Os valores do Open Food Facts são colaborativos e devem ser comparados com a embalagem, incluindo a base de 100 g ou 100 ml. A consulta usa somente nutrientes normalizados dessa base; valores por porção não são tratados como valores por 100 g. Campos ausentes permanecem desconhecidos, e produtos sem calorias ou com valores fora dos limites aceitos não são importados. O código de barras é digitado; leitura de câmera pode ser considerada em uma próxima etapa após validar a cobertura real de produtos utilizados.

O gasto calculado pela variação de peso continua sendo exploratório. A premissa de 7.700 kcal/kg e o efeito da hidratação limitam sua interpretação. Não foi feita validação clínica da estimativa e nenhuma meta pessoal foi prescrita ou alterada automaticamente. A apresentação evita afirmar uma faixa estatística de confiança que não foi estimada. O exercício continua separado da meta alimentar.

Login e sincronização precisam de um projeto específico para privacidade, recuperação e conflitos entre aparelhos. A manutenção do modo local permite preservar a experiência offline e a estrutura atual dos registros. Captura automática por foto também exige avaliação própria de erro de alimento e porção. Essas funcionalidades não entram nesta revisão.

## Validação executada

- 14 testes de lógica: busca, filtros, ausência versus zero, validação, conversão kJ/kcal, produtos por 100 g/ml, normalização legada e alinhamento da estimativa de gasto.
- 17 verificações de navegador: catálogo, busca, registro, clique repetido, edição histórica, desfazer, perfil, cadastro, totais incompletos, lançamento manual, teclado, produto externo, planejamento, backup, restauração inválida, telas responsivas e uso offline. A verificação de layout percorre as cinco abas, três larguras e os dois temas.
- Respostas de consulta de produtos simuladas para repetibilidade. Uma consulta real de leitura no ambiente público de testes do Open Food Facts retornou HTTP 200, produto e nutrientes normalizados; cabeçalho de CORS `*` presente.
- Revisão visual de capturas de celular e computador. Verificação sintática do JavaScript e verificação de espaços do Git.

Os testes foram executados em Chrome no Windows. O comportamento do Safari/iPhone físico não foi testado nesta sessão; o app conserva IndexedDB, nomes de stores e formato JSON v2. As sete stores existentes permanecem disponíveis. Publicação exige integrar a proposta e testar a atualização no endereço já utilizado pelo usuário, pois o armazenamento do navegador é vinculado à origem.

## Referências

- [TACO, 4ª edição, NEPA/UNICAMP](https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf): composição e identificadores da base local.
- [Documentação oficial do Open Food Facts](https://openfoodfacts.github.io/openfoodfacts-server/api/): consultas estruturadas, limites de uso e ambiente de testes.
- [Esquema de produto e nutrientes do Open Food Facts](https://openfoodfacts.github.io/documentation/docs/Product-Opener/schemas/schemas/product/): valores normalizados por 100 g ou 100 ml.
