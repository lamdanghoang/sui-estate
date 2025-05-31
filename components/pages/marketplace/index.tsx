"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, Search, TrendingUp, DollarSign, Filter } from "lucide-react";
import { toast } from "sonner";
import PropertyCard from "@/components/pages/properties/PropertyCard";
import ListPropertyModal from "@/components/pages/marketplace/ListPropertyModal";
import BuyPropertyModal from "@/components/pages/marketplace/BuyPropertyModal";

interface Property {
  id: string;
  name: string;
  coordinates: [number, number];
  owner: string;
  price: number;
  image?: string;
  description?: string;
  isListed?: boolean;
}

const MarketplacePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // Mock listed properties for sale
  const [listedProperties] = useState<Property[]>([
    {
      id: "4",
      name: "Luxury Manhattan Condo",
      coordinates: [-73.9857, 40.7484],
      owner: "0xabcdef1234567890abcdef1234567890abcdef12",
      price: 450,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
      description:
        "Prime Manhattan location with stunning city views and modern amenities.",
      isListed: true,
    },
    {
      id: "5",
      name: "Brooklyn Heights Townhouse",
      coordinates: [-73.9941, 40.6962],
      owner: "0x9876543210fedcba9876543210fedcba98765432",
      price: 320,
      image:
        "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400",
      description:
        "Historic townhouse with original architecture and modern renovations.",
      isListed: true,
    },
    {
      id: "6",
      name: "SoHo Loft Space",
      coordinates: [-74.0023, 40.7233],
      owner: "0xfedcba0987654321fedcba0987654321fedcba09",
      price: 280,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
      description:
        "Spacious loft in trendy SoHo with high ceilings and artistic flair.",
      isListed: true,
    },
    {
      id: "7",
      name: "Central Park Penthouse",
      coordinates: [-73.9712, 40.7831],
      owner: "0x1111222233334444555566667777888899990000",
      price: 750,
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
      description:
        "Ultra-luxury penthouse with direct Central Park views and private terrace.",
      isListed: true,
    },
  ]);

  const handleViewOnMap = (property: Property) => {
    toast.info(`Viewing ${property.name} on map`);
  };

  const handleBuyProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsBuyModalOpen(true);
  };

  const handleListProperty = () => {
    setIsListModalOpen(true);
  };

  const handleConfirmPurchase = (property: Property) => {
    toast.success(`Successfully purchased ${property.name}!`);
    setIsBuyModalOpen(false);
  };

  const handleConfirmListing = (listingData: {
    propertyId: string;
    price: number;
  }) => {
    console.log(listingData);
    toast.success("Property listed successfully!");
    setIsListModalOpen(false);
  };

  const filteredProperties = listedProperties
    .filter(
      (property) =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const totalVolume = listedProperties.reduce(
    (sum, property) => sum + property.price,
    0
  );
  const averagePrice = Math.round(totalVolume / listedProperties.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      <div className="pt-20 px-4 pb-8">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Store className="w-8 h-8 text-web3-purple" />
                <h1 className="text-3xl font-bold text-white">Marketplace</h1>
              </div>
              <p className="text-gray-400">
                Buy and sell tokenized real estate properties on the Sui
                blockchain.
              </p>
            </div>
            <Button
              onClick={handleListProperty}
              className="bg-gradient-web3 hover:opacity-90"
            >
              List Property
            </Button>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 glassmorphism border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-web3-purple/20 rounded-lg">
                  <Store className="w-6 h-6 text-web3-purple" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Properties Listed</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {listedProperties.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 glassmorphism border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {totalVolume} SUI
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 glassmorphism border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Average Price</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {averagePrice} SUI
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="p-6 glassmorphism border-gray-700 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-gray-700"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Properties Grid */}
          {filteredProperties.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-200">
                  Available Properties
                </h2>
                <Badge
                  variant="outline"
                  className="text-green-400 border-green-400"
                >
                  {filteredProperties.length} Properties
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isOwned={false}
                    onViewOnMap={handleViewOnMap}
                    onBuy={handleBuyProperty}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center glassmorphism border-gray-700">
              <Store className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search criteria or check back later for new
                listings.
              </p>
            </Card>
          )}
        </div>
      </div>

      <ListPropertyModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onConfirm={handleConfirmListing}
      />

      <BuyPropertyModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        property={selectedProperty}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};

export default MarketplacePage;
