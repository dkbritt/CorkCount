import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
  variant?: "storefront" | "admin";
}

export function SearchBar({ 
  placeholder = "Search by wine name or type", 
  onSearch, 
  onClear,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleClear = () => {
    setQuery("");
    onClear?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Real-time search as user types
    onSearch?.(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="wine-label-search relative flex items-center transition-all duration-300">
        {/* Search Icon */}
        <div className="absolute left-4 flex items-center pointer-events-none z-10">
          <Search className="h-5 w-5 text-amber-700" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-4 bg-transparent wine-label-text wine-label-placeholder focus:outline-none font-cormorant text-lg font-medium z-10 relative"
        />

        {/* Clear & Search Buttons */}
        <div className="absolute right-3 flex items-center gap-2 z-10">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-9 w-9 p-0 hover:bg-amber-100 rounded-md transition-colors"
            >
              <X className="h-4 w-4 text-amber-700" />
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            className="h-9 px-4 text-sm font-cormorant font-medium bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-0 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
            disabled={!query.trim()}
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
