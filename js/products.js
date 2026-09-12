/* KIHAP - Product catalog data - Vanilla JS (global)
 * Imágenes locales en assets/img (foto de producto, sin personas):
 * Fotos de producto nuevo de casas de deporte argentinas (proyecto escolar):
 * Doboks F-sion (GUPS/ELITE), Dobok ITF Lobizón, Dobok Invictus y Rip Stop GUP,
 * Cinturón Adidas Club, Botines y Guantes Adidas ITF 300 (Olimpia Deportes),
 * Pechera, Empeineras, Guantes, Cabezal, Escudos y Paletas (Hisport),
 * Guantes Proyec Ultra, Bolsa Proyec, Bolso Granmarc (Olimpia Deportes).
 * Precios ARS reales de cada tienda a sep-2026.
 */

// ─────────────────────────────────────────────
// Product Catalog - Ecommerce master data
// ─────────────────────────────────────────────

/**
 * @typedef {Object} Product
 * @property {number} id - Identificador único del producto
 * @property {string} name - Nombre visible del producto
 * @property {string} category - Clave de categoría del producto
 * @property {number} price - Precio en ARS (entero, sin centavos)
 * @property {string[]|null} sizes - Talles disponibles o null si no aplica
 * @property {string[]|null} colors - Colores hexadecimales disponibles o null si no aplica
 * @property {boolean} featured - Si el producto se muestra en la sección destacados
 * @property {string|undefined} badge - Texto de etiqueta promocional
 * @property {string} desc - Descripción larga del producto
 * @property {string|null} [image] - Ruta local de imagen en assets/img o null si usa icono
 */

/** @type {Product[]} */
const PRODUCT_CATALOG = [
  {
    id: 1,
    name: 'Dobok Kukkiwon Trainer',
    category: 'doboks',
    price: 58200,
    sizes: ['130', '140', '150', '160', '170', '180'],
    colors: null,
    featured: true,
    badge: 'Más vendido',
    desc: 'Dobok de entrenamiento diario en algodón grueso con cuello en V reforzado. Corte cómodo pensado para largas sesiones de práctica, resiste lavados frecuentes sin perder forma.',
    image: 'assets/img/doboks/kukkiwon-trainer.webp',
  },
  {
    id: 2,
    name: 'Dobok Competición WT',
    category: 'doboks',
    price: 98000,
    sizes: ['150', '160', '170', '180', '190'],
    colors: null,
    featured: true,
    badge: 'Nuevo',
    desc: 'Tela liviana de alto rendimiento con corte ajustado, homologada para torneos World Taekwondo. Costuras reforzadas en zonas de mayor tensión.',
    image: 'assets/img/doboks/wt-competicion.webp',
  },
  {
    id: 3,
    name: 'Peto Reversible de Sparring',
    category: 'protecciones',
    price: 41800,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#C41E3A', '#14487A'],
    featured: true,
    badge: 'Más vendido',
    desc: 'Peto reversible azul/rojo con tiras de ajuste y espuma de alta densidad. Protección reglamentaria de torso para sparring y competencia.',
    image: 'assets/img/protecciones/set-peto-casco.webp',
  },
  {
    id: 4,
    name: 'Guantín Cerrado WT Sparring',
    category: 'protecciones',
    price: 16900,
    sizes: ['S', 'M', 'L'],
    colors: ['#C41E3A', '#14487A'],
    featured: false,
    desc: 'Guantín cerrado de espuma de alta densidad con velcro ancho para sparring WT. Puño completo, ideal para combate con contacto controlado.',
    image: 'assets/img/protecciones/guantin-cerrado.webp',
  },
  {
    id: 5,
    name: 'Espinilleras con Empeine',
    category: 'protecciones',
    price: 19200,
    sizes: ['S', 'M', 'L'],
    colors: ['#C41E3A', '#14487A'],
    featured: false,
    desc: 'Protección de espinilla y empeine en una sola pieza articulada, pensada para no restar movilidad en la patada.',
    image: 'assets/img/protecciones/espinilleras.webp',
  },
  {
    id: 6,
    name: 'Cinturón Oficial WT',
    category: 'cinturones',
    price: 14784,
    sizes: ['220 cm', '240 cm', '260 cm', '280 cm', '300 cm'],
    colors: ['#FFFFFF', '#E8B93A', '#3F8F52', '#2C5F8A', '#B23A3A', '#16171A'],
    featured: true,
    badge: 'Todos los grados',
    desc: 'Algodón trenzado grueso disponible en todos los colores de grado, del blanco al negro. Terminación reforzada en las puntas.',
    image: 'assets/img/cinturones/cinturon-oficial.webp',
  },
  {
    id: 7,
    name: 'Paos de Patada Curvos',
    category: 'accesorios',
    price: 21600,
    sizes: null,
    colors: null,
    featured: false,
    desc: 'Par de paos curvos con doble asa y superficie antideslizante, ideales para trabajo de potencia y precisión de patada.',
    image: 'assets/img/entrenamiento/paos-curvos.webp',
  },
  {
    id: 8,
    name: 'Saco de Boxeo 120 cm',
    category: 'accesorios',
    price: 61264,
    sizes: null,
    colors: null,
    featured: false,
    desc: 'Saco relleno de 120 cm para entrenamiento de potencia de golpe y patada. Incluye cadena de sujeción reforzada.',
    image: 'assets/img/entrenamiento/saco-120cm.webp',
  },
  {
    id: 9,
    name: 'Dobok ITF Tradicional para Gup',
    category: 'doboks',
    price: 59800,
    sizes: ['150', '160', '170', '180', '190'],
    colors: null,
    featured: false,
    badge: 'ITF',
    desc: 'Dobok estilo ITF de algodón con chaqueta abierta y vivos negros en puños. Corte tradicional para práctica y examen ITF.',
    image: 'assets/img/doboks/itf-tradicional.webp',
  },
  {
    id: 10,
    name: 'Dobok ITF Elite Competición',
    category: 'doboks',
    price: 235200,
    sizes: ['150', '160', '170', '180', '190'],
    colors: null,
    featured: true,
    badge: 'Nuevo',
    desc: 'Dobok ITF de competición en tela liviana con bordado ITF en espalda. Costuras reforzadas y calce atlético para torneo.',
    image: 'assets/img/doboks/itf-elite.webp',
  },
  {
    id: 11,
    name: 'Cabezal ITF Abierto',
    category: 'protecciones',
    price: 35500,
    sizes: ['S', 'M', 'L'],
    colors: ['#C41E3A', '#14487A'],
    featured: false,
    badge: 'ITF',
    desc: 'Cabezal abierto estilo ITF de espuma inyectada, deja mentón despejado. Ajuste con velcro posterior. Se vende por unidad (a diferencia del set cerrado id 3).',
    image: 'assets/img/protecciones/cabezal-itf.webp',
  },
  {
    id: 12,
    name: 'Botín ITF Vinílico',
    category: 'protecciones',
    price: 170128,
    sizes: ['S', 'M', 'L'],
    colors: ['#C41E3A', '#14487A'],
    featured: false,
    desc: 'Botín cerrado de vinílico para competencia ITF con suela antideslizante. Protege empeine y talón (a diferencia de la espinillera textil articulada).',
    image: 'assets/img/protecciones/botin-itf.webp',
  },
  {
    id: 13,
    name: 'Guantín ITF Palma Abierta',
    category: 'protecciones',
    price: 156688,
    sizes: ['S', 'M', 'L'],
    colors: ['#C41E3A', '#14487A'],
    featured: false,
    desc: 'Guantín ITF de palma abierta para agarre en combate semi-contact. Nudillos acolchados y pulgar elástico (a diferencia del guantín cerrado WT).',
    image: 'assets/img/protecciones/guantin-itf.webp',
  },
  {
    id: 14,
    name: 'Guante de Boxeo Training 12 oz',
    category: 'accesorios',
    price: 47040,
    sizes: ['10 oz', '12 oz', '14 oz'],
    colors: null,
    featured: false,
    badge: 'Más vendido',
    desc: 'Guante de boxeo de entrenamiento general en cuero sintético con velcro ancho. Para bolsa, paos y escudo. No es guantín de sparring.',
    image: 'assets/img/entrenamiento/guante-box.webp',
  },
  {
    id: 15,
    name: 'Manopla Foco Curva (par chico)',
    category: 'accesorios',
    price: 14000,
    sizes: null,
    colors: null,
    featured: false,
    desc: 'Par de manoplas foco chicas y curvas para precisión de puño y patada corta. Palma con guante integrado (a diferencia del pao grande de antebrazo).',
    image: 'assets/img/entrenamiento/manopla-foco.webp',
  },
  {
    id: 16,
    name: 'Escudo Curvo de Potencia',
    category: 'accesorios',
    price: 78000,
    sizes: null,
    colors: null,
    featured: true,
    badge: 'Nuevo',
    desc: 'Escudo curvo grande de alta absorción con doble asa reforzada. Para trabajo de potencia de patada lateral y circular.',
    image: 'assets/img/entrenamiento/escudo-potencia.webp',
  },
  {
    id: 17,
    name: 'Palmeta Doble de Velocidad',
    category: 'accesorios',
    price: 30000,
    sizes: null,
    colors: null,
    featured: false,
    desc: 'Palmeta doble liviana para velocidad y reacción. Sonido de impacto nítido, ideal para combinaciones rápidas.',
    image: 'assets/img/entrenamiento/palmeta-doble.webp',
  },
  {
    id: 18,
    name: 'Bolso Deportivo KIHAP 60L',
    category: 'accesorios',
    price: 135520,
    sizes: null,
    colors: null,
    featured: false,
    desc: 'Bolso deportivo de 60 litros con compartimento ventilado. Entra dobok, cabezal, botines y paos para llevar el equipo completo.',
    image: 'assets/img/entrenamiento/bolso-kihap.webp',
  },
];

// ─────────────────────────────────────────────
// Category display maps (UPPER_SNAKE_CASE global)
// ─────────────────────────────────------------

/** Etiqueta visible de categoría por clave de categoría */
const CATEGORY_LABELS = {
  doboks: 'Doboks',
  protecciones: 'Protecciones',
  cinturones: 'Cinturones',
  accesorios: 'Accesorios',
};

/** Clase de estilo de fondo por clave de categoría */
const CATEGORY_STYLE_MAP = {
  doboks: 'tarjeta-producto__media--oscuro',
  protecciones: 'tarjeta-producto__media--rojo',
  cinturones: 'tarjeta-producto__media--cinturon',
  accesorios: 'tarjeta-producto__media--azul',
};

/** ID de ícono SVG por clave de categoría */
const CATEGORY_ICON_MAP = {
  doboks: 'i-cat-dobok',
  protecciones: 'i-cat-shield',
  cinturones: 'i-cat-belt',
  accesorios: 'i-cat-pad',
};

// ─────────────────────────────────────────────
// Pricing helpers
// ─────────────────────────────────------------

/**
 * Formatea un monto al formato de pesos argentinos.
 * @param {number} priceAmount - Valor del precio en ARS
 * @returns {string} Precio formateado (ej. "$45.000")
 */
function formatPrice(priceAmount) {
  return '$' + priceAmount.toLocaleString('es-AR');
}


