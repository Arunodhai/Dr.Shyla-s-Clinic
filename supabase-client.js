
// The CDN script exposes a global variable 'supabase' which contains the library methods.
// We need to initialize the client using supabase.createClient.

if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        console.error('Supabase not configured. Please check config.js');
    } else {
        // Initialize the client and assign it to window.supabase
        // Note: We are overwriting the library object with the client instance. 
        // This is fine for this simple usage.
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized.');
    }
} else {
    console.error('Supabase JS SDK not loaded or createClient not found.');
}
