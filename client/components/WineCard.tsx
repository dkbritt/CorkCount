import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

export interface Wine {
  id: string;
  name: string;
  winery: string;
  vintage: number;
  region: string;
  type: string;
  price: number;
  inStock: number;
  rating: number;
  description: string;
  flavorNotes: string[];
  image?: string;
}

interface WineCardProps {
  wine: Wine;
  onAddToCart?: (wine: Wine, quantity: number) => void;
  onViewDetails?: (wine: Wine) => void;
  variant?: "storefront" | "admin";
  layout?: "grid" | "list";
}

export function WineCard({ wine, onAddToCart, onViewDetails, variant = "storefront", layout = "grid" }: WineCardProps) {
  const [quantity, setQuantity] = useState(1);
  const isAvailable = wine.inStock > 0;
  const isLowStock = wine.inStock > 0 && wine.inStock <= 5;

  const incrementQuantity = () => {
    if (quantity < wine.inStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart?.(wine, quantity);
    setQuantity(1); // Reset quantity after adding to cart
  };

  const getWineTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'red wine':
        return 'bg-wine text-white';
      case 'white wine':
        return 'bg-yellow-500 text-white';
      case 'rosé':
        return 'bg-pink-500 text-white';
      case 'sparkling':
        return 'bg-federal text-white';
      case 'dessert wine':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (layout === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group w-full max-w-full">
        <div className="flex gap-4 p-4">
          {/* Wine Image */}
          <div className="flex-shrink-0 w-24 h-32 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg relative overflow-hidden">
            {wine.image ? (
              <img
                src={wine.image}
                alt={wine.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-10 bg-wine/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-wine" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 2v6h.01L6 8.01 10 12l-4 4-.01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Wine Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-2">
              {/* Name and Vintage */}
              <div>
                <h3 className="font-playfair font-semibold text-lg text-gray-900 line-clamp-1">
                  {wine.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {wine.winery} • {wine.vintage}
                </p>
              </div>

              {/* Region & Wine Type */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{wine.region}</span>
                <span>•</span>
                <Badge className={`text-xs px-2 py-1 rounded-full ${getWineTypeColor(wine.type)}`}>
                  {wine.type}
                </Badge>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {!isAvailable && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Sold Out
                  </Badge>
                )}
                {isLowStock && isAvailable && (
                  <Badge className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Bottom Section with Price and Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-xl font-bold text-wine">
                ${wine.price.toFixed(2)}
              </div>

              {variant === "storefront" && (
                <div className="flex items-center gap-2">
                  {/* Quantity Selector - Compact for list view */}
                  {isAvailable && (
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="h-6 w-6 p-0 rounded-l-lg rounded-r-none"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-2 text-xs font-medium min-w-[30px] text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={incrementQuantity}
                        disabled={quantity >= wine.inStock}
                        className="h-6 w-6 p-0 rounded-r-lg rounded-l-none"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <Button
                    variant="navigation"
                    size="sm"
                    onClick={() => onViewDetails?.(wine)}
                    className="px-3 py-1 text-xs"
                  >
                    Details
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    disabled={!isAvailable}
                    onClick={handleAddToCart}
                    className="px-3 py-1 text-xs"
                  >
                    {isAvailable ? "Add" : "Unavailable"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group w-full max-w-full">
      {/* Wine Image */}
      <div className="aspect-[3/4] bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden">
        {wine.image ? (
          <img
            src={wine.image}
            alt={wine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-20 bg-wine/20 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-wine" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2v6h.01L6 8.01 10 12l-4 4-.01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {!isAvailable && (
            <Badge className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
              Sold Out
            </Badge>
          )}
          {isLowStock && isAvailable && (
            <Badge className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
              Low Stock
            </Badge>
          )}
        </div>

      </div>

      {/* Wine Details */}
      <div className="p-4 space-y-3">
        {/* Wine Name & Vintage */}
        <div>
          <h3 className="font-playfair font-semibold text-lg text-gray-900 line-clamp-1">
            {wine.name}
          </h3>
          <p className="text-sm text-gray-600">
            {wine.winery} • {wine.vintage}
          </p>
        </div>

        {/* Region & Wine Type Badge */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{wine.region}</span>
          <span>•</span>
          <Badge className={`text-xs px-3 py-1 rounded-full ${getWineTypeColor(wine.type)}`}>
            {wine.type}
          </Badge>
        </div>

        {/* Flavor Notes */}
        {variant === "storefront" && wine.flavorNotes && wine.flavorNotes.length > 0 && (
          <div className="text-sm">
            <p className="text-gray-600 font-medium mb-1">Flavor Notes:</p>
            <div className="flex flex-wrap gap-1">
              {wine.flavorNotes.slice(0, 3).map((note, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                  {note}
                </Badge>
              ))}
              {wine.flavorNotes.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                  +{wine.flavorNotes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Admin-specific info */}
        {variant === "admin" && (
          <div className="text-sm text-gray-600">
            <p>Stock: {wine.inStock} bottles</p>
            <p>SKU: {wine.id}</p>
          </div>
        )}

        {/* Price */}
        <div className="text-xl font-bold text-wine">
          ${wine.price.toFixed(2)}
        </div>

        {/* Actions */}
        {variant === "storefront" ? (
          <div className="space-y-3">
            {/* Quantity Selector */}
            {isAvailable && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Qty:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0 rounded-l-lg rounded-r-none"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= wine.inStock}
                    className="h-8 w-8 p-0 rounded-r-lg rounded-l-none"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-xs text-gray-500">
                  {wine.inStock} available
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="navigation"
                size="sm"
                onClick={() => onViewDetails?.(wine)}
                className="flex-1"
              >
                Details
              </Button>
              <Button
                variant="accent"
                size="sm"
                disabled={!isAvailable}
                onClick={handleAddToCart}
                className="flex-1"
              >
                {isAvailable ? "Add to Cart" : "Unavailable"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="navigation"
              size="sm"
              onClick={() => onViewDetails?.(wine)}
            >
              Edit
            </Button>
            <Button
              variant="wine"
              size="sm"
            >
              Manage
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
