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
 * Devuelve los datos y el total informado por Content-Range (si existe).
 * @param {string} table - Nombre de la tabla
 * @param {Record<string, string|number|Array<string|number>>} [params] - Parámetros de PostgREST
 * @param {{headers?: Record<string, string>, signal?: AbortSignal, minDurationMs?: number}} [options]
 * @returns {Promise<{data: unknown, total: number|null}>}
 */
const supabaseFetch = async (table, params = {}, options = {}) => {
  const startedAt = performance.now();
  const url = new URL(`${ENV.SUPABASE_URL}/rest/v1/${table}`);

  Object.entries(params).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];

    values.forEach((item) => {
      if (item !== undefined && item !== null) {
        url.searchParams.append(key, String(item));
      }
    });
  });

  try {
    const response = await fetch(url, {
      headers: {
        apikey: ENV.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      signal: options.signal,
    });

    const contentRange = response.headers.get('content-range') || '';
    const totalRaw = contentRange.split('/')[1];
    const total = totalRaw && totalRaw !== '*' ? Number(totalRaw) : null;

    // PostgREST responde 416 cuando el offset supera el total de filas.
    // No es un error real: la página pedida está vacía y el total viene en Content-Range.
    if (response.status === 416) {
      return { data: [], total };
    }

    if (!response.ok) {
      throw new Error(`Supabase ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return { data, total };
  } finally {
    if (options.minDurationMs) {
      const elapsed = performance.now() - startedAt;

      if (elapsed < options.minDurationMs) {
        await sleep(options.minDurationMs - elapsed);
      }
    }
  }
};
