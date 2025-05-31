"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search } from "lucide-react";
import { toast } from "sonner";

interface SearchBarProps {
  onLocationSearch: (location: string) => void;
  onCurrentLocation: () => void;
}

const SearchBar = ({ onLocationSearch, onCurrentLocation }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setIsSearching(true);
    try {
      await onLocationSearch(searchInput.trim());
    } catch (error) {
      console.log(error);
      toast.error("Location not found. Please try a different search term.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    onCurrentLocation();
  };

  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-3">
      <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 p-2">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Enter city, district, or GPS coordinates..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-80 border-none bg-transparent focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching}
            className="rounded-full bg-web3-purple hover:opacity-90 text-white px-4 py-2 h-10"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-1" />
                Find
              </>
            )}
          </Button>
        </form>
      </div>

      <Button
        onClick={handleCurrentLocation}
        className="rounded-full bg-white/95 hover:bg-white border border-gray-200 shadow-lg w-12 h-12 p-0"
        variant="outline"
      >
        <Navigation className="w-5 h-5 text-blue-600" />
      </Button>
    </div>
  );
};

export default SearchBar;
