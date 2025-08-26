import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import {
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  ArrowUpDown,
  Calendar
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  estimatedDelivery?: string;
  pickupDate?: string;
  pickupTime?: string;
  paymentMethod?: string;
  phone?: string;
  orderNotes?: string;
}

const mockOrders: Order[] = [
  {
    id: "ord-001",
    orderNumber: "ORD-2024-0156",
    customer: {
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com"
    },
    items: [
      { name: "Château Margaux 2015", quantity: 1, price: 450.00 },
      { name: "Dom Pérignon Vintage", quantity: 2, price: 280.00 }
    ],
    total: 1010.00,
    status: "pending",
    orderDate: "2024-01-15T14:30:00Z",
    estimatedDelivery: "2024-01-22"
  },
  {
    id: "ord-002",
    orderNumber: "ORD-2024-0155",
    customer: {
      name: "John Smith",
      email: "john.smith@email.com"
    },
    items: [
      { name: "Opus One 2018", quantity: 1, price: 380.00 },
      { name: "Barolo Brunate", quantity: 2, price: 120.00 }
    ],
    total: 620.00,
    status: "shipped",
    orderDate: "2024-01-14T09:15:00Z",
    estimatedDelivery: "2024-01-18"
  },
  {
    id: "ord-003",
    orderNumber: "ORD-2024-0154",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@email.com"
    },
    items: [
      { name: "Sancerre Les Monts Damnés", quantity: 3, price: 85.00 }
    ],
    total: 255.00,
    status: "delivered",
    orderDate: "2024-01-12T16:45:00Z",
    estimatedDelivery: "2024-01-16"
  },
  {
    id: "ord-004",
    orderNumber: "ORD-2024-0153",
    customer: {
      name: "Michael Brown",
      email: "michael.brown@email.com"
    },
    items: [
      { name: "Châteauneuf-du-Pape", quantity: 2, price: 95.00 },
      { name: "Whispering Angel Rosé", quantity: 4, price: 25.00 }
    ],
    total: 290.00,
    status: "processing",
    orderDate: "2024-01-11T11:20:00Z",
    estimatedDelivery: "2024-01-19"
  },
  {
    id: "ord-005",
    orderNumber: "ORD-2024-0152",
    customer: {
      name: "Lisa Anderson",
      email: "lisa.anderson@email.com"
    },
    items: [
      { name: "Riesling Spätlese", quantity: 2, price: 45.00 }
    ],
    total: 90.00,
    status: "cancelled",
    orderDate: "2024-01-10T13:30:00Z"
  }
];

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Order>("orderDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load orders from localStorage on component mount
  useEffect(() => {
    const loadOrdersFromStorage = () => {
      try {
        const checkoutOrders = JSON.parse(localStorage.getItem("corkCountOrders") || "[]");

        // Convert checkout orders to admin order format
        const convertedOrders = checkoutOrders.map((checkoutOrder: any) => ({
          id: checkoutOrder.orderNumber.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          orderNumber: checkoutOrder.orderNumber,
          customer: {
            name: checkoutOrder.customerName,
            email: checkoutOrder.email
          },
          items: checkoutOrder.items.map((item: any) => ({
            name: `${item.wine.name} ${item.wine.vintage}`,
            quantity: item.quantity,
            price: item.wine.price
          })),
          total: checkoutOrder.totalPrice,
          status: checkoutOrder.status,
          orderDate: checkoutOrder.orderDate,
          pickupDate: checkoutOrder.pickupDate,
          pickupTime: checkoutOrder.pickupTime,
          paymentMethod: checkoutOrder.paymentMethod,
          phone: checkoutOrder.phone,
          orderNotes: checkoutOrder.orderNotes
        }));

        // Merge with mock orders, with checkout orders first
        setOrders([...convertedOrders, ...mockOrders]);
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
        setOrders(mockOrders);
      }
    };

    loadOrdersFromStorage();

    // Optional: Listen for storage changes if orders are updated from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'corkCountOrders') {
        loadOrdersFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 gap-1">
            <Package className="h-3 w-3" />
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-purple-100 text-purple-800 gap-1">
            <Truck className="h-3 w-3" />
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 gap-1">
            <AlertCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = searchQuery === "" || 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === "orderDate") {
        const aDate = new Date(a.orderDate).getTime();
        const bDate = new Date(b.orderDate).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
          Order Management
        </h1>
        <p className="text-gray-600">
          View and manage customer orders and shipments
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search orders, customers..."
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("orderNumber")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Order
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("total")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Total
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("orderDate")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-3 text-center">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items.slice(0, 2).map(item => item.name).join(", ")}
                      {order.items.length > 2 && "..."}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.orderDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(order.orderDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredOrders.length} of {mockOrders.length} orders
      </div>
    </div>
  );
}
