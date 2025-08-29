/**
 * Utility for batch processing auto-tags on existing wines
 */

import { supabase } from './supabase';
import { autoTagWine, sanitizeTags } from './autoTagger';
import { formatError } from './errors';

export interface BatchAutoTagResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

/**
 * Batch process auto-tagging for existing wines in inventory
 */
export async function batchAutoTagInventory(): Promise<BatchAutoTagResult> {
  const result: BatchAutoTagResult = {
    success: true,
    processed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Fetch all wines from inventory
    const { data: wines, error: fetchError } = await supabase
      .from('Inventory')
      .select('id, name, winery, type, vintage, flavor_notes, description, tags');

    if (fetchError) {
      result.success = false;
      result.errors.push(`Failed to fetch wines: ${formatError(fetchError)}`);
      return result;
    }

    if (!wines || wines.length === 0) {
      result.errors.push('No wines found in inventory');
      return result;
    }

    console.log(`Processing auto-tags for ${wines.length} wines...`);

    // Process each wine
    for (const wine of wines) {
      try {
        // Generate tags for this wine
        const autoTags = autoTagWine({
          flavorNotes: wine.flavor_notes || '',
          description: wine.description || '',
          name: wine.name || '',
          type: wine.type || ''
        });

        const sanitizedTags = sanitizeTags(autoTags);

        // Only update if we have new tags or different tags
        const existingTags = wine.tags || [];
        const tagsChanged = JSON.stringify(existingTags.sort()) !== JSON.stringify(sanitizedTags.sort());

        if (tagsChanged) {
          // Update the wine with new tags
          const { error: updateError } = await supabase
            .from('Inventory')
            .update({ tags: sanitizedTags })
            .eq('id', wine.id);

          if (updateError) {
            result.failed++;
            result.errors.push(`Failed to update wine ${wine.name}: ${formatError(updateError)}`);
            console.error(`Failed to update wine ${wine.id}:`, updateError);
          } else {
            result.processed++;
            console.log(`Updated tags for ${wine.name}:`, sanitizedTags);
          }
        } else {
          // No changes needed
          result.processed++;
        }

      } catch (error) {
        result.failed++;
        result.errors.push(`Error processing wine ${wine.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`Error processing wine ${wine.id}:`, error);
      }
    }

    if (result.failed > 0) {
      result.success = false;
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Batch auto-tagging failed:', error);
  }

  return result;
}

/**
 * Get preview of what tags would be generated for existing wines
 */
export async function previewAutoTags(): Promise<{
  success: boolean;
  previews: Array<{
    id: string;
    name: string;
    currentTags: string[];
    suggestedTags: string[];
    changed: boolean;
  }>;
  error?: string;
}> {
  try {
    // Fetch all wines from inventory
    const { data: wines, error: fetchError } = await supabase
      .from('Inventory')
      .select('id, name, winery, type, vintage, flavor_notes, description, tags');

    if (fetchError) {
      return {
        success: false,
        previews: [],
        error: `Failed to fetch wines: ${formatError(fetchError)}`
      };
    }

    if (!wines || wines.length === 0) {
      return {
        success: true,
        previews: [],
        error: 'No wines found in inventory'
      };
    }

    const previews = wines.map(wine => {
      const suggestedTags = sanitizeTags(autoTagWine({
        flavorNotes: wine.flavor_notes || '',
        description: wine.description || '',
        name: wine.name || '',
        type: wine.type || ''
      }));

      const currentTags = wine.tags || [];
      const changed = JSON.stringify(currentTags.sort()) !== JSON.stringify(suggestedTags.sort());

      return {
        id: wine.id,
        name: wine.name,
        currentTags,
        suggestedTags,
        changed
      };
    });

    return {
      success: true,
      previews
    };

  } catch (error) {
    return {
      success: false,
      previews: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
