/* KIHAP - genera js/env.js a partir de variables de entorno.
 * Uso local: node --env-file=.env scripts/generate-env.js
 * CI: definir SUPABASE_URL y SUPABASE_ANON_KEY como variables de entorno.
 * Nunca escribir SUPABASE_SERVICE_ROLE_KEY en el archivo generado.
 */

const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('KIHAP: faltan SUPABASE_URL y/o SUPABASE_ANON_KEY.');
  process.exit(1);
}

const outputPath = path.join(__dirname, '..', 'js', 'env.js');
const content = `/* Archivo generado automáticamente. No editar ni commitear. */
window.KIHAP_ENV = Object.freeze({
  SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)},
});
`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log('KIHAP: js/env.js generado.');
