import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Package
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  winery: string;
  vintage: number;
  type: string;
  quantity: number;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: "inv-001",
    name: "Château Margaux",
    winery: "Château Margaux",
    vintage: 2015,
    type: "Red Wine",
    quantity: 12,
    price: 450.00,
    status: "in-stock",
    lastUpdated: "2024-01-15"
  },
  {
    id: "inv-002",
    name: "Dom Pérignon Vintage",
    winery: "Dom Pérignon",
    vintage: 2012,
    type: "Sparkling",
    quantity: 8,
    price: 280.00,
    status: "in-stock",
    lastUpdated: "2024-01-14"
  },
  {
    id: "inv-003",
    name: "Opus One",
    winery: "Opus One Winery",
    vintage: 2018,
    type: "Red Wine",
    quantity: 15,
    price: 380.00,
    status: "in-stock",
    lastUpdated: "2024-01-13"
  },
  {
    id: "inv-004",
    name: "Barolo Brunate",
    winery: "Giuseppe Mascarello",
    vintage: 2017,
    type: "Red Wine",
    quantity: 3,
    price: 120.00,
    status: "low-stock",
    lastUpdated: "2024-01-12"
  },
  {
    id: "inv-005",
    name: "Sancerre Les Monts Damnés",
    winery: "Henri Bourgeois",
    vintage: 2020,
    type: "White Wine",
    quantity: 36,
    price: 85.00,
    status: "in-stock",
    lastUpdated: "2024-01-11"
  },
  {
    id: "inv-006",
    name: "Châteauneuf-du-Pape",
    winery: "Château de Beaucastel",
    vintage: 2019,
    type: "Red Wine",
    quantity: 2,
    price: 95.00,
    status: "low-stock",
    lastUpdated: "2024-01-10"
  },
  {
    id: "inv-007",
    name: "Whispering Angel Rosé",
    winery: "Château d'Esclans",
    vintage: 2022,
    type: "Rosé",
    quantity: 48,
    price: 25.00,
    status: "in-stock",
    lastUpdated: "2024-01-09"
  },
  {
    id: "inv-008",
    name: "Riesling Spätlese",
    winery: "Dr. Loosen",
    vintage: 2021,
    type: "Dessert Wine",
    quantity: 0,
    price: 45.00,
    status: "out-of-stock",
    lastUpdated: "2024-01-08"
  }
];

export function InventoryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle className="h-3 w-3" />
            In Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge className="bg-orange-100 text-orange-800 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low Stock
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge className="bg-red-100 text-red-800 gap-1">
            <Package className="h-3 w-3" />
            Out of Stock
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredInventory = mockInventory
    .filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.winery.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
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

  const handleSort = (field: keyof InventoryItem) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Manage your wine collection and track stock levels
          </p>
        </div>
        <Button variant="accent" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Wine
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search wines, wineries, types..."
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
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Wine Name
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("vintage")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Vintage
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Type
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort("quantity")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Quantity
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
                    onClick={() => handleSort("price")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Price
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
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-playfair font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.winery}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.vintage}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.quantity} bottles
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
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
        Showing {filteredInventory.length} of {mockInventory.length} wines
      </div>
    </div>
  );
}
