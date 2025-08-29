import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({ 
  placeholder = "Search wines or by type", 
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
      <div className={`
        relative flex items-center bg-white rounded-lg border transition-all duration-200
        ${isFocused ? 'border-federal shadow-md ring-2 ring-federal/20' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
      `}>
        {/* Search Icon */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 rounded-lg bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none font-inter"
        />

        {/* Clear & Search Buttons */}
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
          
          <Button
            type="submit"
            variant="accent"
            size="sm"
            className="h-8 px-3 text-xs"
            disabled={!query.trim()}
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
