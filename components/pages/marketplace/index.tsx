"use client";
import { useEffect, useState } from "react";
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
// import BuyPropertyModal from "@/components/pages/marketplace/BuyPropertyModal";
// import { Property } from "@/types/interface";
import { getPropertyNFTs } from "@/helpers/api";
import { NFTFieldProps, useGetNft } from "@/hooks/usePropertiesContract";
import { useCurrentAccount } from "@mysten/dapp-kit";

const MarketplacePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  // const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  // const [selectedProperty, setSelectedProperty] = useState<Property | null>(
  //   null
  // );
  const [listedProperties, setListedProperties] = useState<NFTFieldProps[]>([]);
  const { get_nft_fields } = useGetNft();
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const properties = await getPropertyNFTs({ is_listed: true });
        const listedNFTs = await Promise.all(
          properties.data.map(async (nft: { object_id: string }) => {
            const nftFields = await get_nft_fields(nft.object_id);
            return nftFields;
          })
        );
        setListedProperties(
          listedNFTs.filter((nft): nft is NFTFieldProps => nft !== null)
        );
      } catch (error) {
        console.error("Error fetching property nfts:", error);
      }
    };
    fetchProperties();
  }, []);

  const handleViewOnMap = (property: NFTFieldProps) => {
    toast.info(`Viewing ${property.name} on map`);
  };

  const handleListProperty = () => {
    setIsListModalOpen(true);
  };

  // const handleConfirmPurchase = (property: Property) => {
  //   toast.success(`Successfully purchased ${property.name}!`);
  //   setIsBuyModalOpen(false);
  // };

  const filteredProperties = listedProperties
    .filter(
      (property) =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.property_info.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.listing_price - b.listing_price;
        case "price-high":
          return b.listing_price - a.listing_price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const totalVolume = listedProperties.reduce(
    (sum, property) => sum + property.listing_price,
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
                    {averagePrice || 0} SUI
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
                  className="pl-10 bg-white border-gray-600 text-gray-700"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-white border-gray-600 text-gray-700">
                    <Filter className="w-4 h-4 text-gray-400" />
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
                    isOwned={property.owner === currentAccount?.address}
                    isListed={property.is_listed}
                    onViewOnMap={handleViewOnMap}
                    // onBuy={handleBuyProperty}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center glassmorphism border-gray-700">
              <Store className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
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
      />

      {/* <BuyPropertyModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        property={selectedProperty}
        onConfirm={handleConfirmPurchase}
      /> */}
    </div>
  );
};

export default MarketplacePage;
