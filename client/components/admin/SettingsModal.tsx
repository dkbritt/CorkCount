import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Settings, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateExistingWineryNames } from "@/lib/updateWinery";

export interface InventorySettings {
  lowStockThreshold: number;
  outOfStockThreshold: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: InventorySettings) => void;
  currentSettings: InventorySettings;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentSettings 
}: SettingsModalProps) {
  const { toast } = useToast();
  const [lowStockThreshold, setLowStockThreshold] = useState(currentSettings.lowStockThreshold.toString());
  const [outOfStockThreshold, setOutOfStockThreshold] = useState(currentSettings.outOfStockThreshold.toString());
  const [errors, setErrors] = useState<{ lowStock?: string; outOfStock?: string }>({});
  const [isUpdatingWinery, setIsUpdatingWinery] = useState(false);

  // Update form when currentSettings change
  useEffect(() => {
    setLowStockThreshold(currentSettings.lowStockThreshold.toString());
    setOutOfStockThreshold(currentSettings.outOfStockThreshold.toString());
    setErrors({});
  }, [currentSettings]);

  const validateForm = (): boolean => {
    const newErrors: { lowStock?: string; outOfStock?: string } = {};
    
    const lowStock = parseInt(lowStockThreshold);
    const outOfStock = parseInt(outOfStockThreshold);
    
    if (isNaN(lowStock) || lowStock < 0) {
      newErrors.lowStock = "Must be a number ≥ 0";
    }
    
    if (isNaN(outOfStock) || outOfStock < 0) {
      newErrors.outOfStock = "Must be a number ≥ 0";
    }
    
    if (!isNaN(lowStock) && !isNaN(outOfStock) && lowStock <= outOfStock) {
      newErrors.lowStock = "Low stock threshold must be greater than out of stock threshold";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    const settings: InventorySettings = {
      lowStockThreshold: parseInt(lowStockThreshold),
      outOfStockThreshold: parseInt(outOfStockThreshold)
    };
    
    onSave(settings);
    onClose();
  };

  const handleResetToDefault = () => {
    setLowStockThreshold("5");
    setOutOfStockThreshold("0");
    setErrors({});
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" 
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="font-playfair text-xl font-semibold text-gray-900">
              Inventory Alert Settings
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Low Stock Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => {
                setLowStockThreshold(e.target.value);
                if (errors.lowStock) {
                  setErrors(prev => ({ ...prev, lowStock: undefined }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal ${
                errors.lowStock ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="5"
              min="0"
            />
            {errors.lowStock && (
              <p className="mt-1 text-sm text-red-600">{errors.lowStock}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Bottles with quantity at or below this number will be marked as "Low Stock"
            </p>
          </div>

          {/* Out of Stock Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Out of Stock Threshold
            </label>
            <input
              type="number"
              value={outOfStockThreshold}
              onChange={(e) => {
                setOutOfStockThreshold(e.target.value);
                if (errors.outOfStock) {
                  setErrors(prev => ({ ...prev, outOfStock: undefined }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal ${
                errors.outOfStock ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
            />
            {errors.outOfStock && (
              <p className="mt-1 text-sm text-red-600">{errors.outOfStock}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Bottles with quantity at or below this number will be marked as "Out of Stock"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            className="bg-smoke hover:bg-gray-100"
          >
            Reset
          </Button>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
