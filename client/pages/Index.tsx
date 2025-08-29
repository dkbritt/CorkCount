import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { WineCard, Wine } from "@/components/WineCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar, FilterOptions } from "@/components/FilterBar";
import { CartModal, CartItem } from "@/components/CartModal";
import { StickyCartFooter } from "@/components/StickyCartFooter";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { WineDetailsModal } from "@/components/WineDetailsModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Grid, List, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const { toast } = useToast();
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
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [isWineDetailsModalOpen, setIsWineDetailsModalOpen] = useState(false);
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

  const handleViewWineDetails = (wine: Wine) => {
    setSelectedWine(wine);
    setIsWineDetailsModalOpen(true);
  };

  const handleCloseWineDetails = () => {
    setIsWineDetailsModalOpen(false);
    setSelectedWine(null);
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
      priceRange: [0, 1000],
      inStockOnly: false,
    });
  };

  return (
    <div className="min-h-screen bg-smoke overflow-x-hidden">
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
            <div className="font-playfair text-2xl sm:text-3xl italic text-wine-100 mb-4 font-medium">
              KB Winery
            </div>
            <h1 className="font-playfair text-4xl sm:text-6xl font-bold mb-6">
              Sip Happens �� Find Your Vintage
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
              />
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
              
              {(searchQuery || filters.types.length > 0 || filters.inStockOnly) && (
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
                onViewDetails={handleViewWineDetails}
                variant="storefront"
                layout={viewMode}
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

      {/* Wine Details Modal */}
      {selectedWine && (
        <WineDetailsModal
          wine={selectedWine}
          isOpen={isWineDetailsModalOpen}
          onClose={handleCloseWineDetails}
          onAddToCart={handleAddToCart}
        />
      )}

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
