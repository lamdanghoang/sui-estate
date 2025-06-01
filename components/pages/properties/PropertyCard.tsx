import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Eye, ShoppingCart } from "lucide-react";
import {
  NFTFieldProps,
  usePurchaseNFT,
  useUnlistNFT,
} from "@/hooks/usePropertiesContract";
import ListPropertyModal from "../marketplace/ListPropertyModal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDigest } from "@mysten/sui/utils";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CustomBtn } from "@/components/wallet/ConnectButton";
import BuyPropertyModal from "../marketplace/BuyPropertyModal";

interface PropertyCardProps {
  property: NFTFieldProps;
  isOwned?: boolean;
  isListed?: boolean;
  onViewOnMap: (property: NFTFieldProps) => void;
  onList?: (property: NFTFieldProps) => void;
  onUnlist?: (property: NFTFieldProps) => void;
}

const PropertyCard = ({
  property,
  isOwned,
  isListed,
  onViewOnMap,
}: PropertyCardProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const { sign_to_unlist, digest, error, isLoading } = useUnlistNFT();
  const {
    sign_to_purchase,
    digest: buyDigest,
    error: buyError,
    isLoading: buyLoading,
  } = usePurchaseNFT();
  const currentAccount = useCurrentAccount();

  // Effect to observe the digest value from the hook and update UI accordingly
  useEffect(() => {
    if (digest) {
      toast("Property NFT listed successfully!", {
        description: `Txn: ${formatDigest(digest)}`,
        action: {
          label: "View",
          onClick: () =>
            window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
        },
        style: {
          backgroundColor: "#0986f5",
        },
      });
    }
  }, [digest]);

  // Effect to observe errors from the hook
  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to list property NFT"
      );
    }
  }, [error]);

  // Effect to observe the digest value from the hook and update UI accordingly
  useEffect(() => {
    if (buyDigest) {
      toast("Property NFT purchased successfully!", {
        description: `Txn: ${formatDigest(digest)}`,
        action: {
          label: "View",
          onClick: () =>
            window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
        },
        style: {
          backgroundColor: "#0986f5",
        },
      });
    }
  }, [buyDigest]);

  // Effect to observe errors from the hook
  useEffect(() => {
    if (buyError) {
      toast.error(
        buyError instanceof Error
          ? buyError.message
          : "Failed to list property NFT"
      );
    }
  }, [buyError]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="flex flex-col h-full py-0 gap-0 overflow-hidden glassmorphism border-gray-700 hover:border-web3-purple transition-all duration-300 hover:shadow-lg hover:shadow-web3-purple/20 animate-fade-in">
      {/* Property Image */}
      <div className="aspect-video relative overflow-hidden">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-web3 flex items-center justify-center">
            <MapPin className="w-12 h-12  opacity-60" />
          </div>
        )}
        {isOwned && (
          <Badge className="absolute top-3 right-3 bg-green-500/90 ">
            Owned
          </Badge>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold  text-lg mb-1">{property.name}</h3>
          {property.property_info.description && (
            <p className="text-gray-400 text-sm line-clamp-2">
              {property.property_info.description}
            </p>
          )}
        </div>

        {/* Coordinates */}
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 font-mono">
            {property.property_info.coordinates[1].toFixed(4)},{" "}
            {property.property_info.coordinates[0].toFixed(4)}
          </span>
        </div>

        {/* Owner & Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Owner:</span>
            <span className=" font-mono">{formatAddress(property.owner)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold">
                {property.listing_price} SUI
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewOnMap(property)}
            className="flex-1 border-gray-600 text-gray-100 bg-web3-blue hover:border-web3-purple"
          >
            <Eye className="w-4 h-4 mr-1" />
            View on Map
          </Button>

          {currentAccount ? (
            isOwned ? (
              isListed ? (
                <Button
                  size="sm"
                  onClick={() => sign_to_unlist(property.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? "Unlisting..." : "Unlist"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPropertyId(property.id);
                    setIsListModalOpen(true);
                  }}
                  className="flex-1 bg-gradient-web3 hover:opacity-90"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  List
                </Button>
              )
            ) : (
              isListed && (
                <Button
                  size="sm"
                  onClick={() => {
                    sign_to_purchase(property.id, property.listing_price);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  {buyLoading ? "Buying..." : "Buy"}
                </Button>
              )
            )
          ) : (
            <CustomBtn className="flex-1" />
          )}
        </div>
      </div>
      <BuyPropertyModal
        property={property}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
      <ListPropertyModal
        id={selectedPropertyId}
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
      />
    </Card>
  );
};

export default PropertyCard;
