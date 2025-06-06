"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import PropertyCard from "@/components/pages/properties/PropertyCard";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { NFTFieldProps, useGetNft } from "@/hooks/usePropertiesContract";
import { CustomBtn } from "@/components/wallet/ConnectButton";

const PropertiesPage = () => {
  const currentAccount = useCurrentAccount();
  const { get_all_nfts } = useGetNft();
  const [nfts, setNfts] = useState<NFTFieldProps[]>([]);

  useEffect(() => {
    if (!currentAccount) return;

    const fetchOwnedNFT = async () => {
      const userNfts = await get_all_nfts(currentAccount.address);
      setNfts(userNfts);
    };

    fetchOwnedNFT();
  }, [currentAccount?.address]);

  const handleViewOnMap = (property: NFTFieldProps) => {
    toast.info(`Viewing ${property.name} on map`);
    // In a real app, this would navigate to the map view with the property highlighted
  };

  const totalValue = nfts.reduce(
    (sum, property) => sum + property.listing_price,
    0
  );

  if (!currentAccount)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <div className="pt-20 px-4 pb-8">
          <div className="mt-20 flex flex-col items-center gap-10">
            <h1 className="font-bold">Connect your wallet first !</h1>
            <CustomBtn />
          </div>
        </div>
      </div>
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
                    {nfts.length}
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
                    {nfts.length > 0 ? Math.round(totalValue / nfts.length) : 0}{" "}
                    SUI
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Properties Grid */}
          {nfts.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Your Properties
                </h2>
                <Badge
                  variant="outline"
                  className="text-green-400 border-green-400"
                >
                  {nfts.length} Properties
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isOwned={property.owner === currentAccount.address}
                    isListed={property.is_listed}
                    onViewOnMap={handleViewOnMap}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center glassmorphism border-gray-700">
              <Home className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
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
