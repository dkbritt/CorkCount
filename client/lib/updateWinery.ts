// Utility to update existing winery names from "CorkCount Winery" to "KB Winery"
import { supabase } from "@/lib/supabase";

export async function updateExistingWineryNames(): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    // Update inventory table
    const { data, error } = await supabase
      .from('Inventory')
      .update({ winery: 'KB Winery' })
      .eq('winery', 'CorkCount Winery')
      .select();

    if (error) {
      console.error('Error updating winery names:', error);
      return { success: false, updated: 0, error: error.message };
    }

    const updatedCount = data?.length || 0;
    
    console.log(`Updated ${updatedCount} inventory records from "CorkCount Winery" to "KB Winery"`);
    
    return { success: true, updated: updatedCount };
    
  } catch (err) {
    console.error('Error in updateExistingWineryNames:', err);
    return { 
      success: false, 
      updated: 0, 
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

// Run this once to update all existing records
export async function runWineryUpdate(): Promise<void> {
  const result = await updateExistingWineryNames();
  
  if (result.success) {
    console.log(`✅ Successfully updated ${result.updated} winery names to "KB Winery"`);
  } else {
    console.error(`❌ Failed to update winery names: ${result.error}`);
  }
}
