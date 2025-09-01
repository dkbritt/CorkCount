import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client server-side
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Get all inventory for admin dashboard
export async function getAllInventory() {
  try {
    const supabase = getSupabaseClient();

    const { data: inventory, error } = await supabase
      .from("Inventory")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch inventory",
      };
    }

    return {
      success: true,
      inventory: inventory || [],
    };
  } catch (err) {
    console.error('Error in getAllInventory:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred while fetching inventory",
    };
  }
}

// Get available inventory (wines with quantity >= 1) for shop
export async function getAvailableInventory() {
  try {
    const supabase = getSupabaseClient();

    const { data: inventory, error } = await supabase
      .from("Inventory")
      .select("*")
      .gte("quantity", 1);

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch inventory",
      };
    }

    // Convert Supabase inventory data to Wine format
    const wines = (inventory || []).map((item: any) => ({
      id: item.id,
      name: item.name || "Unnamed Wine",
      winery: item.winery || "Unknown Winery",
      vintage: item.vintage || new Date().getFullYear(),
      region: "", // Not displayed on shop page
      type: item.type || "Red Wine",
      price: parseFloat(item.price) || 0,
      inStock: parseInt(item.quantity) || 0,
      rating: 0, // Not displayed on shop page
      description:
        item.description || item.flavor_notes || "A wonderful wine experience",
      flavorNotes:
        // Use auto-generated tags if available, otherwise parse flavor_notes
        item.tags && Array.isArray(item.tags) && item.tags.length > 0
          ? item.tags.map(
              (tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1),
            )
          : item.flavor_notes
            ? item.flavor_notes.split(",").map((note: string) => note.trim())
            : ["Complex", "Balanced"],
      image:
        item.image_url ||
        item.image ||
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop",
    }));

    return {
      success: true,
      wines,
    };
  } catch (err) {
    console.error('Error in getAvailableInventory:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred while fetching inventory",
    };
  }
}

// Update inventory quantities (for order processing)
export async function updateInventoryQuantities(
  updates: Array<{ id: string; newQuantity: number }>,
) {
  try {
    const supabase = getSupabaseClient();

    const results = [];
    for (const update of updates) {
      const { error } = await supabase
        .from("Inventory")
        .update({ quantity: update.newQuantity })
        .eq("id", update.id);

      if (error) {
        results.push({
          id: update.id,
          success: false,
          error: error.message,
        });
      } else {
        results.push({
          id: update.id,
          success: true,
        });
      }
    }

    const allSuccessful = results.every((r) => r.success);
    return {
      success: allSuccessful,
      results,
      error: allSuccessful ? undefined : "Some inventory updates failed",
    };
  } catch (err) {
    return {
      success: false,
      error: "An unexpected error occurred while updating inventory",
    };
  }
}

// Add single inventory item
export async function addInventoryItem(itemData: any) {
  try {
    const supabase = getSupabaseClient();

    const { data: newItem, error } = await supabase
      .from("Inventory")
      .insert([
        {
          ...itemData,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to add inventory item",
      };
    }

    return {
      success: true,
      item: newItem,
    };
  } catch (err) {
    return {
      success: false,
      error: "An unexpected error occurred while adding inventory item",
    };
  }
}

// Update single inventory item
export async function updateInventoryItem(itemId: string, itemData: any) {
  try {
    const supabase = getSupabaseClient();

    const { data: updatedItem, error } = await supabase
      .from("Inventory")
      .update({
        ...itemData,
        last_updated: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update inventory item",
      };
    }

    return {
      success: true,
      item: updatedItem,
    };
  } catch (err) {
    return {
      success: false,
      error: "An unexpected error occurred while updating inventory item",
    };
  }
}

// Delete single inventory item
export async function deleteInventoryItem(itemId: string) {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("Inventory")
      .delete()
      .eq("id", itemId);

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to delete inventory item",
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: "An unexpected error occurred while deleting inventory item",
    };
  }
}
