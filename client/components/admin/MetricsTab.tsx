import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Wine,
  AlertTriangle,
  Plus,
  Archive,
  WineOff,
  PieChart,
  Calendar,
  Activity,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface MetricCard {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface MetricsTabProps {
  settings?: {
    lowStockThreshold: number;
    outOfStockThreshold: number;
  };
}

export function MetricsTab({ settings }: MetricsTabProps = {}) {
  const { lowStockThreshold = 5, outOfStockThreshold = 0 } = settings || {};
  const { toast } = useToast();

  // State for Supabase data
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [batchesData, setBatchesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recent activity data (can be expanded to pull from multiple tables)
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      action: "Loading recent activity...",
      user: "System",
      time: "Now",
      status: "pending"
    }
  ]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch inventory data
        const { data: inventory, error: inventoryError } = await supabase
          .from('inventory')
          .select('*');

        if (inventoryError) {
          console.error('Error fetching inventory:', inventoryError);
        } else {
          setInventoryData(inventory || []);
        }

        // Fetch orders data
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
        } else {
          setOrdersData(orders || []);
        }

        // Fetch batches data
        const { data: batches, error: batchesError } = await supabase
          .from('batches')
          .select('*');

        if (batchesError) {
          console.error('Error fetching batches:', batchesError);
        } else {
          setBatchesData(batches || []);
        }

        // Generate recent activity from recent orders
        if (orders && orders.length > 0) {
          const recentOrders = orders.slice(0, 5).map((order: any, index: number) => ({
            id: index + 1,
            action: `New order ${order.order_number}`,
            user: order.customer_name,
            time: getRelativeTime(order.created_at),
            status: order.status || "pending"
          }));
          setRecentActivity(recentOrders);
        }

        // Check for any errors
        if (inventoryError || ordersError || batchesError) {
          setError('Some data could not be loaded');
          toast({
            title: "Warning",
            description: "Some metrics data could not be loaded from the database.",
            variant: "destructive",
          });
        }

      } catch (err) {
        console.error('Error fetching metrics data:', err);
        setError('Failed to load metrics data');
        toast({
          title: "Error",
          description: "Failed to load metrics data from the database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Helper function to get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  // Calculate metrics from Supabase data
  const calculateMetrics = () => {
    if (loading) {
      return {
        totalInventory: 0,
        lowStockCount: 0,
        recentAdditions: 0,
        archivedBatches: 0,
        mostPopularType: "Loading...",
        wineTypeBreakdown: "Loading..."
      };
    }

    // Total inventory count
    const totalInventory = inventoryData
      .filter(item => item.quantity > 0)
      .reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

    // Low stock alerts (quantity <= lowStockThreshold but > outOfStockThreshold)
    const lowStockCount = inventoryData
      .filter(item => {
        const qty = parseInt(item.quantity) || 0;
        return qty <= lowStockThreshold && qty > outOfStockThreshold;
      })
      .length;

    // Recent additions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAdditions = inventoryData
      .filter(item => {
        const itemDate = new Date(item.created_at || item.last_updated || '1970-01-01');
        return itemDate >= sevenDaysAgo && (parseInt(item.quantity) || 0) > 0;
      })
      .reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

    // Completed/bottled batches count
    const completedBatches = batchesData
      .filter(batch => batch.status === "bottled" || batch.status === "completed")
      .length;

    // Most popular wine type
    const typeQuantities = inventoryData
      .filter(item => (parseInt(item.quantity) || 0) > 0)
      .reduce((acc, item) => {
        const type = item.type || "Unknown";
        acc[type] = (acc[type] || 0) + (parseInt(item.quantity) || 0);
        return acc;
      }, {} as Record<string, number>);

    const mostPopularType = Object.entries(typeQuantities)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "No data";

    // Calculate wine type percentages
    const totalActiveQuantity = Object.values(typeQuantities).reduce((sum, qty) => sum + qty, 0);
    const typePercentages = Object.entries(typeQuantities)
      .sort(([,a], [,b]) => b - a)
      .map(([type, quantity]) => ({
        type,
        percentage: totalActiveQuantity > 0 ? Math.round((quantity / totalActiveQuantity) * 100) : 0
      }));

    // Format top 3 types for display
    const wineTypeBreakdown = typePercentages.length > 0
      ? typePercentages
          .slice(0, 3)
          .map(item => `${item.type} ${item.percentage}%`)
          .join(", ")
      : "No inventory data";

    return {
      totalInventory,
      lowStockCount,
      recentAdditions,
      archivedBatches: completedBatches,
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
        {metricCards.slice(0, -1).map((metric, index) => {
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

        {/* Wine Type Breakdown Pie Chart */}
        {(() => {
          if (loading) {
            return (
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Wine Type Breakdown</p>
                  <p className="text-lg text-gray-500">Loading...</p>
                </div>
              </div>
            );
          }

          const typeQuantities = inventoryData
            .filter(item => (parseInt(item.quantity) || 0) > 0)
            .reduce((acc, item) => {
              const type = item.type || "Unknown";
              acc[type] = (acc[type] || 0) + (parseInt(item.quantity) || 0);
              return acc;
            }, {} as Record<string, number>);

          const totalQuantity = Object.values(typeQuantities).reduce((sum, qty) => sum + qty, 0);
          const typeData = Object.entries(typeQuantities)
            .map(([type, quantity]) => ({
              type,
              quantity,
              percentage: totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0
            }))
            .sort((a, b) => b.quantity - a.quantity);

          const colors = [
            '#9C1B2A', // Wine
            '#1F2937', // Federal
            '#7C3AED', // Purple
            '#059669', // Green
            '#DC2626', // Red
          ];

          if (typeData.length === 0) {
            return (
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Wine Type Breakdown</p>
                  <p className="text-lg text-gray-500">No inventory data</p>
                </div>
              </div>
            );
          }

          let cumulativePercentage = 0;
          const radius = 80;
          const centerX = 100;
          const centerY = 100;

          return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-600">Wine Type Breakdown</p>

                {/* SVG Pie Chart */}
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <div className="flex-shrink-0">
                    <svg width="200" height="200" viewBox="0 0 200 200" className="w-32 h-32 lg:w-40 lg:h-40">
                      {typeData.map((data, index) => {
                        const startAngle = (cumulativePercentage / 100) * 360;
                        const endAngle = startAngle + (data.percentage / 100) * 360;

                        const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                        const endAngleRad = (endAngle - 90) * (Math.PI / 180);

                        const x1 = centerX + radius * Math.cos(startAngleRad);
                        const y1 = centerY + radius * Math.sin(startAngleRad);
                        const x2 = centerX + radius * Math.cos(endAngleRad);
                        const y2 = centerY + radius * Math.sin(endAngleRad);

                        const largeArcFlag = data.percentage > 50 ? 1 : 0;

                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          'Z'
                        ].join(' ');

                        cumulativePercentage += data.percentage;

                        return (
                          <path
                            key={data.type}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="white"
                            strokeWidth="2"
                            className="hover:opacity-80 transition-opacity"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-2">
                    {typeData.map((data, index) => (
                      <div key={data.type} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="font-medium text-gray-700">{data.type}</span>
                        <span className="text-gray-500">
                          {data.percentage.toFixed(1)}% ({data.quantity} bottles)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-500">Based on current inventory</p>
              </div>
            </div>
          );
        })()}
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
