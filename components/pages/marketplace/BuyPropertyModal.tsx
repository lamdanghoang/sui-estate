"use client";
import React, { useEffect } from "react";
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
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CustomBtn } from "@/components/wallet/ConnectButton";
import { NFTFieldProps, usePurchaseNFT } from "@/hooks/usePropertiesContract";
import { toast } from "sonner";
import { formatDigest } from "@mysten/sui/utils";

interface BuyPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: NFTFieldProps | null;
}

const BuyPropertyModal = ({
  isOpen,
  onClose,
  property,
}: BuyPropertyModalProps) => {
  const currentAccount = useCurrentAccount();
  const { sign_to_purchase, digest, isLoading, error } = usePurchaseNFT();

  // Effect to observe the digest value from the hook and update UI accordingly
  useEffect(() => {
    if (digest) {
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

      onClose();
    }
  }, [digest]);

  // Effect to observe errors from the hook
  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to purchase NFT"
      );
    }
  }, [error]);

  if (!property) return;

  const platformFee = property.listing_price * 0.025;
  const totalCost = property.listing_price + platformFee;

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
              {property.image_url && (
                <img
                  src={property.image_url}
                  alt={property.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}

              <div>
                <h3 className="font-semibold text-white text-lg">
                  {property.name}
                </h3>
                {property.property_info.description && (
                  <p className="text-gray-400 text-sm mt-1">
                    {property.property_info.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-mono">
                    {property.property_info.coordinates[1].toFixed(4)},{" "}
                    {property.property_info.coordinates[0].toFixed(4)}
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
                <span className="text-white">{property.listing_price} SUI</span>
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
              disabled={isLoading}
              className="flex-1 border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            {currentAccount ? (
              <Button
                onClick={() =>
                  sign_to_purchase(property.id, property.listing_price)
                }
                disabled={isLoading}
                className="flex-1 bg-gradient-web3 hover:opacity-90 disabled:opacity-50"
              >
                {isLoading
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
