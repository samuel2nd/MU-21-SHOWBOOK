// Supabase Configuration
// Fill in your Supabase project URL and anon key to enable real-time multi-user sync.
// Without these, the app falls back to localStorage (single-browser only).
const SUPABASE_CONFIG = {
  url: 'https://qaldpltyudahtocduwse.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbGRwbHR5dWRhaHRvY2R1d3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MjMxNDUsImV4cCI6MjA4NzI5OTE0NX0.QjHmMYnIBMkqv4RTWiH47tIETNYaDIwjW59XdrJNX3I',
};

// Kaleido Bridge Configuration
// The bridge server URL for multiviewer layout control
const KALEIDO_CONFIG = {
  bridgeUrl: 'http://localhost:3001',  // Default bridge URL
  defaultPort: 8902,                    // Default TSL 5.0 port for Kaleido cards
};
