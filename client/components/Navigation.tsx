import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wine, 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X,
  Settings,
  BarChart3
} from "lucide-react";

interface NavigationProps {
  cartItemCount?: number;
  userRole?: "customer" | "admin";
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
  onOpenAdminLogin?: () => void;
}

export function Navigation({
  cartItemCount = 0,
  userRole = "customer",
  onOpenCart,
  onOpenSearch,
  onOpenAdminLogin
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-wine rounded-lg flex items-center justify-center">
              <Wine className="h-5 w-5 text-white" />
            </div>
            <span className="font-playfair font-bold text-xl text-wine">
              CorkCount
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {userRole === "customer" ? (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/") ? "text-wine" : "text-gray-600 hover:text-wine"
                  }`}
                >
                  Browse Wines
                </Link>
                <Link 
                  to="/collections" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/collections") ? "text-wine" : "text-gray-600 hover:text-wine"
                  }`}
                >
                  Collections
                </Link>
                <Link 
                  to="/about" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/about") ? "text-wine" : "text-gray-600 hover:text-wine"
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/contact") ? "text-wine" : "text-gray-600 hover:text-wine"
                  }`}
                >
                  Contact
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/admin" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/admin") ? "text-wine" : "text-gray-600 hover:text-wine"
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/inventory" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/admin/inventory") ? "text-wine" : "text-gray-600 hover:text-wine"
                  }`}
                >
                  Inventory
                </Link>
                <Link 
                  to="/admin/orders" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/admin/orders") ? "text-wine" : "text-gray-600 hover:text-wine"
                  }`}
                >
                  Orders
                </Link>
                <Link 
                  to="/admin/analytics" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/admin/analytics") ? "text-wine" : "text-gray-600 hover:text-wine"
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Admin Login Button */}
            {userRole === "customer" && (
              <Button
                variant="navigation"
                size="sm"
                className="hidden sm:flex"
                onClick={() => window.location.href = '/admin'}
              >
                Admin Login
              </Button>
            )}

            {/* Search */}
            <Button
              variant="navigation"
              size="icon"
              onClick={onOpenSearch}
              className="hidden sm:flex"
            >
              <Search className="h-4 w-4" />
            </Button>

            {userRole === "customer" ? (
              <>
                {/* Shopping Cart */}
                <Button
                  variant="navigation"
                  size="icon"
                  onClick={onOpenCart}
                  className="relative"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-wine text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </Badge>
                  )}
                </Button>

                {/* User Account */}
                <Button variant="navigation" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                {/* Admin Settings */}
                <Button variant="navigation" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>

                {/* Analytics Quick View */}
                <Button variant="navigation" size="icon">
                  <BarChart3 className="h-4 w-4" />
                </Button>

                {/* Admin Profile */}
                <Button variant="navigation" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="navigation"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            {/* Admin Login - Mobile */}
            {userRole === "customer" && (
              <Button
                variant="navigation"
                onClick={() => window.location.href = '/admin'}
                className="w-full justify-start gap-2"
              >
                <User className="h-4 w-4" />
                Admin Login
              </Button>
            )}

            {/* Mobile Search */}
            <Button
              variant="navigation"
              onClick={onOpenSearch}
              className="w-full justify-start gap-2"
            >
              <Search className="h-4 w-4" />
              Search Wines
            </Button>

            {userRole === "customer" ? (
              <>
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/") ? "bg-wine/10 text-wine" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Browse Wines
                </Link>
                <Link 
                  to="/collections" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/collections") ? "bg-wine/10 text-wine" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Collections
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/about") ? "bg-wine/10 text-wine" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/contact") ? "bg-wine/10 text-wine" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Contact
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/admin") ? "bg-wine/10 text-wine" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/inventory" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/admin/inventory") ? "bg-wine/10 text-wine" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Inventory
                </Link>
                <Link 
                  to="/admin/orders" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/admin/orders") ? "bg-wine/10 text-wine" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Orders
                </Link>
                <Link 
                  to="/admin/analytics" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/admin/analytics") ? "bg-wine/10 text-wine" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
