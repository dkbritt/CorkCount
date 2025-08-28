import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  FileText,
  X,
  Clock,
  CheckCircle,
  Package,
  XCircle
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
  status: "pending" | "ready-for-pickup" | "picked-up" | "cancelled";
  orderDate: string;
  pickupDate?: string;
  pickupTime?: string;
  paymentMethod?: string;
  phone?: string;
  orderNotes?: string;
}

const mockOrders: Order[] = [
  {
    id: "ord-001",
    orderNumber: "ORD-20240115-001",
    customer: {
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com"
    },
    items: [
      { name: "Château Margaux 2015", quantity: 1, price: 450.00 },
      { name: "Dom Pérignon Vintage 2012", quantity: 2, price: 280.00 }
    ],
    total: 1010.00,
    status: "pending",
    orderDate: "2024-01-15T14:30:00Z",
    pickupDate: "2024-01-18",
    pickupTime: "2:00 PM",
    paymentMethod: "zelle",
    phone: "(555) 123-4567",
    orderNotes: "Please hold until pickup confirmation"
  },
  {
    id: "ord-002",
    orderNumber: "ORD-20240114-001",
    customer: {
      name: "John Smith",
      email: "john.smith@email.com"
    },
    items: [
      { name: "Opus One 2018", quantity: 1, price: 380.00 },
      { name: "Barolo Brunate 2017", quantity: 2, price: 120.00 }
    ],
    total: 620.00,
    status: "ready-for-pickup",
    orderDate: "2024-01-14T09:15:00Z",
    pickupDate: "2024-01-16",
    pickupTime: "4:00 PM",
    paymentMethod: "cashapp"
  },
  {
    id: "ord-003",
    orderNumber: "ORD-20240112-001",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@email.com"
    },
    items: [
      { name: "Sancerre Les Monts Damnés 2020", quantity: 3, price: 85.00 }
    ],
    total: 255.00,
    status: "picked-up",
    orderDate: "2024-01-12T16:45:00Z",
    pickupDate: "2024-01-15",
    pickupTime: "11:00 AM",
    paymentMethod: "cash"
  }
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "ready-for-pickup", label: "Ready for Pickup" },
  { value: "picked-up", label: "Picked Up" },
  { value: "cancelled", label: "Cancelled" }
];

const paymentMethodLabels: Record<string, string> = {
  zelle: "Zelle",
  cashapp: "CashApp",
  cash: "Cash"
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>({});

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
          status: checkoutOrder.status === "pending" ? "pending" : checkoutOrder.status,
          orderDate: checkoutOrder.orderDate,
          pickupDate: checkoutOrder.pickupDate,
          pickupTime: checkoutOrder.pickupTime,
          paymentMethod: checkoutOrder.paymentMethod,
          phone: checkoutOrder.phone,
          orderNotes: checkoutOrder.orderNotes
        }));
        
        // Merge with mock orders, with checkout orders first
        const allOrders = [...convertedOrders, ...mockOrders];
        setOrders(allOrders);
        
        // Initialize status updates for all orders
        const initialStatusUpdates: Record<string, string> = {};
        allOrders.forEach(order => {
          initialStatusUpdates[order.id] = order.status;
        });
        setStatusUpdates(initialStatusUpdates);
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
        setOrders(mockOrders);
        
        // Initialize status updates for mock orders
        const initialStatusUpdates: Record<string, string> = {};
        mockOrders.forEach(order => {
          initialStatusUpdates[order.id] = order.status;
        });
        setStatusUpdates(initialStatusUpdates);
      }
    };
    
    loadOrdersFromStorage();
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
      case "ready-for-pickup":
        return (
          <Badge className="bg-blue-100 text-blue-800 gap-1">
            <Package className="h-3 w-3" />
            Ready for Pickup
          </Badge>
        );
      case "picked-up":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle className="h-3 w-3" />
            Picked Up
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 gap-1">
            <XCircle className="h-3 w-3" />
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

  const formatPickupDateTime = (date?: string, time?: string) => {
    if (!date) return "Not scheduled";
    const formattedDate = formatDate(date);
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  const getTotalBottles = (items: Order['items']) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  const handleUpdateStatus = (orderId: string) => {
    const newStatus = statusUpdates[orderId];
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus as Order['status'] }
        : order
    ));
    
    // Update localStorage if this is a checkout order
    try {
      const checkoutOrders = JSON.parse(localStorage.getItem("corkCountOrders") || "[]");
      const updatedCheckoutOrders = checkoutOrders.map((order: any) => {
        const orderId_normalized = order.orderNumber.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return orderId_normalized === orderId 
          ? { ...order, status: newStatus }
          : order;
      });
      localStorage.setItem("corkCountOrders", JSON.stringify(updatedCheckoutOrders));
    } catch (error) {
      console.error('Error updating order status in localStorage:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
            Customer Orders
          </h1>
          <p className="text-gray-600">
            View and manage customer pickup orders
          </p>
        </div>
        
        {/* Empty State */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="font-playfair text-xl font-semibold text-gray-900 mb-2">
            No orders yet — corks are still popping!
          </h2>
          <p className="text-gray-600">
            Customer orders will appear here once they complete checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
          Customer Orders
        </h1>
        <p className="text-gray-600">
          View and manage customer pickup orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  # Bottles Ordered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 font-mono">
                      {order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {order.customer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.orderDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getTotalBottles(order.items)} bottles
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatPickupDateTime(order.pickupDate, order.pickupTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.paymentMethod ? paymentMethodLabels[order.paymentMethod] || order.paymentMethod : "Not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={statusUpdates[order.id] || order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleUpdateStatus(order.id)}
                        disabled={statusUpdates[order.id] === order.status}
                        className="px-3 py-1 text-xs"
                      >
                        Update
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="h-8 w-8 p-0"
                      title="View order details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500">
        Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="font-playfair text-xl font-semibold text-gray-900">
                Order Details
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Order #:</span>
                      <span className="ml-2 font-mono font-medium">{selectedOrder.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <span className="ml-2">{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.customer.email}</span>
                    </div>
                    {selectedOrder.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pickup & Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Pickup Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatPickupDateTime(selectedOrder.pickupDate, selectedOrder.pickupTime)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.paymentMethod ? paymentMethodLabels[selectedOrder.paymentMethod] : "Not specified"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottle List */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Bottle List</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">Qty</th>
                          <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-20">Price</th>
                          <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-2 sm:px-4 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-2 sm:px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                            <td className="px-2 sm:px-4 py-2 text-sm text-gray-900 text-right">${item.price.toFixed(2)}</td>
                            <td className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-900 text-right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-900 text-right">
                            Total:
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-sm font-bold text-wine text-right">
                            ${selectedOrder.total.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.orderNotes && (
                <div>
                  <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                    <FileText className="h-4 w-4" />
                    Order Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedOrder.orderNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
