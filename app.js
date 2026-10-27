(() => {
  "use strict";
  const { TACO4, TACO_ALL } = window.NutriCatalog;
  const {
    searchFoods,
    validNutrition,
    normalizeText,
    offProduct,
    adaptiveEstimate,
    normalizeLegacyFood,
  } = window.NutriTools;
  const foodsSeed = [
    ["Pão francês", "Pães", 300, 8, 58, 3, "Estimativa"],
    ["Pão integral", "Pães", 247, 13, 41, 4, "Estimativa"],
    ["Ovo inteiro", "Proteínas", 143, 13, 1, 10, "Estimativa"],
    ["Banana", "Frutas", 89, 1.1, 23, 0.3, "Estimativa"],
    ["Maçã", "Frutas", 52, 0.3, 14, 0.2, "Estimativa"],
    ["Arroz cozido", "Acompanhamentos", 130, 2.7, 28, 0.3, "Estimativa"],
    ["Feijão cozido", "Acompanhamentos", 76, 4.8, 14, 0.5, "Estimativa"],
    ["Peito de frango grelhado", "Proteínas", 165, 31, 0, 3.6, "Estimativa"],
    ["Carne bovina magra grelhada", "Proteínas", 190, 29, 0, 7, "Estimativa"],
    ["Peixe grelhado", "Proteínas", 140, 27, 0, 3, "Estimativa"],
    ["Legumes e salada", "Vegetais", 45, 2, 8, 0.5, "Estimativa"],
    ["Azeite de oliva", "Acompanhamentos", 884, 0, 0, 100, "Estimativa"],
    ["Leite desnatado", "Laticínios", 35, 3.4, 5, 0.1, "Estimativa"],
    ["Iogurte natural", "Laticínios", 61, 3.5, 4.7, 3.3, "Estimativa"],
    ["Iogurte proteico", "Laticínios", 65, 10, 5, 0.5, "Estimativa"],
    ["Aveia", "Cereais", 389, 17, 66, 7, "Estimativa"],
    ["Queijo branco", "Laticínios", 264, 17, 3, 21, "Estimativa"],
    ["Peito de peru", "Frios", 104, 18, 4, 2, "Estimativa"],
    ["Coxinha", "Lanches", 283, 11, 31, 12, "Estimativa"],
    ["Esfiha de carne", "Lanches", 260, 11, 30, 10, "Estimativa"],
    ["Pão de queijo", "Lanches", 363, 6, 35, 22, "Estimativa"],
    ["Pão de frango", "Lanches", 240, 20, 28, 6, "Estimativa"],
    [
      "Whey ISO100 (configurar rótulo)",
      "Suplementos",
      0,
      0,
      0,
      0,
      "Informe valores do rótulo",
    ],
    // Pães (8 novos; valores estimados por 100 g)
    ["Pão de forma tradicional", "Pães", 253, 9.4, 49.9, 3.7, "Estimativa"],
    ["Pão de forma integral", "Pães", 247, 9.4, 43.3, 3.7, "Estimativa"],
    ["Pão sírio", "Pães", 275, 9.1, 55, 1.2, "Estimativa"],
    ["Pão de milho", "Pães", 292, 6, 57, 4.5, "Estimativa"],
    ["Pão de centeio", "Pães", 259, 8.5, 48, 3.3, "Estimativa"],
    ["Pão de hambúrguer", "Pães", 279, 9.3, 51, 4.5, "Estimativa"],
    ["Torrada tradicional", "Pães", 377, 10, 74, 3.7, "Estimativa"],
    ["Tapioca pronta", "Pães", 230, 0.2, 58, 0, "Estimativa"],
    // Proteínas (6 novos; preparações simples, valores estimados por 100 g)
    ["Tilápia grelhada", "Proteínas", 128, 26, 0, 2.7, "Estimativa"],
    ["Sardinha em lata escorrida", "Proteínas", 208, 25, 0, 12, "Estimativa"],
    ["Atum em água escorrido", "Proteínas", 116, 26, 0, 1, "Estimativa"],
    ["Lombo suíno grelhado", "Proteínas", 210, 29, 0, 10, "Estimativa"],
    ["Carne moída magra cozida", "Proteínas", 220, 27, 0, 12, "Estimativa"],
    ["Tofu firme", "Proteínas", 76, 8, 2, 4.8, "Estimativa"],
    // Frutas (8 novos; valores estimados por 100 g)
    ["Laranja", "Frutas", 47, 0.9, 12, 0.1, "Estimativa"],
    ["Mamão papaia", "Frutas", 43, 0.5, 11, 0.3, "Estimativa"],
    ["Melancia", "Frutas", 30, 0.6, 8, 0.2, "Estimativa"],
    ["Uva", "Frutas", 69, 0.7, 18, 0.2, "Estimativa"],
    ["Pera", "Frutas", 57, 0.4, 15, 0.1, "Estimativa"],
    ["Abacate", "Frutas", 96, 1.2, 6, 8.4, "Estimativa"],
    ["Abacaxi", "Frutas", 48, 0.9, 13, 0.1, "Estimativa"],
    ["Manga", "Frutas", 60, 0.8, 15, 0.4, "Estimativa"],
    // Acompanhamentos (7 novos; cozidos/prontos quando indicado)
    ["Macarrão cozido", "Acompanhamentos", 157, 5.8, 30, 0.9, "Estimativa"],
    ["Batata-doce cozida", "Acompanhamentos", 77, 0.6, 18, 0.1, "Estimativa"],
    [
      "Batata inglesa cozida",
      "Acompanhamentos",
      52,
      1.2,
      12,
      0.1,
      "Estimativa",
    ],
    ["Mandioca cozida", "Acompanhamentos", 125, 0.6, 30, 0.3, "Estimativa"],
    ["Farofa pronta", "Acompanhamentos", 410, 2, 80, 9, "Estimativa"],
    [
      "Cuscuz de milho cozido",
      "Acompanhamentos",
      113,
      2.2,
      25,
      0.7,
      "Estimativa",
    ],
    ["Purê de batata", "Acompanhamentos", 90, 2, 14, 3, "Estimativa"],
    // Vegetais (9 novos; valores estimados por 100 g)
    ["Alface", "Vegetais", 15, 1.4, 2.9, 0.2, "Estimativa"],
    ["Tomate", "Vegetais", 18, 0.9, 3.9, 0.2, "Estimativa"],
    ["Cenoura cozida", "Vegetais", 35, 0.8, 8, 0.2, "Estimativa"],
    ["Brócolis cozido", "Vegetais", 35, 2.4, 7, 0.4, "Estimativa"],
    ["Abobrinha cozida", "Vegetais", 15, 1.1, 3, 0.4, "Estimativa"],
    ["Pepino", "Vegetais", 15, 0.7, 3.6, 0.1, "Estimativa"],
    ["Cebola", "Vegetais", 40, 1.1, 9.3, 0.1, "Estimativa"],
    ["Repolho", "Vegetais", 25, 1.3, 6, 0.1, "Estimativa"],
    ["Espinafre cozido", "Vegetais", 23, 3, 3.8, 0.3, "Estimativa"],
    // Laticínios (6 novos; valores estimados por 100 g/ml)
    ["Leite integral", "Laticínios", 61, 3.2, 4.7, 3.3, "Estimativa"],
    ["Leite semidesnatado", "Laticínios", 46, 3.3, 4.8, 1.5, "Estimativa"],
    ["Queijo muçarela", "Laticínios", 300, 22, 3, 22, "Estimativa"],
    ["Queijo cottage", "Laticínios", 98, 11, 3.4, 4.3, "Estimativa"],
    ["Ricota", "Laticínios", 140, 12, 3, 8, "Estimativa"],
    ["Requeijão cremoso", "Laticínios", 257, 9.6, 2.4, 23, "Estimativa"],
    // Cereais e itens de café da manhã (9 novos)
    ["Granola tradicional", "Cereais", 420, 10, 64, 15, "Estimativa"],
    ["Flocos de milho sem açúcar", "Cereais", 370, 7, 83, 1, "Estimativa"],
    ["Farinha de milho", "Cereais", 353, 7, 79, 1.5, "Estimativa"],
    ["Farinha de trigo", "Cereais", 364, 10, 76, 1, "Estimativa"],
    ["Goma de tapioca", "Cereais", 330, 0.2, 82, 0, "Estimativa"],
    ["Arroz integral cozido", "Cereais", 124, 2.6, 26, 0.9, "Estimativa"],
    ["Quinoa cozida", "Cereais", 120, 4.4, 21, 1.9, "Estimativa"],
    ["Cereal matinal de chocolate", "Cereais", 390, 6, 82, 4, "Estimativa"],
    ["Pipoca sem óleo", "Cereais", 387, 13, 78, 4.5, "Estimativa"],
    // Frios (9 novos; marcas e cortes variam)
    ["Presunto cozido", "Frios", 126, 18, 2, 5, "Estimativa"],
    ["Mortadela", "Frios", 300, 12, 4, 27, "Estimativa"],
    ["Salame", "Frios", 398, 25, 2, 32, "Estimativa"],
    ["Peito de frango defumado", "Frios", 110, 20, 2, 2, "Estimativa"],
    ["Blanquet de peru", "Frios", 100, 17, 3, 2, "Estimativa"],
    ["Peito de peru light", "Frios", 90, 17, 3, 1, "Estimativa"],
    ["Lombo canadense", "Frios", 146, 21, 2, 6, "Estimativa"],
    ["Presunto magro", "Frios", 110, 19, 2, 3, "Estimativa"],
    ["Apresuntado", "Frios", 220, 12, 4, 17, "Estimativa"],
    // Lanches (6 novos; receitas e tamanhos variam)
    ["Pastel de carne", "Lanches", 310, 10, 34, 15, "Estimativa"],
    ["Empada de frango", "Lanches", 330, 10, 32, 18, "Estimativa"],
    ["Pizza de muçarela", "Lanches", 270, 12, 31, 11, "Estimativa"],
    ["Pizza de calabresa", "Lanches", 290, 13, 30, 14, "Estimativa"],
    ["Hambúrguer simples", "Lanches", 250, 14, 25, 10, "Estimativa"],
    ["Hot dog simples", "Lanches", 280, 10, 30, 13, "Estimativa"],
    // Suplementos (9 novos; confira o rótulo da sua marca)
    [
      "Whey protein concentrado",
      "Suplementos",
      400,
      78,
      9,
      7,
      "Estimativa · confira o rótulo",
    ],
    [
      "Whey protein isolado",
      "Suplementos",
      370,
      85,
      3,
      1,
      "Estimativa · confira o rótulo",
    ],
    [
      "Proteína vegetal em pó",
      "Suplementos",
      380,
      75,
      10,
      6,
      "Estimativa · confira o rótulo",
    ],
    [
      "Caseína em pó",
      "Suplementos",
      370,
      78,
      8,
      3,
      "Estimativa · confira o rótulo",
    ],
    [
      "Creatina monohidratada",
      "Suplementos",
      0,
      0,
      0,
      0,
      "Estimativa · confira o rótulo",
    ],
    [
      "Maltodextrina",
      "Suplementos",
      380,
      0,
      95,
      0,
      "Estimativa · confira o rótulo",
    ],
    ["Dextrose", "Suplementos", 380, 0, 95, 0, "Estimativa · confira o rótulo"],
    [
      "Bebida isotônica",
      "Suplementos",
      25,
      0,
      6,
      0,
      "Estimativa · confira o rótulo",
    ],
    [
      "Barra de proteína",
      "Suplementos",
      360,
      30,
      35,
      12,
      "Estimativa · confira o rótulo",
    ],
    // Preparações prontas para registro rápido. Valores médios por 100 g; receitas e marcas variam.
    [
      "Ovo cozido",
      "Proteínas",
      155,
      13,
      1.1,
      11,
      "Estimativa · cozido, sem óleo",
    ],
    [
      "Ovo mexido",
      "Proteínas",
      150,
      10.5,
      1.5,
      10.5,
      "Estimativa · preparo simples",
    ],
    [
      "Omelete simples",
      "Proteínas",
      154,
      11,
      2,
      11,
      "Estimativa · sem recheio",
    ],
    [
      "Frango cozido desfiado",
      "Proteínas",
      165,
      31,
      0,
      3.6,
      "Estimativa · cozido",
    ],
    [
      "Frango assado sem pele",
      "Proteínas",
      190,
      27,
      0,
      8,
      "Estimativa · assado",
    ],
    [
      "Carne moída refogada",
      "Proteínas",
      230,
      27,
      0,
      13,
      "Estimativa · preparo simples",
    ],
    ["Patinho cozido", "Proteínas", 220, 32, 0, 9, "Estimativa · cozido"],
    ["Salmão grelhado", "Proteínas", 206, 22, 0, 12, "Estimativa · grelhado"],
    [
      "Arroz com feijão",
      "Acompanhamentos",
      115,
      4.5,
      21,
      1,
      "Estimativa · mistura pronta",
    ],
    ["Batata frita", "Acompanhamentos", 312, 3.4, 41, 15, "Estimativa · frita"],
    [
      "Batata assada",
      "Acompanhamentos",
      93,
      2.5,
      21,
      0.1,
      "Estimativa · assada, sem óleo",
    ],
    [
      "Feijão preto cozido",
      "Acompanhamentos",
      77,
      4.5,
      14,
      0.5,
      "Estimativa · cozido",
    ],
    [
      "Café com leite integral",
      "Bebidas",
      50,
      2.5,
      5,
      2,
      "Estimativa · sem açúcar",
    ],
    [
      "Suco de laranja natural",
      "Bebidas",
      45,
      0.7,
      10,
      0.2,
      "Estimativa · sem açúcar",
    ],
    [
      "Sanduíche de presunto e queijo",
      "Lanches",
      280,
      14,
      30,
      11,
      "Estimativa · unidade média",
    ],
    [
      "Pão francês com manteiga",
      "Lanches",
      330,
      8,
      48,
      12,
      "Estimativa · unidade média",
    ],
  ].map((f, i) => {
    let originalName = f[0],
      portions = {
        "Pão francês": 50,
        "Pão integral": 50,
        "Pão de forma tradicional": 25,
        "Pão de forma integral": 25,
        "Pão sírio": 60,
        "Pão de milho": 50,
        "Pão de centeio": 30,
        "Pão de hambúrguer": 55,
        "Torrada tradicional": 10,
        "Tapioca pronta": 100,
        "Ovo inteiro": 50,
        Banana: 120,
        Maçã: 130,
        "Arroz cozido": 150,
        "Feijão cozido": 100,
        "Peito de frango grelhado": 150,
        "Carne bovina magra grelhada": 150,
        "Peixe grelhado": 150,
        "Legumes e salada": 100,
        "Azeite de oliva": 5,
        "Leite desnatado": 200,
        "Iogurte natural": 170,
        "Iogurte proteico": 160,
        Aveia: 30,
        "Queijo branco": 30,
        "Peito de peru": 30,
        Coxinha: 120,
        "Esfiha de carne": 100,
        "Pão de queijo": 50,
        "Pão de frango": 100,
        "Whey ISO100 (configurar rótulo)": 30,
        "Pão francês com manteiga": 65,
        "Ovo cozido": 50,
        "Ovo mexido": 100,
        "Omelete simples": 120,
        "Frango cozido desfiado": 150,
        "Frango assado sem pele": 150,
        "Carne moída refogada": 150,
        "Patinho cozido": 150,
        "Salmão grelhado": 150,
        "Arroz com feijão": 250,
        "Batata frita": 100,
        "Batata assada": 180,
        "Feijão preto cozido": 100,
        "Café com leite integral": 200,
        "Suco de laranja natural": 200,
        "Sanduíche de presunto e queijo": 150,
      },
      serving = portions[originalName] || 100,
      source = TACO4[originalName],
      tacoFood = TACO_ALL.find((t) => t.tacoItemId === source?.id),
      factor = serving / 100;
    return {
      id: "seed-" + i,
      name: source?.display || f[0],
      legacyName: source?.display ? originalName : undefined,
      category: f[1],
      kcal: Math.round((source?.kcal || 0) * factor * 10) / 10,
      p: Math.round((source?.p || 0) * factor * 10) / 10,
      c: Math.round((source?.c || 0) * factor * 10) / 10,
      f: Math.round((source?.f || 0) * factor * 10) / 10,
      unknownMacros: tacoFood?.unknownMacros || [],
      unusable: tacoFood?.unusable || false,
      unit: "g",
      serving,
      aliases: source ? [source.item] : [],
      tacoItemId: source?.id,
      note: source
        ? ""
        : "Pendente: informe os valores do rótulo em Ajustes → Alimentos antes de registrar.",
      pendingLabel: !source,
      catalogVersion: 3,
      favorite: i < 7,
      seed: true,
    };
  });
  // TACO categories follow the numbered groups in the original publication.
  const categoryRanges = [
    [63, "Cereais e derivados"],
    [162, "Verduras, hortaliças e derivados"],
    [258, "Frutas e derivados"],
    [272, "Gorduras e óleos"],
    [322, "Pescados e frutos do mar"],
    [445, "Carnes e derivados"],
    [469, "Leite e derivados"],
    [483, "Bebidas (alcoólicas e não alcoólicas)"],
    [490, "Ovos e derivados"],
    [510, "Produtos açucarados"],
    [519, "Miscelâneas"],
    [524, "Outros alimentos industrializados"],
    [556, "Alimentos preparados"],
    [586, "Leguminosas e derivados"],
    [597, "Nozes e sementes"],
  ];
  for (let i = 0; i < TACO_ALL.length; i++) {
    const food = normalizeLegacyFood(TACO_ALL[i]);
    food.category = categoryRanges.find(([end]) => food.tacoItemId <= end)[1];
    food.catalogVersion = 4;
    TACO_ALL[i] = food;
  }
  for (const food of foodsSeed) {
    if (food.tacoItemId)
      food.category = TACO_ALL.find(
        (x) => x.tacoItemId === food.tacoItemId,
      ).category;
    food.catalogVersion = 4;
  }
  const mealSeeds = [
    {
      name: "Café da manhã",
      items: [
        ["Pão francês", 50],
        ["Ovo cozido", 50],
        ["Banana", 120],
        ["Iogurte natural", 170],
      ],
    },
    {
      name: "Almoço padrão",
      items: [
        ["Arroz cozido", 150],
        ["Feijão cozido", 100],
        ["Peito de frango grelhado", 150],
        ["Salada de legumes cozida no vapor", 120],
      ],
    },
    {
      name: "Jantar padrão",
      items: [
        ["Arroz cozido", 150],
        ["Feijão cozido", 100],
        ["Peito de frango grelhado", 150],
        ["Salada de legumes cozida no vapor", 120],
      ],
    },
    { name: "Lanche da faculdade · frango", items: [["Pão de frango", 100]] },
    {
      name: "Lanche da faculdade · peru e queijo",
      items: [
        ["Pão integral", 50],
        ["Peito de peru", 30],
        ["Queijo branco", 30],
      ],
    },
    {
      name: "Shake pós-treino · configure ISO100",
      items: [
        ["Whey ISO100 (configurar rótulo)", 30],
        ["Leite desnatado", 250],
      ],
    },
  ];
  const LEGACY_SEED_SIGNATURES = {
    "seed-0": "17915a6b",
    "seed-1": "beb1ca4f",
    "seed-2": "dad18817",
    "seed-3": "2a81027f",
    "seed-4": "0b9c9283",
    "seed-5": "d561c783",
    "seed-6": "cbb5c829",
    "seed-7": "e4424206",
    "seed-8": "ebcb26db",
    "seed-9": "0bf1af21",
    "seed-10": "7c3f7cf6",
    "seed-11": "1162f8ab",
    "seed-12": "1385201b",
    "seed-13": "3db6314e",
    "seed-14": "73045db2",
    "seed-15": "a6c0c490",
    "seed-16": "fa65f312",
    "seed-17": "89686f85",
    "seed-18": "9a435be9",
    "seed-19": "e6b915d6",
    "seed-20": "ae3d11ab",
    "seed-21": "ea69b1ab",
    "seed-22": "15579117",
    "seed-23": "e9f586a7",
    "seed-24": "7e66a9be",
    "seed-25": "73cf6f32",
    "seed-26": "b2d84211",
    "seed-27": "e26679ed",
    "seed-28": "2277906a",
    "seed-29": "06558306",
    "seed-30": "d85566eb",
    "seed-31": "6b81042d",
    "seed-32": "1fec6978",
    "seed-33": "c799cac7",
    "seed-34": "47465312",
    "seed-35": "28efac3a",
    "seed-36": "e6c70816",
    "seed-37": "017db846",
    "seed-38": "02804aa8",
    "seed-39": "426bd5d2",
    "seed-40": "01c042b2",
    "seed-41": "0ee238fb",
    "seed-42": "7a60c1f0",
    "seed-43": "44615f73",
    "seed-44": "05252d11",
    "seed-45": "61521411",
    "seed-46": "57f8679d",
    "seed-47": "353d5aef",
    "seed-48": "12075564",
    "seed-49": "da0edb6e",
    "seed-50": "0b901ead",
    "seed-51": "387ff8e0",
    "seed-52": "5ffdc193",
    "seed-53": "912c839e",
    "seed-54": "31c90fe6",
    "seed-55": "304561ac",
    "seed-56": "95069eda",
    "seed-57": "87fdb23a",
    "seed-58": "22467c14",
    "seed-59": "7fce0d87",
    "seed-60": "373249ff",
    "seed-61": "ddde0a6a",
    "seed-62": "d14b547d",
    "seed-63": "fed703bf",
    "seed-64": "79ca5fd8",
    "seed-65": "7bc1f9e3",
    "seed-66": "7f52278c",
    "seed-67": "e1ca3586",
    "seed-68": "45161faa",
    "seed-69": "fe9aa7c6",
    "seed-70": "4c6d2c70",
    "seed-71": "f6ce7026",
    "seed-72": "daf3b323",
    "seed-73": "a27b6659",
    "seed-74": "b35c218e",
    "seed-75": "0fb6c7f2",
    "seed-76": "f1f62d25",
    "seed-77": "722f4963",
    "seed-78": "3d5b4225",
    "seed-79": "939dc62f",
    "seed-80": "0f6bb6fe",
    "seed-81": "eae4f88d",
    "seed-82": "3da00b12",
    "seed-83": "d088464f",
    "seed-84": "89b52566",
    "seed-85": "4b29fd36",
    "seed-86": "ca57827b",
    "seed-87": "8bbd8f7c",
    "seed-88": "64b779e2",
    "seed-89": "50fbfb35",
    "seed-90": "2bb9764b",
    "seed-91": "fac99327",
    "seed-92": "13c4f0f3",
    "seed-93": "599c1c95",
    "seed-94": "c428effc",
    "seed-95": "aa7d05ac",
    "seed-96": "11672842",
    "seed-97": "ee902fc9",
    "seed-98": "c13497c3",
    "seed-99": "ad90a8b8",
    "seed-100": "80b9d7e7",
    "seed-101": "352709e0",
    "seed-102": "fceb72ae",
    "seed-103": "9049b5eb",
    "seed-104": "75a951db",
    "seed-105": "5cdebfb7",
    "seed-106": "877b7dde",
    "seed-107": "c5e38365",
    "seed-108": "476ef7b4",
    "seed-109": "7ad48532",
    "seed-110": "74ed8f09",
    "seed-111": "6a30c223",
    "seed-112": "9843cb47",
    "seed-113": "f5a0d1c7",
    "seed-114": "e925744d",
    "seed-115": "c6e8efcc",
  };
  function seedSignature(f) {
    const s = JSON.stringify([
      f.id,
      f.name,
      f.category,
      f.kcal,
      f.p,
      f.c,
      f.f,
      f.unit,
      f.serving,
      f.note,
      !!f.seed,
    ]);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return (h >>> 0).toString(16).padStart(8, "0");
  }
  const DB = "nutritrack_local_v1",
    today = () => {
      let d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    fmtDate = (s) =>
      new Date(s + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    monthFmt = (y, m) =>
      new Date(y, m, 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    id = () => crypto.randomUUID?.() || String(Date.now() + Math.random()),
    round = (n) => Math.round((Number(n) || 0) * 10) / 10,
    esc = (s) =>
      String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  let db,
    state = {
      page: "today",
      date: today(),
      month: new Date(),
      foods: [],
      logs: [],
      weights: [],
      training: [],
      meals: [],
      plans: [],
      settings: {
        kcal: 2800,
        p: 190,
        c: 330,
        f: 80,
        height: 188,
        targetWeight: 92,
        initialWeight: 0,
        profileNote: "",
        water: false,
        waterTarget: 2500,
        dark: false,
      },
      storagePersistent: null,
      range: 30,
      editLog: null,
      selectedMeal: "Lanche",
    };
  function openDB() {
    return new Promise((ok, no) => {
      let q = indexedDB.open(DB, 2);
      q.onupgradeneeded = () => {
        let d = q.result;
        for (let n of [
          "foods",
          "logs",
          "weights",
          "training",
          "meals",
          "settings",
          "plans",
        ])
          if (!d.objectStoreNames.contains(n))
            d.createObjectStore(n, { keyPath: "id" });
      };
      q.onsuccess = () => ok(q.result);
      q.onerror = () => no(q.error);
    });
  }
  function all(store) {
    return new Promise((ok, no) => {
      let q = db.transaction(store).objectStore(store).getAll();
      q.onsuccess = () => ok(q.result);
      q.onerror = () => no(q.error);
    });
  }
  function put(store, x) {
    return new Promise((ok, no) => {
      let tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(x);
      tx.oncomplete = () => ok(x);
      tx.onerror = tx.onabort = () =>
        no(
          tx.error || new Error("Não foi possível confirmar a gravação local."),
        );
    });
  }
  function bulkPut(store, items) {
    return new Promise((ok, no) => {
      let tx = db.transaction(store, "readwrite"),
        os = tx.objectStore(store);
      for (let item of items) os.put(item);
      tx.oncomplete = () => ok(items);
      tx.onerror = tx.onabort = () =>
        no(
          tx.error || new Error("Não foi possível atualizar o catálogo local."),
        );
    });
  }
  function del(store, k) {
    return new Promise((ok, no) => {
      let tx = db.transaction(store, "readwrite");
      tx.objectStore(store).delete(k);
      tx.oncomplete = () => ok();
      tx.onerror = tx.onabort = () =>
        no(
          tx.error || new Error("Não foi possível confirmar a remoção local."),
        );
    });
  }
  async function refresh() {
    [
      state.foods,
      state.logs,
      state.weights,
      state.training,
      state.meals,
      state.plans,
    ] = await Promise.all(
      ["foods", "logs", "weights", "training", "meals", "plans"].map(all),
    );
    let s = await all("settings");
    state.settings = { ...state.settings, ...(s[0] || {}) };
    render();
  }
  const fmtNumber = (n) =>
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
      Number(n) || 0,
    );
  function macroText(food, key) {
    return food?.unknownMacros?.includes(key) ? "—" : fmtNumber(food?.[key]);
  }
  function macroLogged(log, key) {
    return (log.unknownMacros || []).includes(key) ? "—" : fmtNumber(log[key]);
  }
  function totals(logs) {
    let t = logs.reduce(
      (a, x) => {
        a.kcal += Number(x.kcal) || 0;
        a.p += Number(x.p) || 0;
        a.c += Number(x.c) || 0;
        a.f += Number(x.f) || 0;
        return a;
      },
      { kcal: 0, p: 0, c: 0, f: 0 },
    );
    t.unknownMacros = [...new Set(logs.flatMap((x) => x.unknownMacros || []))];
    return t;
  }
  function logNutrition(food, qty) {
    let k = Number(qty) / (Number(food.serving) || 100);
    return {
      kcal: round(food.kcal * k),
      p: round(food.p * k),
      c: round(food.c * k),
      f: round(food.f * k),
      unknownMacros: food.unknownMacros || [],
    };
  }
  function logsDay(date = state.date) {
    return state.logs
      .filter((x) => x.date === date && x.kind === "food")
      .sort((a, b) => a.time.localeCompare(b.time));
  }
  function toast(s) {
    let e = document.querySelector("#toast");
    e.textContent = s;
    e.style.display = "block";
    e.onclick = null;
    e.setAttribute("role", "status");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => (e.style.display = "none"), 3500);
  }
  function updateToast(reg) {
    let e = document.querySelector("#toast");
    e.setAttribute("role", "button");
    e.tabIndex = 0;
    e.onkeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") e.click();
    };
    e.textContent = "Nova versão disponível — toque para atualizar";
    e.style.display = "block";
    e.onclick = () => reg.waiting?.postMessage({ type: "SKIP_WAITING" });
    clearTimeout(window.toastTimer);
  }
  function progress(v, g) {
    return Math.min(100, g > 0 ? (v / g) * 100 : 0);
  }
  function nutrCard(title, key, unit) {
    const all = totals(logsDay()),
      n = all[key],
      goal = Number(state.settings[key]) || 0,
      unknown = all.unknownMacros.includes(key);
    return (
      '<div class="macro"><label>' +
      title +
      "</label><strong>" +
      (unknown ? "≥ " : "") +
      fmtNumber(n) +
      '<small style="display:inline;font-size:12px"> ' +
      unit +
      "</small></strong><small>de " +
      fmtNumber(goal) +
      " " +
      unit +
      " · " +
      (unknown
        ? "total parcial"
        : n > goal
          ? fmtNumber(n - goal) + " " + unit + " acima"
          : "restam " + fmtNumber(goal - n) + " " + unit) +
      "</small>" +
      (unknown ? "<small>Há valores não informados</small>" : "") +
      '<div class="mini"><i style="width:' +
      progress(n, goal) +
      '%"></i></div></div>'
    );
  }
  function render() {
    document.body.classList.toggle("dark", !!state.settings.dark);
    document
      .querySelectorAll(".tab")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.page === state.page),
      );
    document
      .querySelector("#addFab")
      .classList.toggle(
        "hidden",
        state.page === "settings" || state.page === "plan",
      );
    let app = document.querySelector("#app");
    if (state.page === "today") app.innerHTML = todayPage();
    if (state.page === "plan") app.innerHTML = planPage();
    if (state.page === "calendar") app.innerHTML = calendarPage();
    if (state.page === "progress") app.innerHTML = progressPage();
    if (state.page === "settings") app.innerHTML = settingsPage();
    bindApp();
    enhanceControls(app);
    queueMicrotask(() => wrapAsyncButtons(app));
    document.querySelectorAll(".tab").forEach((b) => {
      if (b.dataset.page === state.page) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }
  function previousDate(date) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("sv-SE");
  }
  function todayPage() {
    let ls = logsDay(),
      t = totals(ls),
      goal = Number(state.settings.kcal) || 2800,
      dayComplete = !!planForDate(state.date).dayComplete;
    let groups = ["Café da manhã", "Almoço", "Lanche", "Jantar", "Outros"];
    let meals = groups
      .map((g) => {
        let a = ls.filter((x) => x.meal === g);
        return `<section><div class="sectiontitle"><h2>${g}</h2><span class="actions"><span class="muted small">${round(totals(a).kcal)} kcal</span>${state.logs.some((x) => x.kind === "food" && x.meal === g && x.date === previousDate(state.date)) ? `<button class="linkbtn small" data-repeat-meal="${g}">Repetir ontem</button>` : ""}${a.length ? `<button class="linkbtn small" data-add-meal="${g}" aria-label="Adicionar alimento em ${g}">＋</button>` : ""}${a.length ? `<button class="linkbtn small" data-save-meal="${g}">Salvar como modelo</button>` : ""}</span></div>${a.length ? a.map((x) => `<div class="card meal"><div class="mealhead"><div><span class="mealname">${esc(x.foodName)}</span><small class="muted"> · ${x.qty} ${esc(x.unit)} ${x.approx ? " · ≈" : ""}</small></div><div class="actions"><button class="linkbtn" data-edit="${esc(x.id)}">Editar</button><button class="linkbtn danger" data-del-log="${esc(x.id)}">×</button></div></div><div class="foodline"><span>${macroLogged(x, "kcal")} kcal<small>P ${macroLogged(x, "p")} · C ${macroLogged(x, "c")} · G ${macroLogged(x, "f")} g</small></span></div></div>`).join("") : `<button class="secondary small" data-add-meal="${g}">+ Adicionar</button>`}</section>`;
      })
      .join("");
    let w = state.weights.find((x) => x.date === state.date),
      water = state.logs
        .filter((x) => x.date === state.date && x.kind === "water")
        .reduce((a, x) => a + x.ml, 0);
    return `<div class="datehead"><div><h1>${state.date === today() ? "Hoje" : fmtDate(state.date)}</h1><input class="date-picker" id="jumpDate" aria-label="Data do diário" type="date" value="${state.date}"></div><div class="actions"><button class="iconbtn" id="prevDay">‹</button><button class="iconbtn" id="nextDay">›</button>${state.date !== today() ? '<button class="linkbtn" id="goToday">Hoje</button>' : ""}</div></div><button class="primary diary-add" data-add-meal="${state.selectedMeal}">＋ Registrar alimento</button>${(state.logs.length || state.weights.length) && (!state.settings.lastBackupAt || Date.now() - new Date(state.settings.lastBackupAt).getTime() > 7 * 864e5) ? `<div class="note">${state.settings.lastBackupAt ? "Seu último backup tem mais de 7 dias." : "Seus registros ficam neste aparelho. Faça seu primeiro backup quando começar."} <button class="linkbtn" id="backupQuick">Exportar backup</button></div>` : ""}<div class="card hero"><div class="energy"><div><div class="muted small">Energia consumida</div><div class="energy"><strong>${t.unknownMacros.includes("kcal") ? "≥ " : ""}${fmtNumber(t.kcal)}</strong><span class="goal"> / ${fmtNumber(goal)} kcal</span></div></div><div class="muted small">${t.unknownMacros.includes("kcal") ? "Total parcial" : fmtNumber(Math.abs(goal - t.kcal)) + " kcal " + (t.kcal > goal ? "acima da meta" : "restantes")}</div></div><div class="progress"><i style="width:${progress(t.kcal, goal)}%"></i></div><div class="row between"><span class="muted small">${ls.length ? `${ls.length} itens registrados` : "Comece registrando uma refeição"}</span><span class="tag" style="background:#ffffff25;color:white">${dayComplete ? "Dia completo" : ls.length ? "Em andamento" : "Dia aberto"}</span><button class="secondary small" id="toggleDayComplete">${dayComplete ? "Reabrir dia" : "Marcar dia como completo"}</button></div></div><div class="macros">${nutrCard("Proteína", "p", "g")}${nutrCard("Carboidratos", "c", "g")}${nutrCard("Gorduras", "f", "g")}</div><div class="row between" style="margin:16px 2px"><button class="secondary" id="weightQuick">＋ Peso${w ? " · " + w.kg + " kg" : ""}</button>${state.settings.water ? `<div class="row waterbox"><span class="small">Água<br><b>${water} / ${state.settings.waterTarget} ml</b></span><button class="secondary" id="waterQuick">＋ 250 ml</button></div>` : ""}</div>${
      state.settings.water
        ? state.logs
            .filter((x) => x.date === state.date && x.kind === "water")
            .map(
              (x) =>
                `<div class="small muted" style="text-align:right">${x.ml} ml · ${x.time || ""} <button class="linkbtn danger" data-del-water="${esc(x.id)}">Desfazer</button></div>`,
            )
            .join("")
        : ""
    }${meals}<div class="sectiontitle"><h2>Treino e recuperação</h2><button class="linkbtn" id="trainingQuick">＋ Registrar</button></div>${
      state.training
        .filter((x) => x.date === state.date)
        .map(
          (x) =>
            `<div class="card meal"><div class="row between"><b>${esc(x.type)}</b><span><button class="linkbtn" data-training-edit="${esc(x.id)}">Editar</button><button class="linkbtn danger" data-training-del="${esc(x.id)}">×</button></span></div><span class="muted small"> · ${x.minutes} min${x.km ? " · " + x.km + " km" : ""}${x.kcalEstimate ? " · ≈ " + x.kcalEstimate + " kcal" : ""}</span>${x.note ? `<div class="small muted">${esc(x.note)}</div>` : ""}</div>`,
        )
        .join("") ||
      `<div class="card meal muted small">Seu treino aparece aqui junto ao diário. Exercícios não alteram a meta de alimentação.</div>`
    }<div class="note">Metas iniciais são estimativas ajustáveis. Exceder uma meta não reduz sua conclusão do dia; use o diário para observar consistência.</div>`;
  }
  async function toggleDayComplete() {
    let plan = planForDate(state.date);
    plan.dayComplete = !plan.dayComplete;
    await put("plans", plan);
    await refresh();
    toast(plan.dayComplete ? "Dia marcado como completo" : "Dia reaberto");
  }
  function planForDate(date = state.date) {
    return (
      state.plans.find((x) => x.date === date) || { id: date, date, items: [] }
    );
  }
  function shiftPlanDate(n) {
    shiftDate(n);
  }
  function planPage() {
    let plan = planForDate(),
      slots = ["Café da manhã", "Almoço", "Lanche", "Jantar", "Outros"],
      allItems = plan.items || [];
    let sum = totals(allItems.flatMap((x) => x.ingredients || []));
    let cards = slots
      .map((slot) => {
        let meals = allItems.filter((x) => x.slot === slot);
        return `<section><div class="sectiontitle"><h2>${slot}</h2><span class="muted small">${Math.round(meals.reduce((n, m) => n + (m.ingredients || []).reduce((a, i) => a + (Number(i.kcal) || 0), 0), 0))} kcal planejadas</span></div>${
          meals.length
            ? meals
                .map((m) => {
                  let count = state.logs.filter(
                      (x) => x.sourcePlanItemId === m.id,
                    ).length,
                    logged = count >= (m.ingredients || []).length,
                    partial = count > 0 && !logged;
                  return `<div class="card meal"><div class="mealhead"><div><b>${esc(m.name)}</b><small class="muted"> · ${(m.ingredients || []).length} ingredientes · ≈ ${Math.round((m.ingredients || []).reduce((a, i) => a + (Number(i.kcal) || 0), 0))} kcal</small></div><button class="linkbtn danger" data-plan-del="${esc(m.id)}">Remover</button></div><div>${(m.ingredients || []).map((i) => `<div class="foodline"><span>${esc(i.foodName)}<small>${i.qty} ${esc(i.unit)}</small></span><span>${i.kcal} kcal</span></div>`).join("")}</div><button class="${logged ? "secondary" : "primary"}" data-plan-log="${esc(m.id)}" ${logged ? "disabled" : ""} style="width:100%;margin-top:12px">${logged ? "✓ Já lançado no diário" : partial ? "Completar lançamento no diário" : "Lançar ingredientes no diário"}</button></div>`;
                })
                .join("")
            : `<button class="secondary small" data-plan-slot="${slot}">＋ Planejar ${slot.toLocaleLowerCase("pt-BR")}</button>`
        }</section>`;
      })
      .join("");
    return `<div class="datehead"><div><h1>Plano do dia</h1><div class="muted small">${fmtDate(state.date)}</div></div><div class="actions"><button class="iconbtn" id="planPrev">‹</button><button class="iconbtn" id="planNext">›</button>${state.date !== today() ? '<button class="linkbtn" id="planToday">Hoje</button>' : ""}</div></div><div class="card"><div class="row between"><b>Refeições previstas</b><span class="tag">${allItems.length} refeições</span></div><div class="small muted" style="margin-top:6px">O plano fica separado do que você realmente registrou. Lançar refeições adiciona os ingredientes ao diário, sem substituir outros itens.</div><div class="row between" style="margin-top:12px"><span class="muted small">Total planejado</span><b>≈ ${Math.round(sum.kcal)} kcal</b></div><div class="small muted">${["p", "c", "f"].map((k, i) => ["Proteína", "Carboidratos", "Gorduras"][i] + " " + (sum.unknownMacros.includes(k) ? "≥" : "") + Math.round(sum[k]) + " g").join(" · ")}${sum.unknownMacros.length ? " · totais incompletos" : ""}</div></div><button class="primary" id="addPlannedMeal" style="width:100%;margin:8px 0">＋ Adicionar refeição ao plano</button>${cards}<div class="note">Plano é uma referência flexível. Você pode editar o que realmente comeu no diário sem alterar o plano salvo.</div><button class="linkbtn" id="planManageMeals">Editar modelos de refeição</button>`;
  }
  function plannedMealModal(defaultSlot) {
    if (!state.meals.length) {
      toast("Crie um modelo de refeição primeiro");
      return;
    }
    showModal(
      `<div class="row between"><h2>Adicionar ao plano</h2><button class="iconbtn" id="closeModal">×</button></div><div class="field"><label>Refeição do dia</label><select id="planSlot">${["Café da manhã", "Almoço", "Lanche", "Jantar", "Outros"].map((x) => `<option ${x === defaultSlot ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="searchresults">${state.meals.map((m) => `<button class="result" data-plan-template="${esc(m.id)}"><b>${esc(m.name)}</b><small>${m.items.length} ingredientes · modelo salvo</small></button>`).join("")}</div>`,
    );
    $("#closeModal").onclick = closeModal;
    document
      .querySelectorAll("[data-plan-template]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            addTemplateToPlan(b.dataset.planTemplate, $("#planSlot").value)),
      );
  }
  async function addTemplateToPlan(templateId, slot) {
    let meal = state.meals.find((x) => x.id === templateId);
    if (!meal) return;
    let ingredients = [];
    for (let it of meal.items) {
      let food =
        state.foods.find((f) => f.id === it.foodId) ||
        state.foods.find((f) => f.name === it.name || f.legacyName === it.name);
      if (!food) {
        toast("Um ingrediente do modelo não está disponível");
        return;
      }
      if (food.pendingLabel || food.unusable) {
        toast(
          "Informe os valores do rótulo do produto em Ajustes → Alimentos antes de planejar",
        );
        return;
      }
      let n = logNutrition(food, it.qty);
      ingredients.push({
        id: id(),
        foodId: food.id,
        foodName: food.name,
        qty: Number(it.qty),
        unit: food.unit,
        unknownMacros: n.unknownMacros,
        kcal: n.kcal,
        p: n.p,
        c: n.c,
        f: n.f,
        approx: (food.note || "").toLowerCase().includes("estimativa"),
      });
    }
    let plan = planForDate();
    plan.items = plan.items || [];
    plan.items.push({ id: id(), slot, name: meal.name, ingredients });
    await put("plans", plan);
    closeModal();
    await refresh();
    toast("Refeição adicionada ao plano");
  }
  async function logPlannedMeal(itemId) {
    let plan = planForDate(),
      meal = plan.items.find((x) => x.id === itemId);
    if (!meal) return;
    let ingredients = meal.ingredients || [],
      done = new Set(
        state.logs
          .filter((x) => x.sourcePlanItemId === itemId)
          .map((x) => x.sourcePlanIngredientId),
      );
    if (!ingredients.length) {
      toast("Este modelo não tem ingredientes disponíveis");
      return;
    }
    await bulkPut(
      "logs",
      ingredients
        .filter((i) => !done.has(i.id))
        .map((i) => ({
          id: id(),
          date: state.date,
          time: new Date().toTimeString().slice(0, 5),
          kind: "food",
          foodId: i.foodId,
          foodName: i.foodName,
          qty: i.qty,
          unit: i.unit,
          unknownMacros: i.unknownMacros || [],
          meal: meal.slot,
          kcal: i.kcal,
          p: i.p,
          c: i.c,
          f: i.f,
          approx: i.approx,
          sourcePlanItemId: itemId,
          sourcePlanIngredientId: i.id,
        })),
    );
    await refresh();
    toast("Ingredientes lançados no diário");
  }
  async function removePlannedMeal(itemId) {
    if (
      !confirm(
        "Remover esta refeição do plano? Os registros já lançados no diário serão mantidos.",
      )
    )
      return;
    let plan = planForDate();
    plan.items = plan.items.filter((x) => x.id !== itemId);
    await put("plans", plan);
    await refresh();
    toast("Refeição removida do plano");
  }

  function calendarPage() {
    let y = state.month.getFullYear(),
      m = state.month.getMonth(),
      first = new Date(y, m, 1).getDay(),
      days = new Date(y, m + 1, 0).getDate();
    let cells = Array(first).fill("<div></div>");
    for (let d = 1; d <= days; d++) {
      let date = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        has = state.logs.some((x) => x.date === date && x.kind !== "water"),
        weight = state.weights.some((x) => x.date === date),
        planned = state.plans.some((x) => x.date === date && x.items?.length),
        complete = state.plans.some((x) => x.date === date && x.dayComplete);
      cells.push(
        `<button class="day ${date === state.date ? "selected" : ""} ${date === today() ? "today" : ""}" data-date="${date}">${d}<span class="dots">${has ? '<i class="dot"></i>' : ""}${weight ? '<i class="dot" style="background:var(--orange)"></i>' : ""}${planned ? '<i class="dot" style="background:#8295ce"></i>' : ""}${complete ? '<i class="dot" style="background:#9878b8"></i>' : ""}</span></button>`,
      );
    }
    let t = totals(logsDay());
    return `<div class="datehead"><div><h1>Calendário</h1><div class="muted small">Histórico diário</div></div><button class="secondary" id="copyDay">Copiar refeições…</button></div><div class="card"><div class="calendar-head"><button class="iconbtn" id="prevMonth">‹</button><b>${monthFmt(y, m)}</b><button class="iconbtn" id="nextMonth">›</button></div><div class="calendar">${["D", "S", "T", "Q", "Q", "S", "S"].map((x) => `<div class="dow">${x}</div>`).join("")}${cells.join("")}</div><div class="legend"><span><i class="dot"></i> Diário de alimentos</span><span><i class="dot" style="background:var(--orange)"></i> Peso registrado</span><span><i class="dot" style="background:#8295ce"></i> Plano</span><span><i class="dot" style="background:#9878b8"></i> Dia completo</span></div></div><div class="sectiontitle"><h2>${fmtDate(state.date)}</h2><button class="linkbtn" id="addOnDate">＋ Alimento</button></div><div class="card"><div class="row between"><b>Resumo nutricional</b><span class="muted small">${round(t.kcal)} kcal</span></div><div class="small muted" style="margin-top:7px">${["p", "c", "f"].map((k, i) => ["Proteína", "Carboidratos", "Gorduras"][i] + " " + (t.unknownMacros.includes(k) ? "≥" : "") + round(t[k]) + " g").join(" · ")}${t.unknownMacros.length ? " · totais incompletos" : ""}</div>${
      logsDay()
        .map(
          (x) =>
            `<div class="listitem"><span>${esc(x.foodName)}<small class="muted"> · ${x.qty} ${esc(x.unit)} · ${esc(x.meal)}</small></span><span>${round(x.kcal)} kcal</span></div>`,
        )
        .join("") ||
      '<div class="empty">Nenhum alimento registrado nesta data.</div>'
    }</div><div class="sectiontitle"><h2>Resumo do dia</h2><button class="linkbtn" id="addTrainingCalendar">＋ Treino</button></div><div class="card">${
      state.training
        .filter((x) => x.date === state.date)
        .map(
          (x) =>
            `<div class="listitem"><span>${esc(x.type)}<small class="muted"> · ${x.minutes} min${x.km ? " · " + x.km + " km" : ""}</small></span><span><button class="linkbtn" data-training-edit="${esc(x.id)}">Editar</button><button class="linkbtn danger" data-training-del="${esc(x.id)}">×</button></span></div>`,
        )
        .join("") ||
      '<div class="empty">Nenhum treino registrado nesta data.</div>'
    }</div>`;
  }
  function weightTrend(weights = state.weights) {
    let sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date)),
      out = [];
    for (let w of sorted) {
      let prior = out.at(-1),
        days = prior
          ? Math.max(
              0,
              (new Date(w.date + "T12:00:00") -
                new Date(prior.date + "T12:00:00")) /
                864e5,
            )
          : 0,
        alpha = prior ? 0.1 : 1;
      out.push({
        ...w,
        trend: prior
          ? alpha * Number(w.kg) + (1 - alpha) * prior.trend
          : Number(w.kg),
      });
    }
    return out;
  }
  function weeklyProgress() {
    let complete = state.plans
        .filter((x) => x.dayComplete)
        .map((x) => x.date)
        .sort(),
      all = complete.map((date) => ({
        date,
        t: totals(
          state.logs.filter((x) => x.date === date && x.kind === "food"),
        ),
      })),
      d = new Date();
    d.setDate(d.getDate() - 6);
    let cutoff = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      last7 = all.filter((x) => x.date >= cutoff && x.date <= today()),
      n = last7.length,
      avg = (k) =>
        last7.some((x) => x.t.unknownMacros.includes(k))
          ? "—"
          : n
            ? round(last7.reduce((a, x) => a + x.t[k], 0) / n)
            : 0,
      goal = Number(state.settings.kcal) || 2800,
      adherence = last7.filter(
        (x) =>
          !x.t.unknownMacros.includes("kcal") &&
          x.t.kcal >= goal * 0.9 &&
          x.t.kcal <= goal * 1.1,
      ).length,
      trend = weightTrend(state.weights.filter((w) => w.date <= today())),
      latest = trend.at(-1),
      cutDate = latest
        ? (() => {
            let d = new Date(latest.date + "T12:00:00");
            d.setDate(d.getDate() - 7);
            return d.toLocaleDateString("sv-SE");
          })()
        : null,
      prior = cutDate ? trend.filter((x) => x.date <= cutDate).at(-1) : null,
      days =
        latest && prior
          ? (new Date(latest.date + "T12:00:00") -
              new Date(prior.date + "T12:00:00")) /
            864e5
          : 0,
      weeklyChange =
        days > 0 ? round(((latest.trend - prior.trend) / days) * 7) : null,
      allAvg = all.length
        ? all.reduce((a, x) => a + x.t.kcal, 0) / all.length
        : 0,
      adaptive = adaptiveEstimate(
        state.logs,
        state.plans,
        state.weights,
        today(),
      ),
      tdee = adaptive?.kcal ?? null;
    return {
      last7,
      n,
      avg,
      adherence,
      latest,
      weeklyChange,
      tdee,
      allCount: all.length,
      proteinKg:
        n && latest?.trend && avg("p") !== "—"
          ? round(avg("p") / latest.trend)
          : null,
    };
  }
  function progressPage() {
    let w = [...state.weights].sort((a, b) => a.date.localeCompare(b.date)),
      filtered =
        state.range === "all"
          ? w
          : w.filter((x) => {
              let d = new Date();
              d.setDate(d.getDate() - Number(state.range));
              return (
                x.date >=
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
              );
            }),
      trendAll = weightTrend(w),
      trendById = new Map(trendAll.map((x) => [x.id, x.trend])),
      last = w.at(-1),
      first = w[0],
      avg =
        w.slice(-7).length >= 7
          ? round(w.slice(-7).reduce((a, x) => a + x.kg, 0) / 7)
          : null,
      cur = last?.kg,
      change = cur && first ? round(cur - first.kg) : null,
      min = filtered.length ? Math.min(...filtered.map((x) => x.kg)) : 0,
      max = filtered.length ? Math.max(...filtered.map((x) => x.kg)) : 1,
      span = Math.max(max - min + 2, 1),
      start = filtered.length
        ? new Date(filtered[0].date + "T12:00:00").getTime()
        : 0,
      end = filtered.length
        ? new Date(filtered.at(-1).date + "T12:00:00").getTime()
        : start,
      pos = (date) =>
        end === start
          ? 150
          : ((new Date(date + "T12:00:00").getTime() - start) / (end - start)) *
            300,
      y = (kg) => 10 + ((max + 1 - kg) / span) * 160,
      pts = filtered.map((x) => ({ x: pos(x.date), y: y(x.kg) })),
      tpts = filtered.map((x) => ({
        x: pos(x.date),
        y: y(trendById.get(x.id)),
      })),
      path = pts
        .map((p, i) => `${i ? "L" : "M"}${p.x + 20},${p.y + 10}`)
        .join(" "),
      trendPath = tpts
        .map((p, i) => `${i ? "L" : "M"}${p.x + 20},${p.y + 10}`)
        .join(" "),
      wp = weeklyProgress();
    return `<div class="datehead"><div><h1>Progresso</h1><div class="muted small">Tendências, sem presumir medições</div></div><button class="primary" id="addWeight">＋ Peso</button></div><div class="statgrid"><div class="stat"><span class="muted small">Peso atual</span><strong>${cur ? cur + " kg" : "—"}</strong><small class="muted">${last ? new Date(last.date + "T12:00:00").toLocaleDateString("pt-BR") : "Sem registro"}</small></div><div class="stat"><span class="muted small">Peso-alvo</span><strong>${state.settings.targetWeight} kg</strong><small class="muted">Alvo ajustável</small></div><div class="stat"><span class="muted small">Variação registrada</span><strong>${change === null ? "—" : (change > 0 ? "+" : "") + change + " kg"}</strong><small class="muted">desde a 1ª pesagem</small></div><div class="stat"><span class="muted small">Tendência de peso</span><strong>${wp.latest ? round(wp.latest.trend) + " kg" : "—"}</strong><small class="muted">média móvel exponencial</small></div></div><div class="card"><div class="row between" style="margin-bottom:14px"><b>Histórico de peso</b></div><div class="range">${[
      ["7", "7 dias"],
      ["30", "30 dias"],
      ["90", "90 dias"],
      ["all", "Tudo"],
    ]
      .map(
        ([v, l]) =>
          `<button data-range="${v}" class="${String(state.range) === v ? "active" : ""}">${l}</button>`,
      )
      .join(
        "",
      )}</div>${filtered.length ? `<svg class="chart" viewBox="0 0 340 210" preserveAspectRatio="none"><path d="M20 190H330" stroke="var(--line)"/><path d="${path}" fill="none" stroke="#b4c6b7" stroke-width="2"/><path d="${trendPath}" fill="none" stroke="var(--green)" stroke-width="3"/>${pts.map((p, i) => `<circle cx="${p.x + 20}" cy="${p.y + 10}" r="4" fill="#b4c6b7"/><text x="${p.x + 20}" y="${p.y}" text-anchor="middle" font-size="10" fill="var(--muted)">${filtered[i].kg}</text>`).join("")}<text x="20" y="205" font-size="10" fill="var(--muted)">${new Date(filtered[0].date + "T12:00:00").toLocaleDateString("pt-BR")}</text><text x="320" y="205" text-anchor="end" font-size="10" fill="var(--muted)">${new Date(filtered.at(-1).date + "T12:00:00").toLocaleDateString("pt-BR")}</text></svg>` : '<div class="empty">Registre seu peso para ver as medições reais em um gráfico.</div>'}<div class="small muted">Cinza: pesagens reais · Verde: tendência suavizada. ${wp.weeklyChange === null ? "Registre mais pesagens para calcular a mudança semanal." : `Mudança semanal da tendência: ${wp.weeklyChange > 0 ? "+" : ""}${wp.weeklyChange} kg.`}</div></div><div class="card"><h2>Progresso semanal</h2><div class="small muted">Últimos 7 dias · ${wp.n} dia(s) marcado(s) como completo(s)</div><div class="statgrid" style="margin-top:10px"><div class="stat"><span class="muted small">Calorias médias</span><strong>${wp.n ? wp.avg("kcal") : "—"} kcal</strong></div><div class="stat"><span class="muted small">Proteína média</span><strong>${wp.n ? wp.avg("p") : "—"} g</strong></div><div class="stat"><span class="muted small">Carboidratos médios</span><strong>${wp.n ? wp.avg("c") : "—"} g</strong></div><div class="stat"><span class="muted small">Gorduras médias</span><strong>${wp.n ? wp.avg("f") : "—"} g</strong></div><div class="stat"><span class="muted small">Aderência calórica</span><strong>${wp.n ? wp.adherence + "/" + wp.n : "—"}</strong><small class="muted">dentro de ±10% da meta</small></div><div class="stat"><span class="muted small">Proteína por peso</span><strong>${wp.n && wp.proteinKg ? wp.proteinKg + " g/kg" : "—"}</strong><small class="muted">com peso de tendência</small></div></div>${wp.tdee ? `<div class="note"><b>Gasto diário estimado: ${wp.tdee} kcal</b> · estimativa exploratória com alimentação e pesagens no mesmo período. Usa a premissa simplificada de 7.700 kcal/kg; hidratação e composição corporal podem alterar o resultado. Não altera suas metas.</div>` : '<div class="note">A estimativa de gasto exige pelo menos 14 dias consecutivos completos, com alimentos registrados, e 10 pesagens no mesmo período de até 28 dias.</div>'}</div><div class="sectiontitle"><h2>Pesagens</h2><span class="muted small">${w.length} registros</span></div><div class="card">${
      w
        .slice()
        .reverse()
        .map(
          (x) =>
            `<div class="listitem"><span>${new Date(x.date + "T12:00:00").toLocaleDateString("pt-BR")}${x.waist ? `<small class="muted"> · Cintura ${x.waist} cm</small>` : ""}</span><span><b>${x.kg} kg</b> <button class="linkbtn danger" data-del-weight="${esc(x.id)}">×</button></span></div>`,
        )
        .join("") || '<div class="empty">Sem pesagens salvas.</div>'
    }</div>`;
  }
  function settingsPage() {
    let s = state.settings;
    return `<div class="datehead"><div><h1>Ajustes</h1><div class="muted small">Tudo permanece neste dispositivo</div></div></div><div class="card"><h2>Metas diárias</h2><div class="grid2">${field("Calorias (kcal)", "kcal", s.kcal, "number")}${field("Proteína (g)", "p", s.p, "number")}${field("Carboidratos (g)", "c", s.c, "number")}${field("Gorduras (g)", "f", s.f, "number")}</div><div class="note">Metas de partida, não prescrição médica. Ajuste conforme peso, treino e recuperação.</div><button class="primary" id="saveTargets">Salvar metas</button></div><div class="card"><h2>Perfil pessoal</h2><div class="grid2">${field("Altura (cm)", "height", s.height, "number")}${field("Peso-alvo (kg)", "targetWeight", s.targetWeight, "number")}${field("Peso inicial para estimar treino (kg)", "initialWeight", s.initialWeight || "", "number")}</div><div class="field"><label>Observação do perfil</label><textarea id="profileNote" rows="2">${esc(s.profileNote || "")}</textarea></div><button class="primary" id="saveProfile">Salvar perfil</button></div><div class="card"><h2>Preferências</h2><label class="row between"><span>Modo escuro</span><input class="toggle" type="checkbox" id="darkToggle" ${s.dark ? "checked" : ""}></label><hr style="border:0;border-top:1px solid var(--line);margin:14px 0"><label class="row between"><span>Hidratação no diário</span><input class="toggle" type="checkbox" id="waterToggle" ${s.water ? "checked" : ""}></label><div class="field"><label>Meta de água (ml)</label><input id="waterTarget" type="number" value="${s.waterTarget}" min="0"></div></div><div class="card"><h2>Alimentos e refeições</h2><div class="row"><button class="secondary" id="manageFoods">Editar alimentos</button><button class="secondary" id="manageMeals">Modelos de refeição</button><button class="secondary" id="productsSettings">Buscar produtos por marca</button></div></div><div class="card"><h2>Seus dados</h2><div class="row" style="flex-wrap:wrap"><button class="secondary" id="exportJson">Exportar backup JSON</button><button class="secondary" id="importJson">Restaurar backup</button><input id="importFile" type="file" accept="application/json" class="hidden"><button class="secondary" id="csvLogs">CSV · alimentos</button><button class="secondary" id="csvWeights">CSV · peso</button><button class="secondary" id="csvTraining">CSV · treinos</button><button class="secondary" id="exportXlsx">Exportar Excel (.xlsx)</button></div><div class="note">O Excel reúne todos os dias registrados em abas de diário, treinos, pesagens, plano, alimentos e metas. A exportação é feita neste aparelho; nada é enviado automaticamente. Seus registros são guardados localmente pelo navegador. Limpar os dados do Safari pode apagá-los; mantenha um backup.</div><button class="linkbtn danger" id="clearAll">Apagar todos os dados locais…</button></div><div class="card"><h2>Privacidade e hospedagem</h2><div class="small muted">NutriTrack não usa login, analytics ou sincronização. A consulta opcional ao Open Food Facts envia apenas a marca ou código pesquisado ao serviço, além dos dados normais de conexão; diário, peso e metas não são enviados. Produtos salvos têm fonte Open Food Facts, licença ODbL. Os registros ficam localmente no aparelho. Estado de armazenamento persistente: ${state.storagePersistent === true ? "concedido pelo navegador" : state.storagePersistent === false ? "não concedido; exporte backups com frequência" : "indisponível neste contexto"}. Em publicação estática, o provedor serve apenas os arquivos do app. PWA e modo offline exigem HTTPS na hospedagem inicial. Dados locais ainda podem ser apagados se o usuário limpar os dados, remover o app ou o iPhone precisar liberar espaço.</div><button class="secondary" id="requestPersistence" ${state.storagePersistent === true ? "disabled" : ""}>Solicitar armazenamento persistente</button></div></div>`;
  }
  function field(label, key, val, type = "text") {
    return `<div class="field"><label>${label}</label><input data-setting="${key}" type="${type}" value="${esc(val)}" ${type === "number" ? 'min="0" step="any"' : ""}></div>`;
  }
  function bindApp() {
    $("#backupQuick")?.addEventListener("click", exportJson);
    $("#jumpDate")?.addEventListener("change", (e) => {
      if (e.target.value) {
        state.date = e.target.value;
        render();
      }
    });
    document.querySelectorAll("[data-date]").forEach(
      (b) =>
        (b.onclick = () => {
          state.date = b.dataset.date;
          state.page = "today";
          render();
        }),
    );
    document
      .querySelectorAll("[data-del-log]")
      .forEach((b) => (b.onclick = () => deleteLog(b.dataset.delLog)));
    document
      .querySelectorAll("[data-del-water]")
      .forEach((b) => (b.onclick = () => deleteLog(b.dataset.delWater)));
    document
      .querySelectorAll("[data-edit]")
      .forEach((b) => (b.onclick = () => editEntry(b.dataset.edit)));
    document
      .querySelectorAll("[data-del-weight]")
      .forEach((b) => (b.onclick = () => deleteWeight(b.dataset.delWeight)));
    document
      .querySelectorAll("[data-training-edit]")
      .forEach(
        (b) => (b.onclick = () => trainingModal(b.dataset.trainingEdit)),
      );
    document
      .querySelectorAll("[data-training-del]")
      .forEach(
        (b) => (b.onclick = () => deleteTraining(b.dataset.trainingDel)),
      );
    document.querySelectorAll("[data-range]").forEach(
      (b) =>
        (b.onclick = () => {
          state.range = b.dataset.range;
          render();
        }),
    );
    $("#prevDay")?.addEventListener("click", () => shiftDate(-1));
    $("#nextDay")?.addEventListener("click", () => shiftDate(1));
    $("#goToday")?.addEventListener("click", () => {
      state.date = today();
      render();
    });
    $("#prevMonth")?.addEventListener("click", () => moveMonth(-1));
    $("#nextMonth")?.addEventListener("click", () => moveMonth(1));
    $("#addOnDate")?.addEventListener("click", () => foodModal());
    $("#copyDay")?.addEventListener("click", copyDay);
    $("#addFab").onclick = () => foodModal();
    $("#toggleDayComplete")?.addEventListener("click", toggleDayComplete);
    $("#weightQuick")?.addEventListener("click", weightModal);
    $("#addWeight")?.addEventListener("click", weightModal);
    $("#planManageMeals")?.addEventListener("click", manageMeals);
    $("#trainingQuick")?.addEventListener("click", trainingModal);
    $("#planPrev")?.addEventListener("click", () => shiftPlanDate(-1));
    $("#planNext")?.addEventListener("click", () => shiftPlanDate(1));
    $("#planToday")?.addEventListener("click", () => {
      state.date = today();
      render();
    });
    $("#addPlannedMeal")?.addEventListener("click", () => plannedMealModal());
    document
      .querySelectorAll("[data-plan-slot]")
      .forEach((b) => (b.onclick = () => plannedMealModal(b.dataset.planSlot)));
    document
      .querySelectorAll("[data-plan-template]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            addTemplateToPlan(b.dataset.planTemplate, $("#planSlot").value)),
      );
    document
      .querySelectorAll("[data-plan-log]")
      .forEach((b) => (b.onclick = () => logPlannedMeal(b.dataset.planLog)));
    document
      .querySelectorAll("[data-plan-del]")
      .forEach((b) => (b.onclick = () => removePlannedMeal(b.dataset.planDel)));
    $("#addTrainingCalendar")?.addEventListener("click", trainingModal);
    $("#waterQuick")?.addEventListener("click", addWater);
    $("#saveTargets")?.addEventListener("click", saveSettings);
    $("#saveProfile")?.addEventListener("click", saveProfile);
    $("#darkToggle")?.addEventListener("change", (e) => {
      state.settings.dark = e.target.checked;
      saveSettings();
    });
    $("#waterToggle")?.addEventListener("change", (e) => {
      state.settings.water = e.target.checked;
      saveSettings();
    });
    $("#themeBtn").onclick = () => {
      state.settings.dark = !state.settings.dark;
      saveSettings();
    };
    $("#productsSettings")?.addEventListener("click", onlineFoodsModal);
    $("#manageFoods")?.addEventListener("click", manageFoods);
    $("#manageMeals")?.addEventListener("click", manageMeals);
    $("#exportJson")?.addEventListener("click", exportJson);
    $("#importJson")?.addEventListener("click", () => $("#importFile").click());
    $("#importFile")?.addEventListener("change", importJson);
    $("#csvLogs")?.addEventListener("click", () => exportCsv("logs"));
    $("#csvWeights")?.addEventListener("click", () => exportCsv("weights"));
    $("#csvTraining")?.addEventListener("click", () => exportCsv("training"));
    $("#exportXlsx")?.addEventListener("click", exportXlsx);
    $("#clearAll")?.addEventListener("click", clearAll);
    $("#requestPersistence")?.addEventListener("click", async () => {
      state.storagePersistent = await requestStoragePersistence();
      render();
      toast(
        state.storagePersistent === true
          ? "Armazenamento persistente concedido"
          : "O navegador não concedeu armazenamento persistente",
      );
    });
    document
      .querySelectorAll("[data-add-meal]")
      .forEach((b) => (b.onclick = () => foodModal(b.dataset.addMeal)));
    document
      .querySelectorAll("[data-repeat-meal]")
      .forEach(
        (b) => (b.onclick = () => repeatYesterday(b.dataset.repeatMeal)),
      );
    document
      .querySelectorAll("[data-save-meal]")
      .forEach(
        (b) => (b.onclick = () => saveDiaryMealAsTemplate(b.dataset.saveMeal)),
      );
  }
  function $(s) {
    return document.querySelector(s);
  }
  function shiftDate(n) {
    let d = new Date(state.date + "T12:00:00");
    d.setDate(d.getDate() + n);
    state.date = d.toLocaleDateString("sv-SE");
    render();
  }
  function moveMonth(n) {
    state.month = new Date(
      state.month.getFullYear(),
      state.month.getMonth() + n,
      1,
    );
    render();
  }
  let modalReturnFocus = null;
  function showModal(html) {
    if (!$("#modal").classList.contains("show"))
      modalReturnFocus = document.activeElement;
    $("#sheet").innerHTML = html;
    $("#modal").classList.add("show");
    document.body.classList.add("modal-open");
    for (const el of document.querySelectorAll("header, nav, main, #addFab"))
      el.inert = true;
    $("#modal").onclick = (e) => {
      if (e.target.id === "modal") closeModal();
    };
    enhanceControls($("#sheet"));
    queueMicrotask(() => {
      (
        $('#sheet input:not([type="hidden"]), #sheet select, #sheet button') ||
        $("#sheet")
      ).focus();
      wrapAsyncButtons($("#sheet"));
    });
  }
  function closeModal() {
    onlineController?.abort();
    $("#modal").classList.remove("show");
    document.body.classList.remove("modal-open");
    for (const el of document.querySelectorAll("header, nav, main, #addFab"))
      el.inert = false;
    (modalReturnFocus?.isConnected ? modalReturnFocus : $("#addFab")).focus();
  }
  function enhanceControls(root) {
    root.querySelectorAll(".field").forEach((field, i) => {
      const input = field.querySelector("input,select,textarea"),
        label = field.querySelector("label");
      if (input && label) {
        if (!input.id) input.id = "field-" + state.page + "-" + i;
        label.htmlFor = input.id;
      }
      if (input?.type === "number") input.inputMode = "decimal";
    });
    root.querySelectorAll("button").forEach((b) => {
      if (b.textContent.trim() === "×")
        b.setAttribute(
          "aria-label",
          b.id === "closeModal" ? "Fechar janela" : "Remover item",
        );
      if (b.textContent.trim() === "‹")
        b.setAttribute("aria-label", "Data anterior");
      if (b.textContent.trim() === "›")
        b.setAttribute("aria-label", "Próxima data");
    });
    const title = $("#sheet h2");
    if (title && root.id === "sheet") {
      title.id = "dialogTitle";
      root.setAttribute("aria-labelledby", "dialogTitle");
    }
  }
  function wrapAsyncButtons(root) {
    root.querySelectorAll("button").forEach((button) => {
      const handler = button.onclick;
      if (!handler || handler.nutriWrapped) return;
      button.onclick = async function (event) {
        if (button.disabled) return;
        button.disabled = true;
        try {
          await handler.call(this, event);
        } catch (error) {
          console.error(error);
          toast(
            "Não foi possível salvar. Confira o espaço disponível e tente novamente.",
          );
        } finally {
          if (button.isConnected) button.disabled = false;
        }
      };
      button.onclick.nutriWrapped = true;
    });
  }
  document.addEventListener("keydown", (event) => {
    if (!$("#modal").classList.contains("show")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
    }
    if (event.key === "Tab") {
      const controls = [
        ...$("#sheet").querySelectorAll(
          'button:not(:disabled), input:not([type="hidden"]):not(:disabled), select, textarea, a[href]',
        ),
      ].filter((e) => e.getClientRects().length);
      const first = controls[0],
        last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  function foodFromSavedLog(saved) {
    return {
      id: saved.foodId || "saved:" + saved.id,
      name: saved.foodName,
      unit: saved.unit,
      serving: Number(saved.qty) || 100,
      kcal: saved.kcal,
      p: saved.p,
      c: saved.c,
      f: saved.f,
      unknownMacros: saved.unknownMacros || [],
      note: saved.approx ? "Estimativa" : "",
    };
  }
  function foodModal(meal = "Lanche", existing = null) {
    state.editLog = existing;
    const old = existing ? state.logs.find((x) => x.id === existing) : null;
    // Editing scales the saved snapshot, so changing the catalog never rewrites history.
    const oldFood = old ? foodFromSavedLog(old) : null;
    state.selectedMeal = old?.meal || meal;
    showModal(
      '<div class="row between"><h2>' +
        (old ? "Editar item" : "Adicionar alimentos") +
        '</h2><button class="iconbtn" id="closeModal">×</button></div>' +
        '<div class="field"><label>Refeição · ' +
        esc(fmtDate(state.date)) +
        '</label><select id="mealTarget">' +
        ["Café da manhã", "Almoço", "Lanche", "Jantar", "Outros"]
          .map(
            (x) =>
              "<option " +
              (x === state.selectedMeal ? "selected" : "") +
              ">" +
              x +
              "</option>",
          )
          .join("") +
        "</select></div>" +
        '<div class="field"><label>Buscar no aparelho</label><input id="foodSearch" type="search" placeholder="Ex.: pao, frango grelhado…" autocomplete="off"></div>' +
        '<div class="searchfilters"><button class="secondary small" id="favoritesFilter" aria-pressed="false">☆ Favoritos</button><select id="foodCategory" aria-label="Categoria de alimento"><option value="">Todas as categorias</option>' +
        [...new Set(state.foods.map((x) => x.category).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b, "pt-BR"))
          .map((c) => "<option>" + esc(c) + "</option>")
          .join("") +
        '</select><label class="small"><input type="checkbox" id="readyFilter" checked> Prontos para registrar</label></div>' +
        '<div class="searchresults" id="results" aria-live="polite"></div><div id="picked">' +
        (old ? pickedForm(oldFood, old) : "") +
        "</div>" +
        '<details class="more-options"><summary>Mais opções de registro</summary><div class="quick-actions"><button class="secondary small" id="quickModels">Modelos de refeição</button><button class="secondary small" id="newFood">Criar alimento</button><button class="secondary small" id="onlineFoods">Buscar produto por marca / código</button><button class="secondary small" id="manualEntry">Informar calorias e macros</button></div></details><button class="secondary" id="doneAdding" style="width:100%;margin-top:14px">Concluir</button>',
    );
    $("#closeModal").onclick = closeModal;
    $("#doneAdding").onclick = closeModal;
    $("#mealTarget").onchange = () => {
      state.selectedMeal = $("#mealTarget").value;
    };
    const draw = () => drawResults($("#foodSearch").value);
    $("#foodSearch").oninput = draw;
    $("#foodCategory").onchange = draw;
    $("#readyFilter").onchange = draw;
    $("#favoritesFilter").onclick = () => {
      let b = $("#favoritesFilter");
      b.setAttribute(
        "aria-pressed",
        String(b.getAttribute("aria-pressed") !== "true"),
      );
      draw();
    };
    $("#quickModels").onclick = showMealPicker;
    $("#newFood").onclick = () => newFoodModal();
    $("#onlineFoods").onclick = onlineFoodsModal;
    $("#manualEntry").onclick = () => manualEntryModal($("#mealTarget").value);
    if (old) bindPicked();
    else draw();
  }

  function manualEntryModal(meal = "Lanche", existingId = null) {
    let old = existingId ? state.logs.find((x) => x.id === existingId) : null;
    showModal(
      `<div class="row between"><h2>${old ? "Editar registro manual" : "Informar calorias e macros"}</h2><button class="iconbtn" id="closeModal">×</button></div><div class="field"><label>Adicionar em</label><select id="manualMeal">${["Café da manhã", "Almoço", "Lanche", "Jantar", "Outros"].map((x) => `<option ${x === (old?.meal || meal) ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="field"><label>Descrição (opcional)</label><input id="manualName" maxlength="80" placeholder="Ex.: refeição fora de casa" value="${esc(old?.foodName === "Lançamento manual" ? "" : old?.foodName || "")}"></div><div class="field"><label>Calorias (kcal)</label><input id="manualKcal" type="number" inputmode="decimal" min="0" step="any" placeholder="Obrigatório" value="${old?.kcal ?? ""}"></div><div class="grid2">${[
        ["Proteína (g)", "p"],
        ["Carboidratos (g)", "c"],
        ["Gorduras (g)", "f"],
      ]
        .map(
          ([label, key]) =>
            `<div class="field"><label>${label}</label><input id="manual${key}" type="number" inputmode="decimal" min="0" step="any" placeholder="Não informado" value="${old?.unknownMacros?.includes(key) ? "" : (old?.[key] ?? "")}"></div>`,
        )
        .join(
          "",
        )}</div><div class="note">Macros em branco ficam como não informados; digite 0 apenas quando souber que é zero. Esse registro entra no total da refeição e do dia. Ele não será salvo na lista de alimentos.</div><button class="primary" id="saveManual" style="width:100%">${old ? "Salvar alterações" : "Adicionar à refeição"}</button>`,
    );
    $("#closeModal").onclick = closeModal;
    $("#saveManual").onclick = async () => {
      const num = (id) => {
        let raw = $(`#${id}`).value.trim().replace(",", ".");
        return raw === "" ? 0 : Number(raw);
      };
      let kcal = num("manualKcal"),
        p = num("manualp"),
        c = num("manualc"),
        f = num("manualf");
      if (
        !$("#manualKcal").value.trim() ||
        ![kcal, p, c, f].every(Number.isFinite) ||
        [kcal, p, c, f].some((v) => v < 0)
      ) {
        toast("Informe calorias válidas e macros iguais ou maiores que zero");
        return;
      }
      await put("logs", {
        id: old?.id || id(),
        date: old?.date || state.date,
        time: old?.time || new Date().toTimeString().slice(0, 5),
        kind: "food",
        manualEntry: true,
        foodName: $("#manualName").value.trim() || "Lançamento manual",
        qty: 1,
        unit: "registro",
        meal: $("#manualMeal").value,
        kcal: round(kcal),
        p: round(p),
        c: round(c),
        f: round(f),
        unknownMacros: ["p", "c", "f"].filter(
          (k) => !$("#manual" + k).value.trim(),
        ),
        approx: false,
      });
      closeModal();
      await refresh();
      toast(
        old ? "Registro manual atualizado" : "Valores adicionados à refeição",
      );
    };
  }

  function drawResults(query, unused = false, limit = 24) {
    if (!$("#results")) return;
    const favorite =
        $("#favoritesFilter")?.getAttribute("aria-pressed") === "true",
      category = $("#foodCategory")?.value || "",
      ready = $("#readyFilter")?.checked ?? true;
    const found = searchFoods(state.foods, query, {
      favorite,
      category,
      ready,
    });
    let recent = [];
    if (!query.trim() && !favorite && !category) {
      const seen = new Set();
      for (const log of [...state.logs].sort((a, b) =>
        (b.date + (b.time || "")).localeCompare(a.date + (a.time || "")),
      )) {
        const food = found.find((f) => f.id === log.foodId);
        if (food && !seen.has(food.id)) {
          seen.add(food.id);
          recent.push(food);
          if (recent.length === 6) break;
        }
      }
    }
    const card = (food) =>
      '<button class="result" data-pick="' +
      esc(food.id) +
      '" ' +
      (food.pendingLabel || food.unusable ? "disabled" : "") +
      "><b>" +
      (food.favorite ? "★ " : "") +
      esc(food.name) +
      "</b><small>" +
      (food.pendingLabel
        ? "Rótulo pendente · configure em Ajustes"
        : food.unusable
          ? "Calorias indisponíveis"
          : macroText(food, "kcal") +
            " kcal · P " +
            macroText(food, "p") +
            " / C " +
            macroText(food, "c") +
            " / G " +
            macroText(food, "f") +
            " g por " +
            food.serving +
            " " +
            esc(food.unit)) +
      "</small><small>" +
      esc(
        food.source ||
          (food.tacoItemId
            ? "TACO · item " + food.tacoItemId
            : "Cadastro pessoal"),
      ) +
      "</small></button>";
    $("#results").innerHTML =
      (recent.length
        ? '<div class="result-heading">Recentes</div>' +
          recent.map(card).join("")
        : "") +
      '<div class="result-heading">' +
      found.length +
      " alimentos encontrados" +
      (found.length > limit ? " · exibindo " + limit : "") +
      "</div>" +
      found.slice(0, limit).map(card).join("") +
      (found.length > limit
        ? '<button class="secondary" id="moreResults">Mostrar mais alimentos</button>'
        : "") +
      (!found.length
        ? '<div class="empty">Nenhum resultado com esses filtros. Tente outro preparo, limpe a categoria ou crie um alimento nas opções abaixo.</div>'
        : "");
    $("#moreResults")?.addEventListener("click", () =>
      drawResults(query, false, limit + 24),
    );
    document.querySelectorAll("[data-pick]").forEach(
      (b) =>
        (b.onclick = () => {
          const food = state.foods.find((x) => x.id === b.dataset.pick);
          $("#picked").innerHTML = pickedForm(food);
          $("#results").innerHTML = "";
          bindPicked();
          enhanceControls($("#sheet"));
          wrapAsyncButtons($("#sheet"));
          $("#qty").focus();
          $("#qty").select();
        }),
    );
  }

  function parseMeasures(text) {
    return String(text || "")
      .split(/\n/)
      .map((line) => {
        let m = line
          .trim()
          .match(
            /^(.+?)\s*(?:=|:)\s*([0-9]+(?:[.,][0-9]+)?)\s*(?:g|gramas?)?$/i,
          );
        return m
          ? { name: m[1].trim(), grams: Number(m[2].replace(",", ".")) }
          : null;
      })
      .filter((x) => x && x.name && x.grams > 0);
  }
  function pickedForm(f, old = null) {
    return `<div class="selected-food"><b>${esc(f.name)}</b><div class="small muted">${macroText(f, "kcal")} kcal por ${f.serving || 100} ${esc(f.unit || "g")} · P ${macroText(f, "p")} / C ${macroText(f, "c")} / G ${macroText(f, "f")} g · ${esc(f.note || "")}</div></div><input type="hidden" id="pickedId" value="${esc(f.id || "custom")}"/>${f.unit === "g" && (f.measures || []).length ? `<div class="field"><label>Medida caseira</label><select id="measurePick"><option value="">Escolher uma medida</option>${f.measures.map((m, i) => `<option value="${i}">${esc(m.name)} · ${m.grams} g</option>`).join("")}</select></div>` : ""}<div class="field"><label>Quantidade (${esc(f.unit || "g")})</label><input id="qty" type="number" min="0.1" step="any" value="${old?.qty || f.serving || 100}"></div><div class="row" style="gap:8px"><button class="secondary" id="qtyMinus" aria-label="Diminuir quantidade">−</button><button class="secondary" id="qtyPlus" aria-label="Aumentar quantidade">＋</button><span class="muted small" id="calcPreview"></span></div><button class="primary" id="saveLog" style="width:100%;margin-top:14px">${old ? "Salvar alterações" : "Adicionar este alimento"}</button>`;
  }
  function bindPicked() {
    let qty = $("#qty"),
      saved = state.editLog
        ? state.logs.find((x) => x.id === state.editLog)
        : null,
      selected = state.foods.find((x) => x.id === $("#pickedId").value),
      f = saved ? foodFromSavedLog(saved) : selected;
    function calc() {
      if (!qty) return;
      let v = Number(qty.value);
      if (!Number.isFinite(v) || v <= 0) {
        $("#calcPreview").textContent = "Informe uma quantidade válida";
        return;
      }
      let n = f ? logNutrition(f, v) : { kcal: 0, p: 0, c: 0, f: 0 };
      $("#calcPreview").textContent =
        `${macroText(n, "kcal")} kcal · P ${macroText(n, "p")} g · C ${macroText(n, "c")} g · G ${macroText(n, "f")} g`;
    }
    qty?.addEventListener("input", calc);
    $("#measurePick")?.addEventListener("change", (e) => {
      if (e.target.value === "") return;
      let m = f?.measures?.[Number(e.target.value)];
      if (m) {
        qty.value = String(m.grams);
        calc();
      }
    });
    calc();
    $("#qtyMinus").onclick = () => {
      qty.value = String(Math.max(0.1, Number(qty.value) - (f?.serving || 1)));
      calc();
    };
    $("#qtyPlus").onclick = () => {
      qty.value = String(Number(qty.value) + (f?.serving || 1));
      calc();
    };
    $("#saveLog").onclick = async () => {
      let q = Number(qty.value);
      if (!Number.isFinite(q) || q <= 0) {
        toast("Quantidade inválida");
        return;
      }
      if (f?.unusable) {
        toast("A TACO não traz valores nutricionais para este alimento");
        return;
      }
      let editing = !!state.editLog,
        food = f;
      if (food?.pendingLabel) {
        toast("Configure o rótulo antes de registrar");
        return;
      }
      if (!food) {
        let name = $("#customName")?.value || "Alimento personalizado";
        food = {
          id: "tmp",
          name,
          unit: "g",
          serving: 100,
          kcal: Number($("#customKcal")?.value) || 0,
          p: Number($("#customP")?.value) || 0,
          c: Number($("#customC")?.value) || 0,
          f: Number($("#customF")?.value) || 0,
          note: "Personalizado",
        };
      }
      let meal = $("#mealTarget")?.value || state.selectedMeal;
      state.selectedMeal = meal;
      let n = logNutrition(food, q),
        obj = {
          ...(saved || {}),
          id: state.editLog || id(),
          date: saved?.date || state.date,
          time: editing
            ? state.logs.find((x) => x.id === state.editLog)?.time ||
              new Date().toTimeString().slice(0, 5)
            : new Date().toTimeString().slice(0, 5),
          kind: "food",
          foodId: food.id,
          foodName: food.name,
          qty: q,
          unit: food.unit,
          meal,
          ...n,
          unknownMacros: food.unknownMacros || [],
          approx:
            (food.note || "").toLowerCase().includes("estimativa") ||
            food.note?.toLowerCase().includes("informe"),
        };
      await put("logs", obj);
      state.editLog = null;
      if (editing) {
        closeModal();
        await refresh();
        toast("Alterações salvas");
      } else {
        await refresh();
        $("#picked").innerHTML = "";
        $("#foodSearch").value = "";
        drawResults("");
        $("#foodSearch").focus();
        toast(`${food.name} adicionado a ${meal}. Você pode adicionar outro.`);
      }
    };
  }
  function editEntry(key) {
    let entry = state.logs.find((x) => x.id === key);
    if (entry?.manualEntry) manualEntryModal(entry.meal, key);
    else foodModal("Lanche", key);
  }
  async function deleteLog(key) {
    const entry = state.logs.find((x) => x.id === key);
    if (!entry) return;
    await del("logs", key);
    await refresh();
    toast("Registro removido");
    const button = document.createElement("button");
    button.className = "toast-action";
    button.textContent = "Desfazer";
    button.onclick = async () => {
      button.disabled = true;
      try {
        await put("logs", entry);
        await refresh();
        toast("Registro restaurado");
      } catch (e) {
        button.disabled = false;
        toast("Não foi possível restaurar. Tente novamente.");
      }
    };
    $("#toast").append(" ", button);
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(
      () => ($("#toast").style.display = "none"),
      10000,
    );
  }
  async function deleteWeight(k) {
    if (confirm("Apagar esta pesagem?")) {
      await del("weights", k);
      await refresh();
    }
  }

  function newFoodModal(prefill = null, existingId = null) {
    const old = existingId
        ? state.foods.find((f) => f.id === existingId)
        : null,
      f = old || prefill || {};
    showModal(
      '<div class="row between"><h2>' +
        (old
          ? "Editar alimento"
          : prefill
            ? "Conferir produto"
            : "Novo alimento") +
        '</h2><button class="iconbtn" id="closeModal">×</button></div>' +
        (prefill
          ? '<div class="note">Compare os dados com a embalagem. Confirme se a base é 100 g ou 100 ml. O produto ficará disponível offline depois de salvo. <a href="' +
            esc(prefill.sourceUrl) +
            '" target="_blank" rel="noopener noreferrer">Ver no Open Food Facts</a></div>'
          : "") +
        '<div class="field"><label>Nome</label><input id="nfName" value="' +
        esc(f.name || "") +
        '" required></div><div class="grid2"><div class="field"><label>Categoria</label><input id="nfCat" value="' +
        esc(f.category || "Personalizados") +
        '"></div><div class="field"><label>Unidade base</label><select id="nfUnit">' +
        [
          ...new Set(
            [
              "g",
              "ml",
              "unidade",
              "fatia",
              "colher",
              "porção",
              "medida",
              f.unit,
            ].filter(Boolean),
          ),
        ]
          .map(
            (u) =>
              "<option " +
              (u === (f.unit || "g") ? "selected" : "") +
              ">" +
              esc(u) +
              "</option>",
          )
          .join("") +
        '</select></div></div><div class="field"><label>Quantidade da base</label><input id="nfBase" type="number" min="0.1" step="any" value="' +
        (f.serving || 100) +
        '"></div><p class="small muted">Valores para <b id="nutritionBase"></b>. Deixe macros desconhecidos em branco.</p><div class="grid2">' +
        [
          ["Calorias (kcal)", "kcal"],
          ["Proteína (g)", "p"],
          ["Carboidratos (g)", "c"],
          ["Gorduras (g)", "f"],
        ]
          .map(
            ([label, key]) =>
              '<div class="field"><label>' +
              label +
              '</label><input type="number" min="0" step="any" id="nf' +
              key +
              '" value="' +
              (f.unknownMacros?.includes(key) ? "" : (f[key] ?? "")) +
              '" placeholder="' +
              (key === "kcal" ? "Obrigatório" : "Não informado") +
              '"></div>',
          )
          .join("") +
        "</div>" +
        '<div class="field"><label>Medidas caseiras em gramas · uma por linha</label><textarea id="nfMeasures" rows="2" placeholder="1 colher de sopa = 25 g">' +
        (f.measures || [])
          .map((m) => esc(m.name) + " = " + m.grams + " g")
          .join("\n") +
        '</textarea></div><div class="field"><label>Fonte / observação</label><textarea id="nfNote" rows="2" placeholder="Ex.: rótulo da embalagem">' +
        esc(f.pendingLabel ? "" : f.note || "") +
        '</textarea></div><button class="primary" id="saveFood" style="width:100%">' +
        (old ? "Salvar alterações" : "Conferi o rótulo · salvar alimento") +
        "</button>",
    );
    $("#closeModal").onclick = closeModal;
    const base = () => {
      $("#nutritionBase").textContent =
        ($("#nfBase").value || "—") + " " + $("#nfUnit").value;
      $("#nfMeasures").disabled = $("#nfUnit").value !== "g";
    };
    $("#nfBase").oninput = base;
    $("#nfUnit").onchange = () => {
      if ([1, 100].includes(Number($("#nfBase").value)))
        $("#nfBase").value = ["g", "ml"].includes($("#nfUnit").value) ? 100 : 1;
      base();
    };
    base();
    $("#saveFood").onclick = async () => {
      let nutrition;
      try {
        nutrition = validNutrition(
          Object.fromEntries(
            ["kcal", "p", "c", "f"]
              .map((k) => [k, $("#nf" + k).value])
              .concat([["serving", $("#nfBase").value]]),
          ),
        );
      } catch (e) {
        toast(e.message);
        return;
      }
      const name = $("#nfName").value.trim(),
        note = $("#nfNote").value.trim(),
        unit = $("#nfUnit").value;
      if (!name || !note) {
        toast("Informe o nome e a fonte dos valores.");
        return;
      }
      const text = $("#nfMeasures").value,
        measures = unit === "g" ? parseMeasures(text) : [];
      if (
        unit === "g" &&
        text.split(/\n/).filter((l) => l.trim()).length !== measures.length
      ) {
        toast("Confira as medidas. Exemplo: 1 colher = 25 g");
        return;
      }
      const food = {
        ...f,
        ...nutrition,
        id: old?.id || prefill?.id || id(),
        name,
        note,
        category: $("#nfCat").value.trim() || "Personalizados",
        unit,
        measures,
        pendingLabel: false,
        unusable: false,
        customized: true,
        favorite: f.favorite || false,
      };
      await put("foods", food);
      await refresh();
      if (old) {
        manageFoods();
        toast("Alimento atualizado; registros anteriores preservados");
      } else {
        foodModal(state.selectedMeal);
        $("#picked").innerHTML = pickedForm(food);
        $("#results").innerHTML = "";
        bindPicked();
        enhanceControls($("#sheet"));
        toast("Alimento salvo no aparelho");
      }
    };
  }

  function weightModal() {
    showModal(
      `<div class="row between"><h2>Registrar peso</h2><button class="iconbtn" id="closeModal">×</button></div><div class="field"><label>Data</label><input id="wDate" type="date" value="${state.date}"></div><div class="grid2"><div class="field"><label>Peso (kg)</label><input id="wKg" type="number" min="20" max="350" step=".1" placeholder="Ex.: 85,0"></div><div class="field"><label>Cintura (cm) · opcional</label><input id="wWaist" type="number" min="1" step=".1"></div></div><button class="primary" id="saveWeight" style="width:100%">Salvar pesagem</button>`,
    );
    $("#closeModal").onclick = closeModal;
    $("#saveWeight").onclick = async () => {
      let kg = Number($("#wKg").value);
      if (!kg || kg < 20 || kg > 350) {
        toast("Confira o peso informado");
        return;
      }
      let date = $("#wDate").value;
      if (!date) {
        toast("Informe a data da pesagem");
        return;
      }
      if ($("#wWaist").value && Number($("#wWaist").value) <= 0) {
        toast("Informe uma cintura maior que zero");
        return;
      }
      let old = state.weights.find((x) => x.date === date);
      await put("weights", {
        id: old?.id || id(),
        date,
        kg,
        waist: Number($("#wWaist").value) || null,
      });
      state.date = date;
      closeModal();
      await refresh();
      toast("Pesagem salva");
    };
  }
  function trainingModal(existingId = null) {
    let old = existingId
      ? state.training.find((x) => x.id === existingId)
      : null;
    showModal(
      `<div class="row between"><h2>${old ? "Editar treino" : "Treino e recuperação"}</h2><button class="iconbtn" id="closeModal">×</button></div><div class="field"><label>Data</label><input type="date" id="tDate" value="${old?.date || state.date}"></div><div class="field"><label>Atividade</label><select id="tType">${["Corrida", "Musculação", "Jiu-jítsu"].map((x) => `<option ${x === (old?.type || "Corrida") ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="grid2"><div class="field"><label>Duração (min)</label><input type="number" id="tMin" min="1" value="${old?.minutes || ""}"></div><div class="field"><label>Distância (km) · corrida, se souber</label><input type="number" id="tKm" min="0" step=".1" value="${old?.km || ""}"></div></div><div class="field"><label>Esforço percebido (1–10) · opcional</label><input type="number" id="tEffort" min="1" max="10" value="${old?.effort || ""}"></div><div class="field"><label>Energia, recuperação, dores · opcional</label><textarea id="tNote" rows="2">${esc(old?.note || "")}</textarea></div><div class="note" id="tEstimate">Informe a duração para calcular uma estimativa aproximada.</div><button class="primary" id="saveTraining" style="width:100%">Salvar treino</button>`,
    );
    $("#closeModal").onclick = closeModal;
    const getEstimate = () => {
      let date = $("#tDate").value,
        prior = [...state.weights]
          .filter((w) => w.date <= date)
          .sort((a, b) => a.date.localeCompare(b.date))
          .at(-1);
      return window.estimateExerciseCalories({
        type: $("#tType").value,
        minutes: $("#tMin").value,
        distanceKm: $("#tKm").value,
        effort: $("#tEffort").value,
        weightKg: prior?.kg || Number(state.settings.initialWeight),
      });
    };
    const updateEstimate = () => {
      let x = getEstimate();
      $("#tEstimate").textContent = x
        ? `Estimativa: ≈${x.kcal} kcal · baseada em ${x.weightKg} kg e intensidade média (${x.met} MET). É um valor aproximado do gasto total durante a sessão e não altera sua meta alimentar.`
        : "Informe duração e defina o peso inicial em Ajustes ou registre uma pesagem.";
    };
    ["#tDate", "#tType", "#tMin", "#tKm", "#tEffort"].forEach((sel) =>
      $(sel).addEventListener("input", updateEstimate),
    );
    $("#tType").addEventListener("change", updateEstimate);
    updateEstimate();
    $("#saveTraining").onclick = async () => {
      let min = Number($("#tMin").value);
      if (!Number.isFinite(min) || min <= 0 || !$("#tDate").value) {
        toast("Informe data e duração válidas");
        return;
      }
      if (
        ($("#tKm").value &&
          (!Number.isFinite(Number($("#tKm").value)) ||
            Number($("#tKm").value) < 0)) ||
        ($("#tEffort").value &&
          (Number($("#tEffort").value) < 1 || Number($("#tEffort").value) > 10))
      ) {
        toast("Confira a distância e o esforço de 1 a 10");
        return;
      }
      let date = $("#tDate").value,
        estimate = getEstimate();
      await put("training", {
        id: old?.id || id(),
        date,
        type: $("#tType").value,
        minutes: min,
        km: Number($("#tKm").value) || null,
        effort: Number($("#tEffort").value) || null,
        note: $("#tNote").value,
        kcalEstimate: estimate?.kcal || null,
        estimateWeightKg: estimate?.weightKg || null,
        estimateMet: estimate?.met || null,
      });
      closeModal();
      await refresh();
      toast(old ? "Treino atualizado" : "Treino registrado");
    };
  }
  async function deleteTraining(k) {
    if (confirm("Excluir este treino?")) {
      await del("training", k);
      await refresh();
      toast("Treino removido");
    }
  }
  async function addWater() {
    let ml = 250;
    await put("logs", {
      id: id(),
      date: state.date,
      time: new Date().toTimeString().slice(0, 5),
      kind: "water",
      ml,
    });
    await refresh();
    toast(`+${ml} ml registrados`);
  }

  async function saveProfile() {
    const next = { ...state.settings };
    for (const key of ["height", "targetWeight", "initialWeight"]) {
      const raw = document.querySelector('[data-setting="' + key + '"]').value,
        value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        toast("Confira os valores do perfil");
        return;
      }
      next[key] = value;
    }
    next.profileNote = $("#profileNote").value.trim();
    await put("settings", { id: "main", ...next });
    await refresh();
    toast("Perfil salvo");
  }
  async function saveSettings() {
    const next = { ...state.settings };
    for (const el of document.querySelectorAll(
      '[data-setting="kcal"],[data-setting="p"],[data-setting="c"],[data-setting="f"]',
    )) {
      const value = Number(el.value);
      if (!el.value.trim() || !Number.isFinite(value) || value < 0 || (el.dataset.setting === "kcal" && value === 0)) {
        toast("Informe metas válidas, iguais ou maiores que zero");
        return;
      }
      next[el.dataset.setting] = value;
    }
    if ($("#waterTarget")) {
      const value = Number($("#waterTarget").value);
      if (!Number.isFinite(value) || value <= 0) {
        toast("Informe uma meta de água maior que zero");
        return;
      }
      next.waterTarget = value;
    }
    await put("settings", { id: "main", ...next });
    await refresh();
    toast("Ajustes salvos");
  }

  function showMealPicker() {
    showModal(
      `<div class="row between"><h2>Modelos de refeição</h2><button class="iconbtn" id="closeModal">×</button></div><div class="searchresults">${state.meals.map((m) => `<button class="result" data-template="${esc(m.id)}"><b>${esc(m.name)}</b><small>${m.items.length} ingredientes</small></button>`).join("")}<button class="result" id="newTemplate">＋ Criar modelo</button></div>`,
    );
    $("#closeModal").onclick = closeModal;
    $("#newTemplate").onclick = () => templateEditor();
    document
      .querySelectorAll("[data-template]")
      .forEach((b) => (b.onclick = () => applyTemplate(b.dataset.template)));
  }
  async function applyTemplate(k) {
    let m = state.meals.find((x) => x.id === k);
    if (!m) return;
    let resolved = m.items.map((it) => ({
      food:
        state.foods.find((f) => f.id === it.foodId) ||
        state.foods.find((f) => f.name === it.name || f.legacyName === it.name),
      qty: it.qty,
    }));
    if (resolved.some((x) => !x.food)) {
      toast("Um ingrediente não está disponível");
      return;
    }
    if (resolved.some((x) => x.food.pendingLabel || x.food.unusable)) {
      toast(
        "Informe os valores do rótulo do produto em Ajustes → Alimentos antes de usar o modelo",
      );
      return;
    }
    let existing = logsDay().length;
    if (
      existing &&
      !confirm(
        `Adicionar ${m.name} ao dia? Os registros existentes serão mantidos.`,
      )
    )
      return;
    await bulkPut(
      "logs",
      resolved.map((x) => {
        let n = logNutrition(x.food, x.qty);
        return {
          id: id(),
          date: state.date,
          time: new Date().toTimeString().slice(0, 5),
          kind: "food",
          foodId: x.food.id,
          foodName: x.food.name,
          qty: x.qty,
          unit: x.food.unit,
          meal: state.selectedMeal || "Lanche",
          ...n,
          approx: (x.food.note || "").toLowerCase().includes("estimativa"),
        };
      }),
    );
    closeModal();
    await refresh();
    toast("Refeição adicionada");
  }
  function templateEditor(existingId = null) {
    let old = existingId ? state.meals.find((x) => x.id === existingId) : null,
      items = old ? (old.items || []).map((x) => ({ ...x })) : [];
    showModal(
      `<div class="row between"><h2>${old ? "Editar modelo" : "Criar modelo"}</h2><button class="iconbtn" id="closeModal">×</button></div><div class="field"><label>Nome do modelo</label><input id="mealName" value="${esc(old?.name || "")}" placeholder="Ex.: Meu almoço"></div><div class="field"><label>Ingredientes · selecione alimentos e quantidades</label><input id="mealFind" placeholder="Buscar ingrediente"></div><div class="searchresults" id="mealResults"></div><div id="mealItems" class="small"></div><button class="primary" id="saveTemplate" style="width:100%;margin-top:12px">${old ? "Salvar alterações" : "Salvar modelo"}</button>`,
    );
    $("#closeModal").onclick = closeModal;
    const draw = () => {
      $("#mealItems").innerHTML = items
        .map(
          (x, i) =>
            `<div class="listitem"><span>${esc(x.name)} · ${esc(x.unit)}</span><span class="actions"><input data-mi-qty="${i}" aria-label="Quantidade de ${esc(x.name)}" type="number" min="0.1" step="any" value="${x.qty}" style="width:85px"><button data-mi="${i}" class="linkbtn danger">×</button></span></div>`,
        )
        .join("");
      document.querySelectorAll("[data-mi]").forEach(
        (b) =>
          (b.onclick = () => {
            items.splice(+b.dataset.mi, 1);
            draw();
          }),
      );
      document
        .querySelectorAll("[data-mi-qty]")
        .forEach(
          (e) =>
            (e.oninput = () =>
              (items[Number(e.dataset.miQty)].qty = Number(e.value) || 0)),
        );
    };
    $("#mealFind").oninput = () => {
      $("#mealResults").innerHTML = state.foods
        .filter(
          (f) =>
            normalizeText(f.name).includes(
              normalizeText($("#mealFind").value),
            ) &&
            !f.pendingLabel &&
            !f.unusable,
        )
        .slice(0, 8)
        .map(
          (f) =>
            `<button class="result" data-mf="${esc(f.id)}">${esc(f.name)} · ${f.serving} ${esc(f.unit)}</button>`,
        )
        .join("");
      document.querySelectorAll("[data-mf]").forEach(
        (b) =>
          (b.onclick = () => {
            let f = state.foods.find((x) => x.id === b.dataset.mf);
            items.push({
              foodId: f.id,
              name: f.name,
              qty: Number(f.serving) || 1,
              unit: f.unit,
            });
            draw();
          }),
      );
    };
    draw();
    $("#saveTemplate").onclick = async () => {
      let name = $("#mealName").value.trim();
      if (
        !name ||
        !items.length ||
        items.some((x) => !Number(x.qty) || Number(x.qty) <= 0)
      ) {
        toast("Informe nome e ingredientes com quantidades válidas");
        return;
      }
      await put("meals", { id: old?.id || id(), name, items });
      closeModal();
      await refresh();
      toast(old ? "Modelo atualizado" : "Modelo salvo");
    };
  }
  function manageMeals() {
    showModal(
      `<div class="row between"><h2>Modelos de refeição</h2><button class="iconbtn" id="closeModal">×</button></div><button class="primary" id="addMealManage">＋ Criar modelo</button>${state.meals.map((m) => `<div class="listitem"><span>${esc(m.name)}<small class="muted">${m.items.length} ingredientes</small></span><span><button class="linkbtn" data-meal-edit="${esc(m.id)}">Editar</button><button class="linkbtn danger" data-meal-del="${esc(m.id)}">Excluir</button></span></div>`).join("")}`,
    );
    $("#closeModal").onclick = closeModal;
    $("#addMealManage").onclick = () => templateEditor();
    document
      .querySelectorAll("[data-meal-edit]")
      .forEach((b) => (b.onclick = () => templateEditor(b.dataset.mealEdit)));
    document.querySelectorAll("[data-meal-del]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (confirm("Excluir este modelo?")) {
            await del("meals", b.dataset.mealDel);
            await refresh();
            manageMeals();
          }
        }),
    );
  }
  async function repeatYesterday(meal) {
    let d = new Date(state.date + "T12:00:00");
    d.setDate(d.getDate() - 1);
    let y = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      items = state.logs.filter(
        (x) => x.date === y && x.kind === "food" && x.meal === meal,
      );
    if (!items.length) {
      toast(`Não há ${meal.toLowerCase()} registrada ontem`);
      return;
    }
    if (
      !confirm(
        `Adicionar ${items.length} item(ns) do ${meal.toLowerCase()} de ontem?`,
      )
    )
      return;
    for (let x of items)
      await put("logs", {
        ...x,
        id: id(),
        date: state.date,
        time: new Date().toTimeString().slice(0, 5),
      });
    await refresh();
    toast("Refeição de ontem repetida");
  }
  async function saveDiaryMealAsTemplate(meal) {
    let items = logsDay().filter((x) => x.meal === meal);
    if (!items.length) return;
    let name = prompt("Nome para este modelo de refeição", meal);
    if (!name?.trim()) return;
    await put("meals", {
      id: id(),
      name: name.trim(),
      items: items.map((x) => ({
        foodId: x.foodId,
        name: x.foodName,
        qty: Number(x.qty),
        unit: x.unit,
      })),
    });
    await refresh();
    toast("Refeição salva como modelo");
  }
  function copyDay() {
    let dates = [
      ...new Set(
        state.logs.filter((x) => x.kind === "food").map((x) => x.date),
      ),
    ]
      .sort()
      .reverse();
    if (!dates.length) {
      toast("Ainda não há refeições para copiar");
      return;
    }
    showModal(
      `<div class="row between"><h2>Copiar refeições</h2><button class="iconbtn" id="closeModal">×</button></div><div class="field"><label>Copiar de</label><select id="copyFrom">${dates.map((d) => `<option value="${d}">${fmtDate(d)}</option>`).join("")}</select></div><div class="field"><label>Copiar para</label><input id="copyTo" type="date" value="${state.date}"></div><div class="note">As refeições serão adicionadas à data de destino. Nenhum registro atual será apagado.</div><button class="primary" id="doCopy" style="width:100%">Copiar refeições</button>`,
    );
    $("#closeModal").onclick = closeModal;
    $("#doCopy").onclick = async () => {
      let from = $("#copyFrom").value,
        to = $("#copyTo").value;
      if (!to) {
        toast("Escolha uma data");
        return;
      }
      let orig = state.logs.filter((x) => x.date === from && x.kind === "food");
      if (
        state.logs.some((x) => x.date === to && x.kind === "food") &&
        !confirm(
          "Já existem alimentos nessa data. Adicionar as refeições sem apagar os registros atuais?",
        )
      )
        return;
      for (let x of orig)
        await put("logs", {
          ...x,
          id: id(),
          date: to,
          time: new Date().toTimeString().slice(0, 5),
        });
      state.date = to;
      closeModal();
      await refresh();
      toast(`${orig.length} itens copiados`);
    };
  }
  function manageFoods() {
    showModal(
      `<div class="row between"><h2>Alimentos</h2><button class="iconbtn" id="closeModal">×</button></div><button class="primary" id="addFoodManage">＋ Novo alimento</button><div class="field"><label>Buscar</label><input id="manageSearch"></div><div id="foodList"></div>`,
    );
    $("#closeModal").onclick = closeModal;
    $("#addFoodManage").onclick = () => newFoodModal();
    let draw = () => {
      $("#foodList").innerHTML = state.foods
        .filter(
          (f) =>
            normalizeText(f.name).includes(
              normalizeText($("#manageSearch").value),
            ) ||
            (f.aliases || []).some((n) =>
              normalizeText(n).includes(
                normalizeText($("#manageSearch").value),
              ),
            ),
        )
        .slice(0, $("#manageSearch").value ? 100 : 50)
        .map(
          (f) =>
            `<div class="listitem"><span>${f.favorite ? "★ " : ""}${esc(f.name)}<small class="muted">${round(f.kcal)} kcal/${f.serving}${esc(f.unit)}</small></span><span><button class="linkbtn" data-star="${esc(f.id)}">☆</button><button class="linkbtn" data-food-edit="${esc(f.id)}">Editar</button>${!f.seed ? `<button class="linkbtn danger" data-food-del="${esc(f.id)}">×</button>` : ""}</span></div>`,
        )
        .join("");
      document.querySelectorAll("[data-star]").forEach(
        (b) =>
          (b.onclick = async () => {
            let f = state.foods.find((x) => x.id === b.dataset.star);
            f.favorite = !f.favorite;
            await put("foods", f);
            await refresh();
            manageFoods();
          }),
      );
      document
        .querySelectorAll("[data-food-edit]")
        .forEach((b) => (b.onclick = () => editFood(b.dataset.foodEdit)));
      document.querySelectorAll("[data-food-del]").forEach(
        (b) =>
          (b.onclick = async () => {
            if (
              confirm(
                "Apagar este alimento? Registros anteriores são preservados.",
              )
            ) {
              await del("foods", b.dataset.foodDel);
              await refresh();
              manageFoods();
            }
          }),
      );
    };
    $("#manageSearch").oninput = draw;
    draw();
  }
  function editFood(key) {
    newFoodModal(null, key);
  }

  function download(name, blob) {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }
  async function exportJson() {
    state.settings.lastBackupAt = new Date().toISOString();
    await put("settings", { id: "main", ...state.settings });
    let data = {
      app: "NutriTrack",
      version: 2,
      exportedAt: state.settings.lastBackupAt,
      foods: state.foods,
      logs: state.logs,
      weights: state.weights,
      training: state.training,
      meals: state.meals,
      plans: state.plans,
      settings: state.settings,
    };
    download(
      "nutritrack-backup-" + today() + ".json",
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    toast("Backup JSON exportado");
  }
  function exportCsv(key) {
    let rows = state[key];
    let cols =
      key === "logs"
        ? [
            "date",
            "time",
            "foodName",
            "qty",
            "unit",
            "meal",
            "kcal",
            "p",
            "c",
            "f",
            "unknownMacros",
          ]
        : key === "weights"
          ? ["date", "kg", "waist"]
          : ["date", "type", "minutes", "km", "effort", "kcalEstimate", "note"];
    let csv = [
      cols.join(";"),
      ...rows.map((x) =>
        cols
          .map(
            (k) =>
              `"${String(x.unknownMacros?.includes(k) ? "" : (x[k] ?? "")).replace(/"/g, '""')}"`,
          )
          .join(";"),
      ),
    ].join("\r\n");
    download(
      `nutritrack-${key}-${today()}.csv`,
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
  }
  function xmlSafe(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
  function columnName(n) {
    let s = "";
    for (n++; n; n = Math.floor((n - 1) / 26))
      s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
    return s;
  }
  function crc32(bytes) {
    let crc = -1;
    for (let b of bytes) {
      crc ^= b;
      for (let k = 0; k < 8; k++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ -1) >>> 0;
  }
  function zipStored(files) {
    let enc = new TextEncoder(),
      locals = [],
      centrals = [],
      offset = 0,
      now = new Date(),
      time =
        (now.getHours() << 11) |
        (now.getMinutes() << 5) |
        Math.floor(now.getSeconds() / 2),
      date =
        ((now.getFullYear() - 1980) << 9) |
        ((now.getMonth() + 1) << 5) |
        now.getDate();
    const u16 = (n) => new Uint8Array([n & 255, (n >>> 8) & 255]),
      u32 = (n) =>
        new Uint8Array([
          n & 255,
          (n >>> 8) & 255,
          (n >>> 16) & 255,
          (n >>> 24) & 255,
        ]),
      join = (parts) => {
        let size = parts.reduce((n, x) => n + x.length, 0),
          out = new Uint8Array(size),
          at = 0;
        for (let x of parts) {
          out.set(x, at);
          at += x.length;
        }
        return out;
      };
    for (let [name, content] of Object.entries(files)) {
      let nm = enc.encode(name),
        data = enc.encode(content),
        crc = crc32(data),
        local = join([
          u32(0x04034b50),
          u16(20),
          u16(0x0800),
          u16(0),
          u16(time),
          u16(date),
          u32(crc),
          u32(data.length),
          u32(data.length),
          u16(nm.length),
          u16(0),
          nm,
          data,
        ]),
        central = join([
          u32(0x02014b50),
          u16(20),
          u16(20),
          u16(0x0800),
          u16(0),
          u16(time),
          u16(date),
          u32(crc),
          u32(data.length),
          u32(data.length),
          u16(nm.length),
          u16(0),
          u16(0),
          u16(0),
          u16(0),
          u32(0),
          u32(offset),
          nm,
        ]);
      locals.push(local);
      centrals.push(central);
      offset += local.length;
    }
    let cd = join(centrals),
      end = join([
        u32(0x06054b50),
        u16(0),
        u16(0),
        u16(files.length),
        u16(files.length),
        u32(cd.length),
        u32(offset),
        u16(0),
      ]);
    return join([...locals, cd, end]);
  }
  function exportXlsx() {
    let dailyDates = new Set([
        ...state.logs.map((x) => x.date),
        ...state.training.map((x) => x.date),
        ...state.weights.map((x) => x.date),
        ...state.plans.map((x) => x.date),
      ]),
      sheets = [
        [
          "Resumo diário",
          [
            "Data",
            "Dia completo",
            "Itens alimentares",
            "Calorias (kcal)",
            "Proteína (g)",
            "Carboidratos (g)",
            "Gorduras (g)",
            "Água (ml)",
            "Treinos",
            "Gasto estimado (kcal)",
            "Peso (kg)",
            "Refeições planejadas",
          ],
          [...dailyDates].sort().map((date) => {
            let foods = state.logs.filter(
                (x) => x.date === date && x.kind === "food",
              ),
              water = state.logs
                .filter((x) => x.date === date && x.kind === "water")
                .reduce((n, x) => n + (Number(x.ml) || 0), 0),
              t = totals(foods),
              workouts = state.training.filter((x) => x.date === date),
              weights = state.weights.filter((x) => x.date === date),
              plans = state.plans.find((x) => x.date === date);
            return [
              date,
              plans?.dayComplete ? "Sim" : "Não",
              foods.length,
              ...["kcal", "p", "c", "f"].map((k) =>
                t.unknownMacros.includes(k) ? "≥ " + round(t[k]) : t[k],
              ),
              water,
              workouts.length,
              workouts.reduce((n, x) => n + (Number(x.kcalEstimate) || 0), 0),
              weights.length ? weights[weights.length - 1].kg : "",
              (plans?.items || []).length,
            ];
          }),
        ],
        [
          "Diário alimentar",
          [
            "Data",
            "Hora",
            "Refeição",
            "Alimento / registro",
            "Quantidade",
            "Unidade",
            "Calorias (kcal)",
            "Proteína (g)",
            "Carboidratos (g)",
            "Gorduras (g)",
            "Estimativa",
          ],
          state.logs
            .slice()
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
            .map((x) =>
              x.kind === "water"
                ? [
                    x.date,
                    x.time || "",
                    "Água",
                    "Água",
                    x.ml,
                    "ml",
                    "",
                    "",
                    "",
                    "",
                    "",
                  ]
                : [
                    x.date,
                    x.time || "",
                    x.meal || "",
                    x.foodName || "",
                    x.qty,
                    x.unit || "",
                    ...["kcal", "p", "c", "f"].map((k) =>
                      x.unknownMacros?.includes(k) ? "Não informado" : x[k],
                    ),
                    x.approx ? "Sim" : "Não",
                  ],
            ),
        ],
        [
          "Treinos",
          [
            "Data",
            "Atividade",
            "Duração (min)",
            "Distância (km)",
            "Esforço (1–10)",
            "Gasto estimado (kcal)",
            "Peso usado (kg)",
            "Intensidade (MET)",
            "Observações",
          ],
          state.training
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((x) => [
              x.date,
              x.type,
              x.minutes,
              x.km ?? "",
              x.effort ?? "",
              x.kcalEstimate ?? "",
              x.estimateWeightKg ?? "",
              x.estimateMet ?? "",
              x.note || "",
            ]),
        ],
        [
          "Pesagens",
          ["Data", "Peso (kg)", "Cintura (cm)"],
          state.weights
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((x) => [x.date, x.kg, x.waist ?? ""]),
        ],
        [
          "Plano alimentar",
          [
            "Data",
            "Refeição",
            "Modelo",
            "Ingrediente",
            "Quantidade",
            "Unidade",
            "Calorias (kcal)",
            "Proteína (g)",
            "Carboidratos (g)",
            "Gorduras (g)",
            "Lançado no diário",
          ],
          state.plans
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .flatMap((p) =>
              (p.items || []).flatMap((m) =>
                (m.ingredients || []).length
                  ? m.ingredients.map((i) => [
                      p.date,
                      m.slot || "",
                      m.name || "",
                      i.foodName || "",
                      i.qty ?? "",
                      i.unit || "",
                      ...["kcal", "p", "c", "f"].map((k) =>
                        i.unknownMacros?.includes(k)
                          ? "Não informado"
                          : (i[k] ?? ""),
                      ),
                      state.logs.some(
                        (x) =>
                          x.sourcePlanItemId === m.id &&
                          x.sourcePlanIngredientId === i.id,
                      )
                        ? "Sim"
                        : "Não",
                    ])
                  : [
                      [
                        p.date,
                        m.slot || "",
                        m.name || "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "Não",
                      ],
                    ],
              ),
            ),
        ],
        [
          "Alimentos",
          [
            "Nome",
            "Categoria",
            "Base",
            "Unidade",
            "Calorias (kcal)",
            "Proteína (g)",
            "Carboidratos (g)",
            "Gorduras (g)",
            "Observação",
            "Favorito",
          ],
          state.foods
            .slice()
            .sort(
              (a, b) =>
                (a.category || "").localeCompare(b.category || "", "pt-BR") ||
                a.name.localeCompare(b.name, "pt-BR"),
            )
            .map((x) => [
              x.name,
              x.category,
              x.serving,
              x.unit,
              ...["kcal", "p", "c", "f"].map((k) =>
                x.unknownMacros?.includes(k) ? "Não informado" : x[k],
              ),
              x.note || "",
              x.favorite ? "Sim" : "Não",
            ]),
        ],
        [
          "Modelos de refeição",
          ["Modelo", "Ingrediente", "Quantidade", "Unidade"],
          state.meals.flatMap((m) =>
            (m.items || []).length
              ? m.items.map((i) => [
                  m.name,
                  i.name || "",
                  i.qty ?? "",
                  i.unit || "",
                ])
              : [[m.name, "", "", ""]],
          ),
        ],
        [
          "Metas",
          ["Configuração", "Valor"],
          Object.entries(state.settings).map(([k, v]) => [k, v]),
        ],
      ];
    let enc = new TextEncoder(),
      files = {
        "[Content_Types].xml":
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
          sheets
            .map(
              (_, i) =>
                `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
            )
            .join("") +
          "</Types>",
        "_rels/.rels":
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
        "xl/workbook.xml":
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
          sheets
            .map(
              ([name], i) =>
                `<sheet name="${xmlSafe(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
            )
            .join("") +
          "</sheets></workbook>",
        "xl/_rels/workbook.xml.rels":
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          sheets
            .map(
              (_, i) =>
                `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
            )
            .join("") +
          '<Relationship Id="rId' +
          (sheets.length + 1) +
          '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
        "xl/styles.xml":
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
      };
    sheets.forEach(([name, headers, rows], i) => {
      let allRows = [headers, ...rows],
        xmlRows = allRows
          .map(
            (row, ri) =>
              `<row r="${ri + 1}">` +
              row
                .map((v, ci) => {
                  if (v === null || v === undefined || v === "") return "";
                  let ref = columnName(ci) + (ri + 1),
                    style = ri === 0 ? ' s="1"' : "";
                  if (typeof v === "number" && Number.isFinite(v))
                    return `<c r="${ref}"${style}><v>${v}</v></c>`;
                  return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${xmlSafe(v)}</t></is></c>`;
                })
                .join("") +
              "</row>",
          )
          .join("");
      files[`xl/worksheets/sheet${i + 1}.xml`] =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${xmlRows}</sheetData></worksheet>`;
    });
    let zip = zipStored(files);
    download(
      `nutritrack-dados-${today()}.xlsx`,
      new Blob([zip], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );
    toast("Planilha Excel exportada");
  }
  function validateBackup(x) {
    const stores = ["foods", "logs", "weights", "training", "meals", "plans"],
      validDate = (v) =>
        typeof v === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(v) &&
        !Number.isNaN(Date.parse(v + "T12:00:00Z")) &&
        new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v,
      finite = (v) => (typeof v === "number" || (typeof v === "string" && v.trim() !== "")) && Number.isFinite(Number(v)),
      str = (v) => typeof v === "string";
    if (!x || x.app !== "NutriTrack" || x.version !== 2)
      throw Error("Formato ou versão de backup inválida");
    for (const s of ["foods", "logs", "weights"])
      if (!Array.isArray(x[s]))
        throw Error(`A lista ${s} está ausente ou inválida`);
    for (const s of stores)
      if (x[s] !== undefined && !Array.isArray(x[s]))
        throw Error(`A lista ${s} está inválida`);
    const arrays = Object.fromEntries(stores.map((s) => [s, x[s] || []]));
    arrays.foods = arrays.foods.map(normalizeLegacyFood);
    for (const f of arrays.foods)
      if (
        !f ||
        !str(f.id) ||
        !f.id ||
        !str(f.name) ||
        !f.name.trim() ||
        !["kcal", "p", "c", "f", "serving"].every((k) => finite(f[k])) ||
        Number(f.serving) <= 0 ||
        ["kcal", "p", "c", "f"].some((k) => Number(f[k]) < 0) ||
        (f.unit !== undefined && !str(f.unit)) ||
        (f.category !== undefined && !str(f.category)) ||
        (f.note !== undefined && !str(f.note)) ||
        (f.measures !== undefined &&
          (!Array.isArray(f.measures) ||
            f.measures.some(
              (m) =>
                !m ||
                !str(m.name) ||
                !m.name.trim() ||
                !finite(m.grams) ||
                Number(m.grams) <= 0,
            )))
      )
        throw Error("Há alimento incompleto no backup");
    for (const l of arrays.logs) {
      if (!l || !str(l.id) || !l.id || !validDate(l.date))
        throw Error("Há registro com data ou identificador inválido");
      if (l.time !== undefined && !/^\d{2}:\d{2}$/.test(l.time))
        throw Error("Há horário inválido no backup");
      if (l.kind === "food") {
        if (
          !str(l.foodName) ||
          !l.foodName.trim() ||
          !finite(l.qty) ||
          Number(l.qty) <= 0 ||
          !["kcal", "p", "c", "f"].every((k) => finite(l[k])) ||
          (l.unit !== undefined && !str(l.unit)) ||
          (l.meal !== undefined && !str(l.meal)) ||
          (l.foodId !== undefined && !str(l.foodId))
        )
          throw Error("Há registro alimentar incompleto no backup");
      } else if (l.kind === "water") {
        if (!finite(l.ml) || Number(l.ml) <= 0)
          throw Error("Há registro de água incompleto no backup");
      } else throw Error("Tipo de registro inválido no backup");
    }
    for (const w of arrays.weights)
      if (
        !w ||
        !str(w.id) ||
        !w.id ||
        !validDate(w.date) ||
        !finite(w.kg) ||
        Number(w.kg) <= 0 ||
        (w.waist !== undefined &&
          w.waist !== null &&
          (!finite(w.waist) || Number(w.waist) <= 0))
      )
        throw Error("Há pesagem inválida no backup");
    for (const t of arrays.training)
      if (
        !t ||
        !str(t.id) ||
        !t.id ||
        !validDate(t.date) ||
        !str(t.type) ||
        !t.type.trim() ||
        !finite(t.minutes) ||
        Number(t.minutes) <= 0 ||
        (t.km !== undefined &&
          t.km !== null &&
          (!finite(t.km) || Number(t.km) < 0)) ||
        (t.effort !== undefined &&
          t.effort !== null &&
          (!finite(t.effort) ||
            Number(t.effort) < 0 ||
            Number(t.effort) > 10)) ||
        (t.kcalEstimate !== undefined &&
          t.kcalEstimate !== null &&
          (!finite(t.kcalEstimate) || Number(t.kcalEstimate) < 0))
      )
        throw Error("Há treino inválido no backup");
    for (const m of arrays.meals)
      if (
        !m ||
        !str(m.id) ||
        !m.id ||
        !str(m.name) ||
        !m.name.trim() ||
        !Array.isArray(m.items) ||
        m.items.some(
          (i) =>
            !i ||
            !finite(i.qty) ||
            Number(i.qty) <= 0 ||
            (i.name !== undefined && !str(i.name)) ||
            (i.foodId !== undefined && !str(i.foodId)) ||
            (i.unit !== undefined && !str(i.unit)) ||
            (!str(i.name) && !str(i.foodId)),
        )
      )
        throw Error("Há modelo de refeição inválido no backup");
    for (const p of arrays.plans)
      if (
        !p ||
        !str(p.id) ||
        !p.id ||
        !validDate(p.date) ||
        !Array.isArray(p.items) ||
        p.items.some(
          (i) =>
            !i ||
            !str(i.id) ||
            !i.id ||
            !str(i.name) ||
            !i.name.trim() ||
            !str(i.slot) ||
            !Array.isArray(i.ingredients) ||
            i.ingredients.some(
              (g) =>
                !g ||
                !str(g.id) ||
                !g.id ||
                !str(g.foodName) ||
                !g.foodName.trim() ||
                !finite(g.qty) ||
                Number(g.qty) <= 0 ||
                !["kcal", "p", "c", "f"].every((k) => finite(g[k])),
            ),
        )
      )
        throw Error("Há plano inválido no backup");
    if (
      !x.settings ||
      typeof x.settings !== "object" ||
      Array.isArray(x.settings)
    )
      throw Error("Ajustes ausentes ou inválidos no backup");
    for (const k of [
      "kcal",
      "p",
      "c",
      "f",
      "height",
      "targetWeight",
      "initialWeight",
      "waterTarget",
    ])
      if (x.settings[k] !== undefined && !finite(x.settings[k]))
        throw Error(`Ajuste ${k} inválido no backup`);
    for (const k of ["water", "dark"])
      if (x.settings[k] !== undefined && typeof x.settings[k] !== "boolean")
        throw Error(`Ajuste ${k} inválido no backup`);
    if (x.settings.profileNote !== undefined && !str(x.settings.profileNote))
      throw Error("Observação de perfil inválida no backup");
    for (const list of [
      arrays.foods,
      arrays.logs,
      ...arrays.plans.map((p) => p.items.flatMap((i) => i.ingredients)),
    ])
      for (const item of list) {
        if (
          item.unknownMacros !== undefined &&
          (!Array.isArray(item.unknownMacros) ||
            item.unknownMacros.some(
              (k) => !["kcal", "p", "c", "f"].includes(k),
            ))
        )
          throw Error(
            "Há campos nutricionais desconhecidos inválidos no backup",
          );
      }
    for (const [name, records] of Object.entries(arrays)) {
      if (new Set(records.map(record => record.id)).size !== records.length)
        throw Error("Há identificadores repetidos na lista " + name);
    }
    return arrays;
  }

  async function importJson(e) {
    let f = e.target.files?.[0];
    if (!f) return;
    try {
      let x = JSON.parse(await f.text()),
        arrays = validateBackup(x);
      if (
        !confirm(
          "Restaurar este backup substituirá os dados locais atuais. Deseja continuar?",
        )
      )
        return;
      let names = [
          "foods",
          "logs",
          "weights",
          "training",
          "meals",
          "settings",
          "plans",
        ],
        tx = db.transaction(names, "readwrite");
      let done = new Promise((ok, no) => {
        tx.oncomplete = () => ok();
        tx.onerror = () => no(tx.error || new Error("Falha na restauração"));
        tx.onabort = () =>
          no(
            tx.error ||
              new Error("A restauração foi cancelada sem alterar os dados"),
          );
      });
      try {
        for (let name of names) {
          let store = tx.objectStore(name);
          store.clear();
          let items =
            name === "settings"
              ? x.settings
                ? [{ id: "main", ...x.settings }]
                : []
              : arrays[name] || [];
          for (let item of items) store.put(item);
        }
        await done;
      } catch (err) {
        try {
          tx.abort();
        } catch {}
        throw err;
      }
      await refresh();
      toast("Backup restaurado");
    } catch (err) {
      alert("Não foi possível importar: " + err.message);
    } finally {
      e.target.value = "";
    }
  }
  async function clearAll() {
    if (
      !confirm(
        "Apagar todos os alimentos, diários, pesagens e ajustes deste aparelho? Esta ação não pode ser desfeita.",
      )
    )
      return;
    for (let st of [
      "foods",
      "logs",
      "weights",
      "training",
      "meals",
      "settings",
      "plans",
    ])
      await new Promise((ok) => {
        let q = db.transaction(st, "readwrite").objectStore(st).clear();
        q.onsuccess = ok;
      });
    await initData();
    await refresh();
    toast("Dados locais apagados");
  }
  async function initData() {
    let foods = await all("foods"),
      foodMap = new Map(foods.map((f) => [f.id, f])),
      updates = [];
    for (let x of foodsSeed) {
      let saved = foodMap.get(x.id);
      if (!saved) {
        updates.push(x);
        foodMap.set(x.id, x);
      } else if (saved.seed && Number(saved.catalogVersion || 0) < 4) {
        let untouched =
          !saved.customized &&
          (Number(saved.catalogVersion || 0) >= 2 ||
            LEGACY_SEED_SIGNATURES[x.id] === seedSignature(saved));
        if (untouched) {
          let next = { ...x, favorite: saved.favorite ?? x.favorite };
          updates.push(next);
          foodMap.set(x.id, next);
        } else {
          let next = {
            ...saved,
            ...(x.tacoItemId
              ? { tacoItemId: x.tacoItemId, aliases: x.aliases }
              : {}),
            catalogVersion: 4,
            customized: true,
          };
          updates.push(next);
          foodMap.set(x.id, next);
        }
      }
    }
    for (let x of TACO_ALL) {
      let mappedSeed = foodsSeed.find((f) => f.tacoItemId === x.tacoItemId),
        mappedFood = mappedSeed && foodMap.get(mappedSeed.id);
      if (mappedFood && !mappedFood.customized) continue;
      let key = "taco-" + x.tacoItemId,
        saved = foodMap.get(key);
      if (
        saved?.seed &&
        !saved.customized &&
        Number(saved.catalogVersion || 0) < 4
      ) {
        let next = { ...x, id: key, favorite: saved.favorite ?? false };
        updates.push(next);
        foodMap.set(key, next);
      }
      if (!foodMap.has(key)) {
        let next = { ...x, id: key };
        updates.push(next);
        foodMap.set(key, next);
      }
    }
    if (updates.length) await bulkPut("foods", updates);
    let meals = await all("meals");
    if (!meals.length)
      for (let m of mealSeeds) {
        await put("meals", {
          id: id(),
          name: m.name,
          items: m.items.map(([name, qty]) => ({
            name,
            qty,
            foodId: foodsSeed.find(
              (f) => f.name === name || f.legacyName === name,
            )?.id,
            unit: "g",
          })),
        });
      }
    let s = await all("settings");
    if (!s.length) await put("settings", { id: "main", ...state.settings });
  }
  document.querySelectorAll(".tab").forEach(
    (b) =>
      (b.onclick = () => {
        state.page = b.dataset.page;
        render();
      }),
  );
  document.querySelector("#themeBtn").onclick = () => {
    state.settings.dark = !state.settings.dark;
    saveSettings();
  };

  let onlineController = null,
    onlineLastRequest = 0;
  const onlineCache = new Map();
  function onlineFoodsModal() {
    onlineController?.abort();
    showModal(
      '<div class="row between"><h2>Produtos por marca ou código</h2><button class="iconbtn" id="closeModal">×</button></div><p class="muted small">Amplie seu catálogo com produtos do Open Food Facts. Depois de conferir e salvar, você pode usá-los offline.</p><div class="field"><label>Tipo de consulta</label><select id="onlineMode"><option value="brand">Marca do produto</option><option value="barcode">Código de barras digitado</option></select></div><div class="field"><label id="onlineLabel">Marca (ex.: Nestlé)</label><input id="onlineQuery" autocomplete="off" maxlength="80"></div><label class="small" id="countryFilter"><input type="checkbox" id="onlineBrazil" checked> Produtos disponíveis no Brasil</label><button class="primary" id="onlineSearch" style="width:100%;margin:14px 0">Consultar Open Food Facts</button><div class="small muted">Ao consultar, a marca ou código digitado é enviado ao Open Food Facts. Nenhum registro do seu diário é enviado. Dados colaborativos: confira o rótulo antes de salvar. <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer">Open Food Facts</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">ODbL</a></div><div id="onlineResults" class="searchresults" aria-live="polite"></div><button class="secondary" id="onlineBack" style="margin-top:14px">Voltar ao registro local</button>',
    );
    $("#closeModal").onclick = closeModal;
    $("#onlineBack").onclick = () => foodModal(state.selectedMeal);
    $("#onlineMode").onchange = () => {
      const barcode = $("#onlineMode").value === "barcode";
      $("#onlineLabel").textContent = barcode
        ? "Código de barras (8 a 14 dígitos)"
        : "Marca (ex.: Nestlé)";
      $("#onlineQuery").inputMode = barcode ? "numeric" : "text";
      $("#countryFilter").hidden = barcode;
      $("#onlineResults").innerHTML = "";
    };
    $("#onlineSearch").onclick = () => runOnlineSearch(1);
    $("#onlineQuery").onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        $("#onlineSearch").click();
      }
    };
  }
  async function runOnlineSearch(page = 1) {
    const input = $("#onlineQuery"),
      mode = $("#onlineMode")?.value;
    if (!input) return;
    const query = input.value.trim(),
      barcode = mode === "barcode",
      brazil = $("#onlineBrazil").checked;
    if (barcode ? !/^\d{8,14}$/.test(query) : normalizeText(query).length < 2) {
      toast(
        barcode
          ? "Digite de 8 a 14 números do código de barras"
          : "Informe a marca com pelo menos 2 letras",
      );
      return;
    }
    const params = new URLSearchParams({
      fields:
        "code,product_name,product_name_pt,brands,nutriments,nutrition_data_per,product_quantity_unit",
      user_agent: "NutriTrack/2.0 (github.com/betascap/nutritrack-pwa)",
    });
    let url = "https://world.openfoodfacts.org/api/v2/";
    if (barcode) url += "product/" + query + ".json?" + params;
    else {
      params.set("brands_tags", normalizeText(query).replace(/ /g, "-"));
      params.set("page", String(page));
      params.set("page_size", "24");
      if (brazil) params.set("countries_tags", "en:brazil");
      url += "search?" + params;
    }
    const panel = $("#onlineResults"),
      button = $("#onlineSearch");
    let data = onlineCache.get(url);
    if (!data) {
      if (navigator.onLine === false) {
        panel.innerHTML =
          '<div class="note">Sem conexão. Seu catálogo local continua disponível. Tente a consulta quando estiver online.</div>';
        return;
      }
      const remaining = 6500 - (Date.now() - onlineLastRequest);
      if (remaining > 0) {
        toast(
          "Aguarde " +
            Math.ceil(remaining / 1000) +
            " segundos antes de outra consulta.",
        );
        return;
      }
      onlineController?.abort();
      const controller = new AbortController();
      onlineController = controller;
      onlineLastRequest = Date.now();
      button.disabled = true;
      panel.setAttribute("aria-busy", "true");
      panel.innerHTML = '<div class="note">Consultando produtos…</div>';
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          credentials: "omit",
          referrerPolicy: "no-referrer",
        });
        if (!response.ok)
          throw Error("Serviço indisponível (" + response.status + ")");
        data = await response.json();
        if (!data || typeof data !== "object") throw Error("Resposta inválida");
        onlineCache.set(url, data);
      } catch (error) {
        if (panel.isConnected)
          panel.innerHTML =
            '<div class="note">Não foi possível consultar agora. Tente novamente mais tarde ou cadastre os dados do rótulo em Criar alimento. Seu diário permanece disponível.</div>';
        return;
      } finally {
        clearTimeout(timeout);
        if (button.isConnected) button.disabled = false;
        panel.removeAttribute("aria-busy");
        if (onlineController === controller) onlineController = null;
      }
    }
    if (!panel.isConnected) return;
    const raw = barcode
        ? data.status === 1
          ? [data.product]
          : []
        : Array.isArray(data.products)
          ? data.products
          : [],
      products = raw.map(offProduct).filter(Boolean);
    panel.innerHTML =
      products
        .map(
          (f, i) =>
            '<button class="result" data-online-pick="' +
            i +
            '"><b>' +
            esc(f.name) +
            "</b><small>" +
            round(f.kcal) +
            " kcal · P " +
            macroText(f, "p") +
            " / C " +
            macroText(f, "c") +
            " / G " +
            macroText(f, "f") +
            " g por 100 " +
            f.unit +
            "</small><small>" +
            esc(f.barcode) +
            " · conferir antes de salvar</small></button>",
        )
        .join("") +
      (!products.length
        ? '<div class="empty">Nenhum produto com dados suficientes nesta consulta. Confira a marca ou o código, ou cadastre o rótulo manualmente.</div>'
        : "") +
      (!barcode && raw.length === 24
        ? '<button class="secondary" id="onlineMore">Próxima página</button>'
        : "");
    document.querySelectorAll("[data-online-pick]").forEach(
      (b) =>
        (b.onclick = () => {
          const food = products[Number(b.dataset.onlinePick)],
            saved = state.foods.find((f) => f.id === food.id);
          if (saved) {
            toast("Este produto já está no seu catálogo");
            foodModal(state.selectedMeal);
            $("#picked").innerHTML = pickedForm(saved);
            $("#results").innerHTML = "";
            bindPicked();
          } else newFoodModal(food);
        }),
    );
    $("#onlineMore")?.addEventListener("click", () =>
      runOnlineSearch(page + 1),
    );
  }

  async function checkStoragePersistence() {
    try {
      if (!navigator.storage?.persisted) return null;
      return await navigator.storage.persisted();
    } catch {
      return false;
    }
  }
  async function requestStoragePersistence() {
    try {
      if (!navigator.storage?.persist) return null;
      return !!(await navigator.storage.persist());
    } catch {
      return false;
    }
  }
  async function start() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          if (reg.waiting && navigator.serviceWorker.controller)
            updateToast(reg);
          reg.addEventListener("updatefound", () => {
            let worker = reg.installing;
            worker?.addEventListener("statechange", () => {
              if (
                worker.state === "installed" &&
                navigator.serviceWorker.controller
              )
                updateToast(reg);
            });
          });
          navigator.serviceWorker.addEventListener("controllerchange", () =>
            location.reload(),
          );
        })
        .catch(() => {});
    }
    db = await openDB();
    await initData();
    await refresh();
    checkStoragePersistence().then((value) => {
      state.storagePersistent = value;
      if (state.page === "settings") render();
    });
  }
  let lastLocalDay = today();
  function checkDateRollover() {
    let now = today();
    if (now !== lastLocalDay) {
      let wasToday = state.date === lastLocalDay;
      lastLocalDay = now;
      if (wasToday) {
        state.date = now;
        render();
      }
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkDateRollover();
  });
  setInterval(checkDateRollover, 60000);
  start().catch((e) => {
    console.error("NutriTrack startup failed", e);
    $("#app").innerHTML =
      '<div class="card">Não foi possível iniciar o NutriTrack. Tente recarregar a página. Seus registros locais não foram apagados.</div>';
  });
})();
