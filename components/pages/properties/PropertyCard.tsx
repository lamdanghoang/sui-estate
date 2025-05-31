import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Eye, ShoppingCart } from "lucide-react";
import { Property } from "@/types/interface";

interface PropertyCardProps {
  property: Property;
  isOwned?: boolean;
  onViewOnMap: (property: Property) => void;
  onBuy?: (property: Property) => void;
  onSell?: (property: Property) => void;
}

const PropertyCard = ({
  property,
  isOwned,
  onViewOnMap,
  onBuy,
  onSell,
}: PropertyCardProps) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="flex flex-col h-full py-0 gap-0 overflow-hidden glassmorphism border-gray-700 hover:border-web3-purple transition-all duration-300 hover:shadow-lg hover:shadow-web3-purple/20 animate-fade-in">
      {/* Property Image */}
      <div className="aspect-video relative overflow-hidden">
        {property.image ? (
          <img
            src={property.image}
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
          {property.description && (
            <p className="text-gray-400 text-sm line-clamp-2">
              {property.description}
            </p>
          )}
        </div>

        {/* Coordinates */}
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 font-mono">
            {property.coordinates[1].toFixed(4)},{" "}
            {property.coordinates[0].toFixed(4)}
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
                {property.price} SUI
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

          {isOwned
            ? onSell && (
                <Button
                  size="sm"
                  onClick={() => onSell(property)}
                  className="flex-1 bg-red-600 hover:bg-red-700 "
                >
                  Sell
                </Button>
              )
            : onBuy && (
                <Button
                  size="sm"
                  onClick={() => onBuy(property)}
                  className="flex-1 bg-gradient-web3 hover:opacity-90"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Buy
                </Button>
              )}
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;
