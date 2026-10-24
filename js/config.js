/* KIHAP - config.js vanilla global - constantes compartidas (ES6+) */

const ENV = window.KIHAP_ENV || null;

if (!ENV || !ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.warn(
    'KIHAP: Supabase no está configurado. Generá js/env.js con scripts/generate-env.js. Se usará el catálogo local.'
  );
}

const CONFIG = {
  SHIPPING_FLAT_RATE: 4500,
  TOAST_MS: 2000,
  MAX_QTY: 10,
};
