import { createClient } from '@supabase/supabase-js';

// Accessing credentials defined in the data structure document
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nvpwgzhsxrydgqgmezea.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cHdnemhzeHJ5ZGdxZ21lemVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTY4NDYsImV4cCI6MjA4Nzg3Mjg0Nn0.yA1H0mg0gWa76eG8ViKxM9iFSy_rnnG0xPPha8bzilo';

export const supabase = createClient(supabaseUrl, supabaseKey);
