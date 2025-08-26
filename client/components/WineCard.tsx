import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  onAddToCart?: (wine: Wine) => void;
  onViewDetails?: (wine: Wine) => void;
  variant?: "storefront" | "admin";
}

export function WineCard({ wine, onAddToCart, onViewDetails, variant = "storefront" }: WineCardProps) {
  const isAvailable = wine.inStock > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group">
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
        {!isAvailable && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
            Out of Stock
          </Badge>
        )}
        
        {/* Rating Badge */}
        {wine.rating > 0 && (
          <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700">
            ⭐ {wine.rating}
          </Badge>
        )}
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

        {/* Region & Type */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{wine.region}</span>
          <span>•</span>
          <Badge variant="secondary" className="text-xs">
            {wine.type}
          </Badge>
        </div>

        {/* Description */}
        {variant === "storefront" && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {wine.description}
          </p>
        )}

        {/* Admin-specific info */}
        {variant === "admin" && (
          <div className="text-sm text-gray-600">
            <p>Stock: {wine.inStock} bottles</p>
            <p>SKU: {wine.id}</p>
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xl font-bold text-wine">
            ${wine.price.toFixed(2)}
          </div>
          
          <div className="flex gap-2">
            {variant === "storefront" ? (
              <>
                <Button 
                  variant="navigation" 
                  size="sm"
                  onClick={() => onViewDetails?.(wine)}
                >
                  Details
                </Button>
                <Button 
                  variant="accent" 
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => onAddToCart?.(wine)}
                >
                  {isAvailable ? "Add to Cart" : "Unavailable"}
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
