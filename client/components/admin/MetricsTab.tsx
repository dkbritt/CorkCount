import { Badge } from "@/components/ui/badge";
import {
  Wine,
  AlertTriangle,
  Plus,
  Archive,
  WineOff,
  PieChart,
  Calendar,
  Activity
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Mock inventory data for calculations
const mockInventoryData = [
  { id: 1, name: "Château Margaux", type: "Red", quantity: 12, status: "active", dateAdded: "2024-01-10" },
  { id: 2, name: "Dom Pérignon", type: "Sparkling", quantity: 3, status: "active", dateAdded: "2024-01-12" },
  { id: 3, name: "Sancerre", type: "White", quantity: 25, status: "active", dateAdded: "2024-01-08" },
  { id: 4, name: "Barolo", type: "Red", quantity: 2, status: "active", dateAdded: "2024-01-15" },
  { id: 5, name: "Whispering Angel", type: "Rosé", quantity: 18, status: "active", dateAdded: "2024-01-14" },
  { id: 6, name: "Opus One", type: "Red", quantity: 8, status: "active", dateAdded: "2024-01-11" },
  { id: 7, name: "Vintage Port", type: "Dessert", quantity: 1, status: "active", dateAdded: "2024-01-09" },
  { id: 8, name: "Aged Bordeaux", type: "Red", quantity: 6, status: "archived", dateAdded: "2023-12-20" },
  { id: 9, name: "Reserve Chardonnay", type: "White", quantity: 14, status: "active", dateAdded: "2024-01-13" }
];

const mockBatchData = [
  { id: 1, name: "2023 Bordeaux Reserve", status: "active" },
  { id: 2, name: "2022 Burgundy Collection", status: "archived" },
  { id: 3, name: "2021 Napa Valley Cabernet", status: "active" },
  { id: 4, name: "2020 Loire Valley Whites", status: "archived" },
  { id: 5, name: "2022 Champagne Selection", status: "active" }
];


const recentActivity = [
  {
    id: 1,
    action: "New order #ORD-2024-0156",
    user: "Sarah Wilson",
    time: "2 minutes ago",
    status: "pending"
  },
  {
    id: 2,
    action: "Inventory updated: Château Margaux 2015",
    user: "Admin",
    time: "15 minutes ago",
    status: "completed"
  },
  {
    id: 3,
    action: "Low stock alert: Dom Pérignon Vintage",
    user: "System",
    time: "1 hour ago",
    status: "warning"
  },
  {
    id: 4,
    action: "Batch added: Napa Valley Collection",
    user: "Admin",
    time: "2 hours ago",
    status: "completed"
  },
  {
    id: 5,
    action: "Order #ORD-2024-0155 shipped",
    user: "John Smith",
    time: "3 hours ago",
    status: "completed"
  }
];

interface MetricsTabProps {
  settings?: {
    lowStockThreshold: number;
    outOfStockThreshold: number;
  };
}

export function MetricsTab({ settings }: MetricsTabProps = {}) {
  const { lowStockThreshold = 5, outOfStockThreshold = 0 } = settings || {};

  // Calculate metrics from mock data
  const calculateMetrics = () => {
    // Total inventory count
    const totalInventory = mockInventoryData
      .filter(item => item.status === "active")
      .reduce((sum, item) => sum + item.quantity, 0);

    // Low stock alerts (quantity <= lowStockThreshold but > outOfStockThreshold)
    const lowStockCount = mockInventoryData
      .filter(item => item.status === "active" && item.quantity <= lowStockThreshold && item.quantity > outOfStockThreshold)
      .length;

    // Recent additions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAdditions = mockInventoryData
      .filter(item => {
        const itemDate = new Date(item.dateAdded);
        return itemDate >= sevenDaysAgo && item.status === "active";
      })
      .reduce((sum, item) => sum + item.quantity, 0);

    // Archived batches count
    const archivedBatches = mockBatchData
      .filter(batch => batch.status === "archived")
      .length;

    // Most popular wine type
    const typeQuantities = mockInventoryData
      .filter(item => item.status === "active")
      .reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);

    const mostPopularType = Object.entries(typeQuantities)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Red";

    // Calculate wine type percentages
    const totalActiveQuantity = Object.values(typeQuantities).reduce((sum, qty) => sum + qty, 0);
    const typePercentages = Object.entries(typeQuantities)
      .sort(([,a], [,b]) => b - a)
      .map(([type, quantity]) => ({
        type,
        percentage: totalActiveQuantity > 0 ? Math.round((quantity / totalActiveQuantity) * 100) : 0
      }));

    // Format top 3 types for display
    const wineTypeBreakdown = typePercentages
      .slice(0, 3)
      .map(item => `${item.type} ${item.percentage}%`)
      .join(", ");

    return {
      totalInventory,
      lowStockCount,
      recentAdditions,
      archivedBatches,
      mostPopularType,
      wineTypeBreakdown
    };
  };

  const metrics = calculateMetrics();

  const metricCards: MetricCard[] = [
    {
      title: "Total Inventory",
      value: metrics.totalInventory.toLocaleString(),
      subtext: "Updated daily",
      icon: Wine,
      color: "bg-federal"
    },
    {
      title: "Low Stock Alerts",
      value: metrics.lowStockCount,
      subtext: "Check Inventory tab",
      icon: AlertTriangle,
      color: "bg-orange-500"
    },
    {
      title: "Recent Additions",
      value: metrics.recentAdditions,
      subtext: "Batch Management activity",
      icon: Plus,
      color: "bg-green-500"
    },
    {
      title: "Archived Batches",
      value: metrics.archivedBatches,
      subtext: "Stored for aging or review",
      icon: Archive,
      color: "bg-eggplant"
    },
    {
      title: "Most Popular Type",
      value: metrics.mostPopularType,
      subtext: "Based on current inventory",
      icon: WineOff,
      color: "bg-wine"
    },
    {
      title: "Wine Type Overview",
      value: metrics.wineTypeBreakdown || "No data",
      subtext: "Based on current inventory",
      icon: PieChart,
      color: "bg-blue-600"
    }
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Remove getTrendIcon function as it's no longer needed

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
          Dashboard Metrics
        </h1>
        <p className="text-gray-600">
          Monitor your wine inventory and business metrics
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  {metric.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-500">
                  {metric.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <h2 className="font-playfair text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
                <Badge className={`text-xs px-2 py-1 ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
