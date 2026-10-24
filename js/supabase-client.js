/* KIHAP - cliente Supabase (anon/publishable key) | ES6+ */

const supabaseClient =
  ENV && ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY && typeof supabase !== 'undefined'
    ? supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
    : null;

if (!supabaseClient && typeof supabase === 'undefined') {
  console.warn('KIHAP: no se cargó el SDK de Supabase. Se usará el catálogo local.');
}
