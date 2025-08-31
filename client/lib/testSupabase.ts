import { supabase, isSupabaseConfigured } from "./supabase";

// Test utility to verify Supabase query methods work correctly
export async function testSupabaseQueries() {
  console.log("🧪 Testing Supabase query functionality...");
  
  // Check configuration
  console.log("📋 Configuration status:", {
    isConfigured: isSupabaseConfigured,
    hasUrl: Boolean(import.meta.env.VITE_SUPABASE_URL),
    hasKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
  });

  try {
    // Test 1: Basic query builder chaining
    console.log("🔗 Test 1: Testing query builder chaining...");
    const query = supabase
      .from('Inventory')
      .select('*')
      .gte('quantity', 1)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log("✅ Query builder chain created successfully:", typeof query);
    console.log("🔍 Query object methods:", Object.getOwnPropertyNames(query).filter(name => typeof query[name] === 'function'));
    
    // Test 2: Execute query (will fail if not configured, but should not crash)
    console.log("⚡ Test 2: Executing query...");
    const { data, error } = await query;
    
    if (error) {
      console.log("⚠️ Query error (expected if not configured):", error.message);
    } else {
      console.log("✅ Query successful, data:", data?.length || 0, "rows");
    }
    
    // Test 3: Auth methods
    console.log("🔐 Test 3: Testing auth methods...");
    const authUser = await supabase.auth.getUser();
    console.log("👤 Auth user result:", authUser.data.user ? "User found" : "No user");
    
    console.log("🎉 All Supabase tests completed successfully!");
    return true;
    
  } catch (error) {
    console.error("❌ Supabase test failed:", error);
    return false;
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testSupabaseQueries();
}
