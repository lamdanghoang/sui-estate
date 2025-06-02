"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, SquareArrowOutUpRight, User } from "lucide-react";
import { NFTFieldProps } from "@/hooks/usePropertiesContract";
import Link from "next/link";

interface PopupProps {
  property: NFTFieldProps;
  onSelectProperty: (value: NFTFieldProps | null) => void;
}

const PropertyPopup = ({ property, onSelectProperty }: PopupProps) => {
  if (!property) return;

  return (
    <Card className="absolute top-20 right-6 p-4 glassmorphism max-w-sm animate-scale-in gap-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold ">{property.name}</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onSelectProperty(null)}
          className="text-gray-400"
        >
          ×
        </Button>
      </div>

      {property.image_url && (
        <img
          src={property.image_url}
          alt={property.name}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Owner:</span>
            <span className=" font-mono text-xs">
              {property.owner.slice(0, 6)}...
              {property.owner.slice(-4)}
            </span>
          </div>
          <Link
            href={`https://suiscan.xyz/testnet/object/${property.id}`}
            target="_blank"
            className="cursor-pointer"
          >
            <SquareArrowOutUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-gray-400">Price:</span>
          <Badge variant="outline" className="text-green-400 border-green-400">
            {property.listing_price} SUI
          </Badge>
        </div>
        {property.is_listed && (
          <Badge className="bg-green-500/20 text-green-400 border-green-400">
            Listed for Sale
          </Badge>
        )}
      </div>

      <div className="flex space-x-2">
        {property.is_listed ? (
          <Button size="sm" className="flex-1 bg-gradient-web3">
            Buy Property
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-600 bg-gradient-web3 text-gray-100"
          >
            Not Listed
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PropertyPopup;
