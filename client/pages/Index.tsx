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
import { useToast } from "@/hooks/use-toast";
import { formatError } from "@/lib/errors";

export default function Index() {
  const { toast } = useToast();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    priceRange: [0, 1000],
    inStockOnly: false,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initialization, migrate legacy key
    try {
      const NEW_KEY = "kbCart";
      const OLD_KEY = "corkCountCart";
      const savedNew = localStorage.getItem(NEW_KEY);
      if (savedNew) {
        return JSON.parse(savedNew);
      }
      const savedOld = localStorage.getItem(OLD_KEY);
      if (savedOld) {
        const parsed = JSON.parse(savedOld);
        try {
          localStorage.setItem(NEW_KEY, JSON.stringify(parsed));
          localStorage.removeItem(OLD_KEY);
        } catch {}
        return parsed;
      }
      return [];
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

  // Fetch inventory from Supabase
useEffect(() => {
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/fetch-inventory');
      const inventory = await response.json();

      if (!response.ok) {
        console.error('Inventory fetch error:', inventory.error);
        setError('Failed to load wine inventory');
        toast({
          title: "Error",
          description: `Failed to load wine inventory: ${inventory.error}`,
          variant: "destructive",
        });
        return;
      }

      // Convert inventory data to Wine format
      const winesData: Wine[] = (inventory || []).map((item: any) => ({
        id: item.id,
        name: item.name || 'Unnamed Wine',
        winery: item.winery || 'Unknown Winery',
        vintage: item.vintage || new Date().getFullYear(),
        region: '', // Not displayed on shop page
        type: item.type || 'Red Wine',
        price: parseFloat(item.price) || 0,
        inStock: parseInt(item.quantity) || 0,
        rating: 0, // Not displayed on shop page
        description: item.description || item.flavor_notes || 'A wonderful wine experience',
        flavorNotes: (
          item.tags && Array.isArray(item.tags) && item.tags.length > 0
            ? item.tags.map((tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1))
            : item.flavor_notes ? item.flavor_notes.split(',').map((note: string) => note.trim()) : ['Complex', 'Balanced']
        ),
        image: item.image_url || item.image || "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop"
      }));

      setWines(winesData);

      if (winesData.length === 0) {
        toast({
          title: "No wines available",
          description: "The wine inventory is currently empty. Please check back later.",
        });
      }

    } catch (err) {
      console.error('Error fetching inventory:', formatError(err));
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading wines.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchInventory();
  }, [toast]);


  // Save cart to localStorage whenever cartItems changes (minimized + bounded)
  useEffect(() => {
    const NEW_KEY = "kbCart";
    const minimizeCart = (items: CartItem[]) =>
      items.map((ci) => ({
        id: ci.id,
        quantity: ci.quantity,
        wine: {
          id: ci.wine.id,
          name: ci.wine.name,
          winery: ci.wine.winery,
          vintage: ci.wine.vintage,
          type: ci.wine.type,
          price: ci.wine.price,
          inStock: ci.wine.inStock,
          image: ci.wine.image,
        },
      }));

    try {
      const payload = JSON.stringify(minimizeCart(cartItems));
      localStorage.setItem(NEW_KEY, payload);
      // Clean up legacy key
      localStorage.removeItem("corkCountCart");
    } catch (error) {
      // Attempt with a smaller list
      try {
        const pruned = cartItems.slice(-20);
        localStorage.setItem(NEW_KEY, JSON.stringify(minimizeCart(pruned)));
      } catch (e2) {
        console.warn("Skipping cart save due to storage limits:", e2);
      }
    }
  }, [cartItems]);

  // Filter and search logic
  const filteredWines = useMemo(() => {
    return wines.filter(wine => {
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
  }, [wines, searchQuery, filters]);

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
            <div className="font-script text-5xl sm:text-7xl text-wine-100 mb-4 font-semibold">
              KB Winery
            </div>
            <h1 className="font-playfair text-2xl sm:text-4xl font-bold mb-6">
              Sip Happens — Find Your Vintage
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-wine-100 max-w-3xl mx-auto">
              Curated collection of premium wines from KB Winery.
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
      <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
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
                  {filteredWines.length} of {wines.length} wines
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
              availableTypes={Array.from(new Set(wines.map(w => w.type)))}
            />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
            </div>
            <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-2">
              Loading wines...
            </h3>
            <p className="text-gray-600">
              Fetching our finest selection for you
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-2">
              Unable to load wines
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Button variant="accent" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* Wine Grid/List */}
        {!loading && !error && filteredWines.length > 0 && (
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
        )}

        {/* No Results State */}
        {!loading && !error && filteredWines.length === 0 && wines.length > 0 && (
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

        {/* Empty Inventory State */}
        {!loading && !error && wines.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-2">
              No wines available
            </h3>
            <p className="text-gray-600">
              Our wine inventory is currently empty. Please check back later.
            </p>
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
