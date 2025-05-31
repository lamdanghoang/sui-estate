"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, User } from "lucide-react";
import { Property } from "@/types/interface";

interface PopupProps {
  property: Property | null;
  onSelectProperty: (value: Property | null) => void;
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

      {property.image && (
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">Owner:</span>
          <span className=" font-mono text-xs">
            {property.owner.slice(0, 6)}...
            {property.owner.slice(-4)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-gray-300">Price:</span>
          <Badge variant="outline" className="text-green-400 border-green-400">
            {property.price} SUI
          </Badge>
        </div>
        {property.isListed && (
          <Badge className="bg-green-500/20 text-green-400 border-green-400">
            Listed for Sale
          </Badge>
        )}
      </div>

      <div className="flex space-x-2">
        {property.isListed ? (
          <Button size="sm" className="flex-1 bg-gradient-web3">
            Buy Property
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-600"
          >
            Not Listed
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PropertyPopup;
