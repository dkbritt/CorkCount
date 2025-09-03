import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wine,
  LogOut,
  Package2,
  ShoppingBag,
  Beaker,
  TrendingUp,
  Settings,
  Plus,
  Grape
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

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
  { id: "metrics", label: "Metrics", icon: TrendingUp },
  { id: "inventory", label: "Inventory", icon: Grape },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "batch", label: "Batch Management", icon: Beaker },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("metrics");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [inventorySettings, setInventorySettings] = useState<InventorySettings>({
    lowStockThreshold: 5,
    outOfStockThreshold: 0
  });
  const navigate = useNavigate();

  // Add intersection observer for main content animation
  const { elementRef: mainContentRef, isIntersecting: mainContentInView } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
  });

  // Callbacks for floating action button
  const [onAddInventory, setOnAddInventory] = useState<(() => void) | null>(null);
  const [onAddBatch, setOnAddBatch] = useState<(() => void) | null>(null);

  // Create stable callback setters using useCallback
  const handleSetAddInventory = useCallback((callback: () => void) => {
    setOnAddInventory(() => callback);
  }, []);

  const handleSetAddBatch = useCallback((callback: () => void) => {
    setOnAddBatch(() => callback);
  }, []);

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
        return <InventoryTab settings={inventorySettings} onSetAddCallback={handleSetAddInventory} />;
      case "orders":
        return <OrdersTab />;
      case "batch":
        return <BatchManagementTab settings={inventorySettings} onSetAddCallback={handleSetAddBatch} />;
      case "metrics":
        return <MetricsTab settings={inventorySettings} />;
      default:
        return <MetricsTab settings={inventorySettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-smoke overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="wine-accent-bg border-b wine-accent-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="wine-icon-container w-8 h-8 flex items-center justify-center">
                <Wine className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-playfair font-bold text-lg wine-accent-text">
                  CorkCount
                </span>
                <span className="text-xs wine-accent-text opacity-70 -mt-1">
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
                className="h-8 w-8 p-0 hover:bg-white/20 wine-accent-text"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="navigation"
                size="sm"
                onClick={handleLogout}
                className="gap-2 bg-white/10 hover:bg-white/20 wine-accent-text border-white/20"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Section Divider */}
      <div className="admin-section-divider wine-themed"></div>

      {/* Tab Navigation - Desktop (top) */}
      <div className="hidden md:block bg-white border-b wine-accent-border">
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
                      ? 'admin-tab-active'
                      : 'text-gray-600 admin-tab-inactive'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {renderTabContent()}
      </div>

      {/* Tab Navigation - Mobile (bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-all flex-1
                  ${isActive
                    ? 'text-federal bg-federal/5'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      {(() => {
        const buttonConfig = getFloatingButtonConfig();
        if (!buttonConfig.show) return null;

        const Icon = buttonConfig.icon!;

        return (
          <Button
            onClick={buttonConfig.action}
            className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 md:bottom-8 md:right-8"
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
