import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Home, Search, Wine } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-smoke">
      <Navigation userRole="customer" />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="w-32 h-32 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Wine className="w-16 h-16 text-wine" />
          </div>

          {/* Error Message */}
          <h1 className="font-playfair text-6xl font-bold text-wine mb-4">
            404
          </h1>
          <h2 className="font-playfair text-3xl font-semibold text-gray-900 mb-4">
            Wine Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            The page you're looking for seems to have vanished like a fine vintage. 
            Let's get you back to our wine collection.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="accent" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Wine Collection
              </Button>
            </Link>
            <Button variant="navigation" className="gap-2">
              <Search className="w-4 h-4" />
              Search Wines
            </Button>
          </div>

          {/* Popular Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Or explore these popular sections:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/" className="text-wine hover:text-wine/80 transition-colors">
                Browse All Wines
              </Link>
              <Link to="/collections" className="text-wine hover:text-wine/80 transition-colors">
                Wine Collections
              </Link>
              <Link to="/about" className="text-wine hover:text-wine/80 transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-wine hover:text-wine/80 transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
