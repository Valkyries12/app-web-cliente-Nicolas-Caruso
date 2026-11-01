/* KIHAP - cliente REST de Supabase con fetch | ES6+ */

const hasSupabaseConfig = Boolean(
  ENV && ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY
);

if (!hasSupabaseConfig) {
  console.warn(
    'KIHAP: Supabase no está configurado. Se usará el catálogo local.'
  );
}

/**
 * Espera la cantidad de milisegundos indicada.
 * @param {number} milliseconds - Milisegundos a esperar
 * @returns {Promise<void>}
 */
const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * Realiza una petición a la API REST de Supabase usando fetch.
 * Garantiza una duración mínima para que el cargador sea visible.
 * @param {string} table - Nombre de la tabla
 * @param {Record<string, string>} [params] - Parámetros de PostgREST
 * @returns {Promise<unknown>}
 */
const supabaseFetch = async (table, params = {}) => {
  const startedAt = performance.now();
  const url = new URL(`${ENV.SUPABASE_URL}/rest/v1/${table}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url, {
      headers: {
        apikey: ENV.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } finally {
    const elapsed = performance.now() - startedAt;

    if (elapsed < CONFIG.LOADER_MIN_MS) {
      await sleep(CONFIG.LOADER_MIN_MS - elapsed);
    }
  }
};
