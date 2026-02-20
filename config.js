// Supabase Configuration
// Fill in your Supabase project URL and anon key to enable real-time multi-user sync.
// Without these, the app falls back to localStorage (single-browser only).
const SUPABASE_CONFIG = {
  url: '',      // e.g. 'https://xyzcompany.supabase.co'
  anonKey: '',  // e.g. 'eyJhbGciOiJIUzI1NiIs...'
};

// Kaleido Bridge Configuration
// The bridge server URL for multiviewer layout control
const KALEIDO_CONFIG = {
  bridgeUrl: 'http://localhost:3001',  // Default bridge URL
  defaultPort: 8902,                    // Default TSL 5.0 port for Kaleido cards
};
