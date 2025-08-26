import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { WineCard, Wine } from "@/components/WineCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar, FilterOptions } from "@/components/FilterBar";
import { CartModal, CartItem } from "@/components/CartModal";
import { StickyCartFooter } from "@/components/StickyCartFooter";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Grid, List } from "lucide-react";

// Mock wine data
const mockWines: Wine[] = [
  {
    id: "wine-001",
    name: "Château Margaux 2015",
    winery: "Château Margaux",
    vintage: 2015,
    region: "Bordeaux",
    type: "Red Wine",
    price: 450.00,
    inStock: 12,
    rating: 4.8,
    description: "A legendary Bordeaux blend with exceptional complexity, featuring notes of blackcurrant, cedar, and violet. This wine showcases the perfect harmony between power and elegance.",
    flavorNotes: ["Blackcurrant", "Cedar", "Violet", "Dark Chocolate", "Tobacco"]
  },
  {
    id: "wine-002",
    name: "Dom Pérignon Vintage",
    winery: "Dom Pérignon",
    vintage: 2012,
    region: "Champagne",
    type: "Sparkling",
    price: 280.00,
    inStock: 8,
    rating: 4.9,
    description: "The epitome of luxury Champagne, with fine bubbles and complex flavors of brioche, citrus, and toasted almonds. A celebration in every sip.",
    flavorNotes: ["Brioche", "Citrus", "Toasted Almonds", "Honey", "Minerality"]
  },
  {
    id: "wine-003",
    name: "Opus One",
    winery: "Opus One Winery",
    vintage: 2018,
    region: "Napa Valley",
    type: "Red Wine",
    price: 380.00,
    inStock: 15,
    rating: 4.7,
    description: "A Bordeaux-style blend from Napa Valley, combining Cabernet Sauvignon with Merlot and other varietals. Rich, full-bodied with layers of dark fruit and spice.",
    flavorNotes: ["Blackberry", "Cassis", "Vanilla", "Oak", "Dark Spices"]
  },
  {
    id: "wine-004",
    name: "Barolo Brunate",
    winery: "Giuseppe Mascarello",
    vintage: 2017,
    region: "Tuscany",
    type: "Red Wine",
    price: 120.00,
    inStock: 24,
    rating: 4.6,
    description: "Classic Barolo with intense garnet color and complex aromas of tar, roses, and dark cherries. A wine of great structure and aging potential.",
    flavorNotes: ["Tar", "Roses", "Dark Cherry", "Leather", "Truffle"]
  },
  {
    id: "wine-005",
    name: "Sancerre Les Monts Damnés",
    winery: "Henri Bourgeois",
    vintage: 2020,
    region: "Loire Valley",
    type: "White Wine",
    price: 85.00,
    inStock: 36,
    rating: 4.4,
    description: "Crisp and mineral-driven Sauvignon Blanc with notes of citrus, gooseberry, and wet stone. Perfect expression of Loire Valley terroir.",
    flavorNotes: ["Citrus", "Gooseberry", "Wet Stone", "Green Herbs", "Minerality"]
  },
  {
    id: "wine-006",
    name: "Châteauneuf-du-Pape",
    winery: "Château de Beaucastel",
    vintage: 2019,
    region: "Rhône Valley",
    type: "Red Wine",
    price: 95.00,
    inStock: 18,
    rating: 4.5,
    description: "A rich and powerful blend showcasing the diversity of Rhône varieties. Deep, concentrated flavors of dark fruit, herbs, and spice.",
    flavorNotes: ["Dark Fruit", "Herbs", "Spice", "Garrigue", "Pepper"]
  },
  {
    id: "wine-007",
    name: "Whispering Angel Rosé",
    winery: "Château d'Esclans",
    vintage: 2022,
    region: "Provence",
    type: "Rosé",
    price: 25.00,
    inStock: 48,
    rating: 4.2,
    description: "Pale pink Provence rosé with delicate flavors of strawberry, peach, and citrus. Light, fresh, and perfect for warm weather enjoyment.",
    flavorNotes: ["Strawberry", "Peach", "Citrus", "Melon", "Fresh Herbs"]
  },
  {
    id: "wine-008",
    name: "Riesling Spätlese",
    winery: "Dr. Loosen",
    vintage: 2021,
    region: "Mosel",
    type: "Dessert Wine",
    price: 45.00,
    inStock: 0,
    rating: 4.3,
    description: "Late harvest Riesling with beautiful balance of sweetness and acidity. Notes of honey, apricot, and mineral undertones.",
    flavorNotes: ["Honey", "Apricot", "Minerality", "Lime", "Petrol"]
  }
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    priceRange: [0, 1000],
    inStockOnly: false,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initialization
    try {
      const savedCart = localStorage.getItem("corkCountCart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem("corkCountCart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  // Filter and search logic
  const filteredWines = useMemo(() => {
    return mockWines.filter(wine => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = `${wine.name} ${wine.winery} ${wine.region} ${wine.type}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(wine.type)) return false;

      // Price range filter
      if (wine.price < filters.priceRange[0] || wine.price > filters.priceRange[1]) return false;

      // In stock filter
      if (filters.inStockOnly && wine.inStock === 0) return false;

      return true;
    });
  }, [searchQuery, filters]);

  const handleAddToCart = (wine: Wine, quantity: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.wine.id === wine.id);
      if (existingItem) {
        // Update quantity of existing item
        return prev.map(item =>
          item.wine.id === wine.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, wine.inStock) }
            : item
        );
      } else {
        // Add new item
        return [...prev, {
          id: `cart-${wine.id}-${Date.now()}`,
          wine,
          quantity: Math.min(quantity, wine.inStock)
        }];
      }
    });
  };

  const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(newQuantity, item.wine.inStock) }
          : item
      )
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleOpenCart = () => {
    setIsCartModalOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartModalOpen(false);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    setIsCartModalOpen(false);
    navigate("/checkout", {
      state: { cartItems }
    });
  };

  const handleOpenAdminLogin = () => {
    setIsAdminLoginModalOpen(true);
  };

  const handleCloseAdminLogin = () => {
    setIsAdminLoginModalOpen(false);
  };

  const handleAdminLogin = () => {
    // Redirect to admin dashboard
    navigate("/admin-dashboard");
  };

  // Calculate cart totals
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + (item.wine.price * item.quantity), 0);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      regions: [],
      priceRange: [0, 1000],
      inStockOnly: false,
      rating: null,
    });
  };

  return (
    <div className="min-h-screen bg-smoke">
      <Navigation
        cartItemCount={totalCartItems}
        userRole="customer"
        onOpenCart={handleOpenCart}
        onOpenAdminLogin={handleOpenAdminLogin}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-wine to-wine/90 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="font-playfair text-4xl sm:text-6xl font-bold mb-6">
              Sip Happens — Find Your Vintage
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-wine-100 max-w-3xl mx-auto">
              Curated collection of premium wines from renowned vineyards around the world. 
              From everyday favorites to rare vintages.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar 
                onSearch={handleSearch}
                onClear={clearSearch}
                placeholder="Search wines, wineries, regions..."
              />
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{mockWines.length}</div>
                <div className="text-wine-200">Wines Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{mockWines.filter(w => w.inStock > 0).length}</div>
                <div className="text-wine-200">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Array.from(new Set(mockWines.map(w => w.region))).length}</div>
                <div className="text-wine-200">Regions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <div className="mb-8 space-y-4">
          {/* Filter Toggle & View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "accent" : "navigation"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              
              {(searchQuery || filters.types.length > 0 || filters.regions.length > 0 || filters.inStockOnly || filters.rating) && (
                <Badge variant="secondary">
                  {filteredWines.length} of {mockWines.length} wines
                </Badge>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
              <Button
                variant={viewMode === "grid" ? "accent" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "accent" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <FilterBar
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              availableTypes={Array.from(new Set(mockWines.map(w => w.type)))}
              availableRegions={Array.from(new Set(mockWines.map(w => w.region)))}
            />
          )}
        </div>

        {/* Wine Grid/List */}
        {filteredWines.length > 0 ? (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }>
            {filteredWines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                onAddToCart={handleAddToCart}
                onViewDetails={(wine) => console.log("View details:", wine)}
                variant="storefront"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-2">
              No wines found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="accent" onClick={() => {
              clearSearch();
              clearFilters();
            }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={handleCloseCart}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={handleCloseAdminLogin}
        onLogin={handleAdminLogin}
      />

      {/* Sticky Cart Footer */}
      <StickyCartFooter
        itemCount={totalCartItems}
        totalPrice={totalCartPrice}
        onOpenCart={handleOpenCart}
        className="md:hidden" // Only show on mobile
      />
    </div>
  );
}
