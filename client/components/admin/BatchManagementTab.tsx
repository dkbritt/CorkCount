import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  AlertTriangle
} from "lucide-react";

interface BatchItem {
  id: string;
  name: string;
  type: string;
  vintage: number;
  quantity: number;
  agingNotes: string;
  dateAdded: string;
  dateStarted: string;
  estimatedAgingTime: number; // in weeks
  estimatedAgingUnit: "weeks" | "months";
  status: "primary-fermentation" | "secondary-fermentation" | "aging" | "ready-to-bottle" | "bottled";
  estimatedBottling?: string;
}

interface BatchFormData {
  name: string;
  type: string;
  vintage: number;
  quantity: number;
  agingNotes: string;
  dateStarted: string;
  estimatedAgingTime: number;
  estimatedAgingUnit: "weeks" | "months";
}

const mockBatches: BatchItem[] = [
  {
    id: "batch-001",
    name: "Napa Valley Cabernet 2022",
    type: "Red Wine",
    vintage: 2022,
    quantity: 500,
    agingNotes: "French oak barrels, 18 months aging planned. Notes of blackcurrant and vanilla developing well.",
    dateAdded: "2023-09-15",
    dateStarted: "2023-09-10",
    estimatedAgingTime: 18,
    estimatedAgingUnit: "months",
    status: "aging",
    estimatedBottling: "2024-03-15"
  },
  {
    id: "batch-002",
    name: "Sonoma Chardonnay 2023",
    type: "White Wine",
    vintage: 2023,
    quantity: 300,
    agingNotes: "Stainless steel fermentation, minimal oak contact. Crisp acidity maintained.",
    dateAdded: "2023-10-20",
    dateStarted: "2023-10-15",
    estimatedAgingTime: 12,
    estimatedAgingUnit: "weeks",
    status: "ready-to-bottle",
    estimatedBottling: "2024-01-20"
  },
  {
    id: "batch-003",
    name: "Monterey Pinot Noir 2021",
    type: "Red Wine",
    vintage: 2021,
    quantity: 250,
    agingNotes: "Completed 14 months aging. Complex earthy notes with bright cherry finish.",
    dateAdded: "2022-11-10",
    dateStarted: "2022-11-05",
    estimatedAgingTime: 14,
    estimatedAgingUnit: "months",
    status: "bottled"
  },
  {
    id: "batch-004",
    name: "Central Coast Rosé 2023",
    type: "Rosé",
    vintage: 2023,
    quantity: 180,
    agingNotes: "Cold fermentation preserving delicate fruit flavors. Ready for immediate bottling.",
    dateAdded: "2023-08-05",
    dateStarted: "2023-08-01",
    estimatedAgingTime: 8,
    estimatedAgingUnit: "weeks",
    status: "secondary-fermentation",
    estimatedBottling: "2024-02-01"
  },
  {
    id: "batch-005",
    name: "Russian River Pinot Gris 2024",
    type: "White Wine",
    vintage: 2024,
    quantity: 220,
    agingNotes: "Just started fermentation. Monitoring sugar levels and temperature closely.",
    dateAdded: "2024-01-15",
    dateStarted: "2024-01-10",
    estimatedAgingTime: 6,
    estimatedAgingUnit: "weeks",
    status: "primary-fermentation",
    estimatedBottling: "2024-06-15"
  }
];

const wineTypes = ["Red Wine", "White Wine", "Rosé", "Sparkling", "Dessert Wine"];

// Mock inventory data to simulate batch-inventory relationships
const mockInventoryItems = [
  { id: "inv-001", batchId: "batch-001", name: "Napa Valley Cabernet Reserve", quantity: 3 },
  { id: "inv-002", batchId: "batch-002", name: "Sonoma Chardonnay Estate", quantity: 8 },
  { id: "inv-003", batchId: "batch-003", name: "Monterey Pinot Noir", quantity: 15 },
  { id: "inv-004", batchId: "batch-004", name: "Central Coast Rosé", quantity: 2 },
  { id: "inv-005", batchId: "batch-001", name: "Napa Valley Merlot", quantity: 1 }
];

interface BatchManagementTabProps {
  settings?: {
    lowStockThreshold: number;
    outOfStockThreshold: number;
  };
  onSetAddCallback?: (callback: () => void) => void;
}

export function BatchManagementTab({ settings, onSetAddCallback }: BatchManagementTabProps = {}) {
  const { lowStockThreshold = 5, outOfStockThreshold = 0 } = settings || {};
  const [batches, setBatches] = useState<BatchItem[]>(mockBatches);
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [formData, setFormData] = useState<BatchFormData>({
    name: "",
    type: "Red Wine",
    vintage: new Date().getFullYear(),
    quantity: 0,
    agingNotes: "",
    dateStarted: new Date().toISOString().split('T')[0],
    estimatedAgingTime: 12,
    estimatedAgingUnit: "weeks"
  });
  const [formErrors, setFormErrors] = useState<Partial<BatchFormData>>({});

  // Set up floating action button callback
  useEffect(() => {
    if (onSetAddCallback) {
      onSetAddCallback(() => {
        setShowForm(true);
        window.scrollTo(0, 0);
      });
    }
  }, [onSetAddCallback]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "primary-fermentation":
        return (
          <Badge className="bg-purple-100 text-purple-800 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Primary Fermentation
          </Badge>
        );
      case "secondary-fermentation":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Secondary Fermentation
          </Badge>
        );
      case "aging":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 gap-1">
            <Calendar className="h-3 w-3" />
            Aging
          </Badge>
        );
      case "ready-to-bottle":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle className="h-3 w-3" />
            Ready to Bottle
          </Badge>
        );
      case "bottled":
        return (
          <Badge className="bg-blue-100 text-blue-800 gap-1">
            <Package className="h-3 w-3" />
            Bottled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBatchInventoryAlert = (batchId: string) => {
    const batchInventory = mockInventoryItems.filter(item => item.batchId === batchId);

    const lowStockItems = batchInventory.filter(item =>
      item.quantity <= lowStockThreshold && item.quantity > outOfStockThreshold
    );

    const outOfStockItems = batchInventory.filter(item =>
      item.quantity <= outOfStockThreshold
    );

    if (outOfStockItems.length > 0) {
      return {
        type: "out-of-stock",
        message: `${outOfStockItems.length} bottle${outOfStockItems.length === 1 ? '' : 's'} out of stock`,
        items: outOfStockItems
      };
    }

    if (lowStockItems.length > 0) {
      return {
        type: "low-stock",
        message: `${lowStockItems.length} bottle${lowStockItems.length === 1 ? '' : 's'} low stock`,
        items: lowStockItems
      };
    }

    return null;
  };

  const validateForm = (): boolean => {
    const errors: Partial<BatchFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Batch name is required";
    }
    
    if (!formData.type) {
      errors.type = "Wine type is required";
    }
    
    if (formData.vintage < 1900 || formData.vintage > new Date().getFullYear() + 5) {
      errors.vintage = "Please enter a valid vintage year";
    }
    
    if (formData.quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0";
    }
    
    if (!formData.agingNotes.trim()) {
      errors.agingNotes = "Aging notes are required";
    }

    if (!formData.dateStarted) {
      errors.dateStarted = "Date started is required";
    }

    if (!formData.estimatedAgingTime || formData.estimatedAgingTime <= 0) {
      errors.estimatedAgingTime = "Estimated aging time must be greater than 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingBatch) {
      // Update existing batch
      setBatches(prev => prev.map(batch => 
        batch.id === editingBatch.id 
          ? { 
              ...batch, 
              ...formData,
              // Keep original dates when editing
              dateAdded: batch.dateAdded,
              status: batch.status,
              estimatedBottling: batch.estimatedBottling
            }
          : batch
      ));
    } else {
      // Add new batch
      const newBatch: BatchItem = {
        id: `batch-${Date.now()}`,
        ...formData,
        dateAdded: new Date().toISOString().split('T')[0],
        status: "primary-fermentation",
        estimatedBottling: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setBatches(prev => [newBatch, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Red Wine",
      vintage: new Date().getFullYear(),
      quantity: 0,
      agingNotes: "",
      dateStarted: new Date().toISOString().split('T')[0],
      estimatedAgingTime: 12,
      estimatedAgingUnit: "weeks"
    });
    setFormErrors({});
    setShowForm(false);
    setEditingBatch(null);
  };

  const handleEdit = (batch: BatchItem) => {
    setFormData({
      name: batch.name,
      type: batch.type,
      vintage: batch.vintage,
      quantity: batch.quantity,
      agingNotes: batch.agingNotes,
      dateStarted: batch.dateStarted,
      estimatedAgingTime: batch.estimatedAgingTime,
      estimatedAgingUnit: batch.estimatedAgingUnit
    });
    setEditingBatch(batch);
    setShowForm(true);
  };

  const handleDelete = (batchId: string) => {
    setBatches(prev => prev.filter(batch => batch.id !== batchId));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const calculateAgingProgress = (batch: BatchItem) => {
    const startDate = new Date(batch.dateStarted);
    const currentDate = new Date();

    // Convert aging time to days
    const agingTimeInDays = batch.estimatedAgingUnit === "months"
      ? batch.estimatedAgingTime * 30.44 // Average days per month
      : batch.estimatedAgingTime * 7; // Days per week

    // Calculate days elapsed
    const daysElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate percentage (max 100%)
    const percentage = Math.min(Math.max((daysElapsed / agingTimeInDays) * 100, 0), 100);

    return {
      percentage: Math.round(percentage),
      daysElapsed,
      totalDays: Math.round(agingTimeInDays),
      isComplete: percentage >= 100,
      isOverdue: percentage > 100
    };
  };

  const getProgressBarColor = (progress: ReturnType<typeof calculateAgingProgress>) => {
    if (progress.isOverdue) return "bg-red-500";
    if (progress.isComplete) return "bg-green-500";
    if (progress.percentage >= 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
            Batch Management
          </h1>
          <p className="text-gray-600">
            Add and manage wine batches throughout the production process
          </p>
        </div>
        {!showForm && (
          <Button 
            variant="accent" 
            className="gap-2"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add Batch
          </Button>
        )}
      </div>

      {/* Add/Edit Batch Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-playfair text-xl font-semibold text-gray-900">
              {editingBatch ? "Edit Batch" : "Add New Batch"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batch Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Batch Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Napa Valley Cabernet 2024"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Wine Type */}
              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Wine Type *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors ${
                    formErrors.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {wineTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formErrors.type && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.type}
                  </p>
                )}
              </div>

              {/* Vintage */}
              <div className="space-y-2">
                <label htmlFor="vintage" className="block text-sm font-medium text-gray-700">
                  Vintage Year *
                </label>
                <input
                  id="vintage"
                  type="number"
                  value={formData.vintage}
                  onChange={(e) => setFormData(prev => ({ ...prev, vintage: parseInt(e.target.value) }))}
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors ${
                    formErrors.vintage ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.vintage && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.vintage}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity (gallons) *
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  min="1"
                  placeholder="e.g., 500"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors ${
                    formErrors.quantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.quantity && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.quantity}
                  </p>
                )}
              </div>

              {/* Date Started */}
              <div className="space-y-2">
                <label htmlFor="dateStarted" className="block text-sm font-medium text-gray-700">
                  Date Started *
                </label>
                <input
                  id="dateStarted"
                  type="date"
                  value={formData.dateStarted}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateStarted: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors ${
                    formErrors.dateStarted ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.dateStarted && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.dateStarted}
                  </p>
                )}
              </div>

              {/* Estimated Aging Time */}
              <div className="space-y-2">
                <label htmlFor="estimatedAgingTime" className="block text-sm font-medium text-gray-700">
                  Estimated Aging Time *
                </label>
                <div className="flex gap-2">
                  <input
                    id="estimatedAgingTime"
                    type="number"
                    value={formData.estimatedAgingTime || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedAgingTime: parseInt(e.target.value) || 0 }))}
                    min="1"
                    placeholder="12"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors ${
                      formErrors.estimatedAgingTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <select
                    value={formData.estimatedAgingUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedAgingUnit: e.target.value as "weeks" | "months" }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors"
                  >
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
                {formErrors.estimatedAgingTime && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.estimatedAgingTime}
                  </p>
                )}
              </div>
            </div>

            {/* Aging Notes */}
            <div className="space-y-2">
              <label htmlFor="agingNotes" className="block text-sm font-medium text-gray-700">
                Aging Notes *
              </label>
              <textarea
                id="agingNotes"
                value={formData.agingNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, agingNotes: e.target.value }))}
                rows={3}
                placeholder="e.g., French oak barrels, 18 months aging planned..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors resize-none ${
                  formErrors.agingNotes ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.agingNotes && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.agingNotes}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="cancel"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                {editingBatch ? "Update Batch" : "Add Batch"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Batches List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-playfair text-xl font-semibold text-gray-900">
            Current Batches
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {batches.map((batch) => (
            <div key={batch.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-playfair text-lg font-medium text-gray-900">
                      {batch.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(batch.status)}
                      {(() => {
                        const alert = getBatchInventoryAlert(batch.id);
                        if (alert) {
                          return (
                            <Badge
                              className={`gap-1 ${
                                alert.type === "out-of-stock"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                              title={alert.items.map(item => item.name).join(", ")}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {alert.message}
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Type & Vintage</p>
                      <p className="font-medium text-gray-900">{batch.type} • {batch.vintage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium text-gray-900">{batch.quantity} gallons</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date Started</p>
                      <p className="font-medium text-gray-900">{formatDate(batch.dateStarted)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Aging Time</p>
                      <p className="font-medium text-gray-900">{batch.estimatedAgingTime} {batch.estimatedAgingUnit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date Added</p>
                      <p className="font-medium text-gray-900">{formatDate(batch.dateAdded)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Aging Notes</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{batch.agingNotes}</p>
                  </div>

                  {/* Aging Progress Bar */}
                  {(() => {
                    const progress = calculateAgingProgress(batch);
                    return (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-500">Aging Progress</p>
                          <span className={`text-sm font-medium ${
                            progress.isOverdue ? 'text-red-600' :
                            progress.isComplete ? 'text-green-600' :
                            'text-gray-700'
                          }`}>
                            {progress.percentage}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress)}`}
                            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{progress.daysElapsed}d elapsed</span>
                          <span>{progress.totalDays}d total</span>
                        </div>
                        {progress.isOverdue && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Aging time exceeded by {progress.daysElapsed - progress.totalDays} days
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {batch.estimatedBottling && (
                    <div>
                      <p className="text-sm text-gray-500">Estimated Bottling</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(batch.estimatedBottling)}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(batch)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(batch.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
