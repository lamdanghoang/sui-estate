"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DollarSign, Tag } from "lucide-react";
import { Property } from "@/types/interface";

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (listingData: { propertyId: string; price: number }) => void;
}

const ListPropertyModal = ({
  isOpen,
  onClose,
  onConfirm,
}: ListPropertyModalProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [listingPrice, setListingPrice] = useState("");

  // Mock user properties (in a real app, this would come from props or context)
  const userProperties: Property[] = [
    {
      id: "1",
      name: "Downtown Penthouse",
      coordinates: [-74.006, 40.7128],
      owner: "0x1234567890abcdef1234567890abcdef12345678",
      price: 250,
      images: [
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400",
      ],
      description:
        "Luxury penthouse in the heart of downtown with stunning city views.",
    },
    {
      id: "2",
      name: "Waterfront Villa",
      coordinates: [-74.015, 40.708],
      owner: "0x1234567890abcdef1234567890abcdef12345678",
      price: 180,
      images: [
        "https://images.unsplash.com/photo-1551038247-3d9af20df552?w=400",
      ],
      description:
        "Beautiful waterfront property with private dock and panoramic views.",
    },
  ];

  const handleConfirm = () => {
    if (!selectedPropertyId || !listingPrice) return;

    onConfirm({
      propertyId: selectedPropertyId,
      price: parseFloat(listingPrice),
    });

    // Reset form
    setSelectedPropertyId("");
    setListingPrice("");
  };

  const selectedProperty = userProperties.find(
    (p) => p.id === selectedPropertyId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-web3-purple" />
            <span>List Property for Sale</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Property Selection */}
          <div className="space-y-2">
            <Label htmlFor="property" className="text-gray-300">
              Select Property
            </Label>
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Choose a property to list" />
              </SelectTrigger>
              <SelectContent>
                {userProperties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Preview */}
          {selectedProperty && (
            <Card className="p-4 bg-gray-800/50 border-gray-600">
              <div className="flex space-x-3">
                {selectedProperty.images && (
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    {selectedProperty.name}
                  </h4>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {selectedProperty.description}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {selectedProperty.coordinates[1].toFixed(4)},{" "}
                    {selectedProperty.coordinates[0].toFixed(4)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Listing Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-gray-300">
              Listing Price (SUI)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="price"
                type="number"
                placeholder="Enter listing price"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Transaction Info */}
          {listingPrice && (
            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Listing Price:</span>
                  <span className="text-white font-semibold">
                    {listingPrice} SUI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Fee (2.5%):</span>
                  <span className="text-white">
                    {(parseFloat(listingPrice) * 0.025).toFixed(2)} SUI
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-600 pt-2">
                  <span className="text-gray-400">You&apos;ll Receive:</span>
                  <span className="text-green-400 font-semibold">
                    {(parseFloat(listingPrice) * 0.975).toFixed(2)} SUI
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedPropertyId || !listingPrice}
              className="flex-1 bg-gradient-web3 hover:opacity-90 disabled:opacity-50"
            >
              List Property
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListPropertyModal;
