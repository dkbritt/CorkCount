import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wine,
  LogOut,
  Package,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Settings,
  Plus
} from "lucide-react";

// Import tab components and settings modal
import { InventoryTab } from "@/components/admin/InventoryTab";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { BatchManagementTab } from "@/components/admin/BatchManagementTab";
import { MetricsTab } from "@/components/admin/MetricsTab";
import { SettingsModal, InventorySettings } from "@/components/admin/SettingsModal";

type TabType = "inventory" | "orders" | "batch" | "metrics";

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "batch", label: "Batch Management", icon: ClipboardList },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("metrics");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [inventorySettings, setInventorySettings] = useState<InventorySettings>({
    lowStockThreshold: 5,
    outOfStockThreshold: 0
  });
  const navigate = useNavigate();

  // Callbacks for floating action button
  const [onAddInventory, setOnAddInventory] = useState<(() => void) | null>(null);
  const [onAddBatch, setOnAddBatch] = useState<(() => void) | null>(null);

  const handleLogout = () => {
    // In a real app, this would clear auth tokens
    navigate("/");
  };

  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };

  const handleSaveSettings = (settings: InventorySettings) => {
    setInventorySettings(settings);
    // In a real app, this would save to backend/localStorage
  };

  const handleFloatingActionClick = () => {
    switch (activeTab) {
      case "inventory":
        if (onAddInventory) {
          onAddInventory();
        }
        break;
      case "batch":
        if (onAddBatch) {
          onAddBatch();
        }
        break;
      default:
        break;
    }
  };

  const getFloatingButtonConfig = () => {
    switch (activeTab) {
      case "inventory":
        return {
          show: true,
          label: "Add Bottle",
          icon: Package,
          action: handleFloatingActionClick
        };
      case "batch":
        return {
          show: true,
          label: "Add Batch",
          icon: ClipboardList,
          action: handleFloatingActionClick
        };
      default:
        return { show: false };
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "inventory":
        return <InventoryTab settings={inventorySettings} onSetAddCallback={setOnAddInventory} />;
      case "orders":
        return <OrdersTab />;
      case "batch":
        return <BatchManagementTab settings={inventorySettings} onSetAddCallback={setOnAddBatch} />;
      case "metrics":
        return <MetricsTab settings={inventorySettings} />;
      default:
        return <MetricsTab settings={inventorySettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-smoke overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-wine rounded-lg flex items-center justify-center">
                <Wine className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-playfair font-bold text-lg text-wine">
                  CorkCount
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Admin Dashboard
                </span>
              </div>
            </div>

            {/* Settings and Logout Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenSettings}
                className="h-8 w-8 p-0"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="navigation"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-federal text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Floating Action Button */}
      {(() => {
        const buttonConfig = getFloatingButtonConfig();
        if (!buttonConfig.show) return null;

        const Icon = buttonConfig.icon!;

        return (
          <Button
            onClick={buttonConfig.action}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 md:bottom-8 md:right-8"
            variant="accent"
            size="lg"
            title={buttonConfig.label}
          >
            <Plus className="h-6 w-6" />
          </Button>
        );
      })()}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        currentSettings={inventorySettings}
      />
    </div>
  );
}
