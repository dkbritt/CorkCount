// Test the Supabase configuration endpoint
async function testSupabaseConfig() {
  try {
    const response = await fetch('http://localhost:8080/api/config/supabase');
    const config = await response.json();
    console.log('Supabase Configuration:', config);
    console.log('Is Configured:', config.isConfigured);
    console.log('URL:', config.url ? 'Set' : 'Not set');
    console.log('Key:', config.anonKey ? 'Set' : 'Not set');
  } catch (error) {
    console.error('Failed to check Supabase config:', error);
  }
}

testSupabaseConfig();
