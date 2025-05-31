"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import PropertyCard from "@/components/pages/properties/PropertyCard";
import { Property } from "@/types/interface";

const PropertiesPage = () => {
  const [walletAddress] = useState(
    "0x1234567890abcdef1234567890abcdef12345678"
  );

  // Mock user properties
  const [userProperties] = useState<Property[]>([
    {
      id: "1",
      name: "Downtown Penthouse",
      coordinates: [-74.006, 40.7128],
      owner: walletAddress,
      price: 250,
      images: [
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400",
      ],
      area: 0,
      description:
        "Luxury penthouse in the heart of downtown with stunning city views.",
    },
    {
      id: "2",
      name: "Waterfront Villa",
      coordinates: [-74.015, 40.708],
      owner: walletAddress,
      price: 180,
      images: [
        "https://images.unsplash.com/photo-1551038247-3d9af20df552?w=400",
      ],
      area: 0,
      description:
        "Beautiful waterfront property with private dock and panoramic views.",
    },
    {
      id: "3",
      name: "Modern Office Complex",
      coordinates: [-74.012, 40.71],
      owner: walletAddress,
      price: 320,
      images: [
        "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=400",
      ],
      area: 0,
      description:
        "State-of-the-art office building in prime business district.",
    },
  ]);

  const handleViewOnMap = (property: Property) => {
    toast.info(`Viewing ${property.name} on map`);
    // In a real app, this would navigate to the map view with the property highlighted
  };

  const handleSellProperty = (property: Property) => {
    toast.info(`Initiating sale for ${property.name}`);
    // In a real app, this would open a sell modal or navigate to sell page
  };

  const totalValue = userProperties.reduce(
    (sum, property) => sum + property.price,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      <div className="pt-20 px-4 pb-8">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Home className="w-8 h-8 text-web3-purple" />
              <h1 className="text-3xl font-bold text-white">My Properties</h1>
            </div>
            <p className="text-gray-400">
              Manage your tokenized real estate portfolio on the Sui blockchain.
            </p>
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 glassmorphism border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-web3-purple/20 rounded-lg">
                  <Home className="w-6 h-6 text-web3-purple" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {userProperties.length}
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
                  <p className="text-gray-400 text-sm">Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {totalValue} SUI
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
                  <p className="text-gray-400 text-sm">Avg. Property Value</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {userProperties.length > 0
                      ? Math.round(totalValue / userProperties.length)
                      : 0}{" "}
                    SUI
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Properties Grid */}
          {userProperties.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Your Properties
                </h2>
                <Badge
                  variant="outline"
                  className="text-green-400 border-green-400"
                >
                  {userProperties.length} Properties
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isOwned={true}
                    onViewOnMap={handleViewOnMap}
                    onSell={handleSellProperty}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center glassmorphism border-gray-700">
              <Home className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Properties Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start building your real estate portfolio by minting your first
                property NFT.
              </p>
              <Badge
                variant="outline"
                className="text-web3-purple border-web3-purple"
              >
                Go to Explore to mint properties
              </Badge>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
