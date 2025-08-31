import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client server-side
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Get available inventory (wines with quantity >= 1)
export async function getAvailableInventory() {
  try {
    const supabase = getSupabaseClient();
    
    const { data: inventory, error } = await supabase
      .from('Inventory')
      .select('*')
      .gte('quantity', 1);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch inventory'
      };
    }

    // Convert Supabase inventory data to Wine format
    const wines = (inventory || []).map((item: any) => ({
      id: item.id,
      name: item.name || 'Unnamed Wine',
      winery: item.winery || 'Unknown Winery',
      vintage: item.vintage || new Date().getFullYear(),
      region: '', // Not displayed on shop page
      type: item.type || 'Red Wine',
      price: parseFloat(item.price) || 0,
      inStock: parseInt(item.quantity) || 0,
      rating: 0, // Not displayed on shop page
      description: item.description || item.flavor_notes || 'A wonderful wine experience',
      flavorNotes: (
        // Use auto-generated tags if available, otherwise parse flavor_notes
        item.tags && Array.isArray(item.tags) && item.tags.length > 0
          ? item.tags.map((tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1))
          : item.flavor_notes ? item.flavor_notes.split(',').map((note: string) => note.trim()) : ['Complex', 'Balanced']
      ),
      image: item.image_url || item.image || "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop"
    }));

    return {
      success: true,
      wines
    };
  } catch (err) {
    return {
      success: false,
      error: 'An unexpected error occurred while fetching inventory'
    };
  }
}

// Update inventory quantities (for order processing)
export async function updateInventoryQuantities(updates: Array<{ id: string, newQuantity: number }>) {
  try {
    const supabase = getSupabaseClient();
    
    const results = [];
    for (const update of updates) {
      const { error } = await supabase
        .from('Inventory')
        .update({ quantity: update.newQuantity })
        .eq('id', update.id);

      if (error) {
        results.push({
          id: update.id,
          success: false,
          error: error.message
        });
      } else {
        results.push({
          id: update.id,
          success: true
        });
      }
    }

    const allSuccessful = results.every(r => r.success);
    return {
      success: allSuccessful,
      results,
      error: allSuccessful ? undefined : 'Some inventory updates failed'
    };
  } catch (err) {
    return {
      success: false,
      error: 'An unexpected error occurred while updating inventory'
    };
  }
}
