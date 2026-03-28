// THE FORGE — Supabase Configuration
// Requires: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const SUPABASE_URL = 'https://uyctvsbhqzhxxstwojzm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3R2c2JocXpoeHhzdHdvanptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Nzk5MTgsImV4cCI6MjA5MDI1NTkxOH0._THsO2apGy23H2udF3QubACREQsNtpY_Fk8nppfd1Q4';
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
