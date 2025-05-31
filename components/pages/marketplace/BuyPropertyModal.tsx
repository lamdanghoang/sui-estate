"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  DollarSign,
  User,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Property } from "@/types/interface";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CustomBtn } from "@/components/wallet/ConnectButton";

interface BuyPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onConfirm: (property: Property) => void;
}

const BuyPropertyModal = ({
  isOpen,
  onClose,
  property,
  onConfirm,
}: BuyPropertyModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const currentAccount = useCurrentAccount();

  if (!property) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);

    // Simulate transaction processing
    setTimeout(() => {
      onConfirm(property);
      setIsConfirming(false);
      onClose();
    }, 2000);
  };

  const platformFee = property.price * 0.025;
  const totalCost = property.price + platformFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism border-gray-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-web3-purple" />
            <span>Purchase Property NFT</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Property Details */}
          <Card className="p-4 bg-gray-800/50 border-gray-600">
            <div className="space-y-3">
              {property.images && (
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}

              <div>
                <h3 className="font-semibold text-white text-lg">
                  {property.name}
                </h3>
                {property.description && (
                  <p className="text-gray-400 text-sm mt-1">
                    {property.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-mono">
                    {property.coordinates[1].toFixed(4)},{" "}
                    {property.coordinates[0].toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Current Owner:</span>
                  <span className="text-white font-mono text-xs">
                    {property.owner.slice(0, 6)}...{property.owner.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Transaction Summary */}
          <Card className="p-4 bg-blue-500/10 border-blue-500/20">
            <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Transaction Summary</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Property Price:</span>
                <span className="text-white">{property.price} SUI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee (2.5%):</span>
                <span className="text-white">{platformFee.toFixed(2)} SUI</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="text-white font-semibold">Total Cost:</span>
                <span className="text-green-400 font-semibold">
                  {totalCost.toFixed(2)} SUI
                </span>
              </div>
            </div>
          </Card>

          {/* Warning */}
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-400 font-medium mb-1">
                  Important Notice
                </p>
                <p className="text-gray-300">
                  This transaction is irreversible. Make sure you have
                  sufficient SUI balance and verify all details before
                  proceeding.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isConfirming}
              className="flex-1 border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            {currentAccount ? (
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex-1 bg-gradient-web3 hover:opacity-90 disabled:opacity-50"
              >
                {isConfirming
                  ? "Processing..."
                  : `Buy for ${totalCost.toFixed(2)} SUI`}
              </Button>
            ) : (
              <CustomBtn className="flex-1 w-full" />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyPropertyModal;
