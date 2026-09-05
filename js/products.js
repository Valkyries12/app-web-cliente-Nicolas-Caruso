/* KIHAP - Product catalog data - Vanilla JS (global) */

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
 */

/** @type {Product[]} */
const PRODUCT_CATALOG = [
  {
    id: 1,
    name: 'Dobok Kukkiwon Trainer',
    category: 'doboks',
    price: 45000,
    sizes: ['130', '140', '150', '160', '170', '180'],
    colors: null,
    featured: true,
    badge: 'Más vendido',
    desc: 'Dobok de entrenamiento diario en algodón grueso con cuello en V reforzado. Corte cómodo pensado para largas sesiones de práctica, resiste lavados frecuentes sin perder forma.',
  },
  {
    id: 2,
    name: 'Dobok Competición WT',
    category: 'doboks',
    price: 68000,
    sizes: ['150', '160', '170', '180', '190'],
    colors: null,
    featured: true,
    badge: 'Nuevo',
    desc: 'Tela liviana de alto rendimiento con corte ajustado, homologada para torneos World Taekwondo. Costuras reforzadas en zonas de mayor tensión.',
  },
  {
    id: 3,
    name: 'Set Peto + Casco de Sparring',
    category: 'protecciones',
    price: 89000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#C41E3A', '#14487A'],
    featured: true,
    badge: 'Más vendido',
    desc: 'Peto acolchado compatible con sistemas electrónicos y casco de espuma de alta densidad. Par completo listo para entrenar sparring de contacto controlado.',
  },
  {
    id: 4,
    name: 'Guantines de Sparring',
    category: 'protecciones',
    price: 15000,
    sizes: ['S', 'M', 'L'],
    colors: ['#C41E3A', '#14487A'],
    featured: false,
    desc: 'Espuma de alta densidad con cierre de velcro ajustable para mayor sujeción de muñeca durante el combate.',
  },
  {
    id: 5,
    name: 'Espinilleras con Empeine',
    category: 'protecciones',
    price: 18000,
    sizes: ['S', 'M', 'L'],
    colors: ['#C41E3A', '#14487A'],
    featured: false,
    desc: 'Protección de espinilla y empeine en una sola pieza articulada, pensada para no restar movilidad en la patada.',
  },
  {
    id: 6,
    name: 'Cinturón Oficial WT',
    category: 'cinturones',
    price: 6000,
    sizes: ['220 cm', '240 cm', '260 cm', '280 cm', '300 cm'],
    colors: ['#FFFFFF', '#E8B93A', '#3F8F52', '#2C5F8A', '#B23A3A', '#16171A'],
    featured: true,
    badge: 'Todos los grados',
    desc: 'Algodón trenzado grueso disponible en todos los colores de grado, del blanco al negro. Terminación reforzada en las puntas.',
  },
  {
    id: 7,
    name: 'Paos de Patada Curvos',
    category: 'accesorios',
    price: 22000,
    sizes: null,
    colors: null,
    featured: false,
    desc: 'Par de paos curvos con doble asa y superficie antideslizante, ideales para trabajo de potencia y precisión de patada.',
  },
  {
    id: 8,
    name: 'Saco de Boxeo 120 cm',
    category: 'accesorios',
    price: 52000,
    sizes: null,
    colors: null,
    featured: false,
    desc: 'Saco relleno de 120 cm para entrenamiento de potencia de golpe y patada. Incluye cadena de sujeción reforzada.',
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

// ─────────────────────────────────────────────
// Legacy aliases (vanilla global compatibility)
// Keep old names available for inline page scripts
// that still reference products / catLabel / etc.
// ─────────────────────────────────------------
const products = PRODUCT_CATALOG;
const catLabel = CATEGORY_LABELS;
const catClass = CATEGORY_STYLE_MAP;
const catIcon = CATEGORY_ICON_MAP;
