import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign,
  ShoppingCart,
  Calendar,
  Activity
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const metricCards: MetricCard[] = [
  {
    title: "Total Inventory",
    value: "1,247",
    change: "+5.2%",
    trend: "up",
    icon: Package,
    color: "bg-blue-500"
  },
  {
    title: "Low Stock Alerts",
    value: 8,
    change: "-2 from yesterday",
    trend: "down",
    icon: AlertTriangle,
    color: "bg-orange-500"
  },
  {
    title: "Monthly Revenue",
    value: "$47,329",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "bg-green-500"
  },
  {
    title: "Orders Today",
    value: 23,
    change: "+4 from yesterday",
    trend: "up",
    icon: ShoppingCart,
    color: "bg-federal"
  },
  {
    title: "Active Customers",
    value: 156,
    change: "+8.1%",
    trend: "up",
    icon: Users,
    color: "bg-wine"
  },
  {
    title: "Avg Order Value",
    value: "$127.45",
    change: "+3.2%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-eggplant"
  }
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

export function MetricsTab() {
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

  const getTrendIcon = (trend?: string) => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === "down") return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Monitor your wine inventory, sales, and business metrics
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {metric.trend && getTrendIcon(metric.trend)}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                {metric.change && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm ${
                      metric.trend === "up" ? "text-green-600" : 
                      metric.trend === "down" ? "text-red-600" : 
                      "text-gray-600"
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                )}
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
