"use client";
import React, { useEffect, useState } from "react";
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
import { Tag, User } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CustomBtn } from "@/components/wallet/ConnectButton";
import {
  NFTFieldProps,
  useGetNft,
  useTransferNFT,
} from "@/hooks/usePropertiesContract";
import { toast } from "sonner";
import { formatDigest } from "@mysten/sui/utils";

interface TransferPropertyModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

const TransferPropertyModal = ({
  isOpen,
  onClose,
  id,
}: TransferPropertyModalProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(id);
  const [recipient, setRecipient] = useState("");
  const [nfts, setNfts] = useState<NFTFieldProps[]>([]);
  const currentAccount = useCurrentAccount();
  const { sign_to_transfer, digest, error, isLoading } = useTransferNFT();
  const { get_all_nfts } = useGetNft();

  // Effect to update selectedPropertyId when id prop changes
  useEffect(() => {
    if (id) {
      setSelectedPropertyId(id);
    }
  }, [id]);

  useEffect(() => {
    if (!currentAccount) return;

    const fetchOwnedNFT = async () => {
      const userNfts = await get_all_nfts(currentAccount.address);
      setNfts(userNfts);
    };

    fetchOwnedNFT();
  }, [currentAccount?.address]);

  // Effect to observe the digest value from the hook and update UI accordingly
  useEffect(() => {
    if (digest) {
      toast("NFT transfered successfully!", {
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

      // Reset form
      setSelectedPropertyId("");
      setRecipient("");
    }
  }, [digest]);

  // Effect to observe errors from the hook
  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to transfer NFT"
      );
    }
  }, [error]);

  const handleConfirm = async () => {
    if (!selectedPropertyId || !recipient) return;

    console.log(selectedPropertyId, recipient);

    await sign_to_transfer(selectedPropertyId, recipient);
  };

  const selectedProperty = nfts.find((p) => p.id === selectedPropertyId);

  const unlistProperties = nfts.filter((p) => !p.is_listed);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-web3-purple" />
            <span>Transfer Property</span>
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
                {unlistProperties.length > 0 ? (
                  unlistProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectValue placeholder="No properties to list" />
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Property Preview */}
          {selectedProperty && (
            <Card className="p-4 bg-gray-800/50 border-gray-600">
              <div className="flex space-x-3">
                {selectedProperty.image_url && (
                  <img
                    src={selectedProperty.image_url}
                    alt={selectedProperty.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    {selectedProperty.name}
                  </h4>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {selectedProperty.property_info.description}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {selectedProperty.property_info.coordinates[1].toFixed(4)},{" "}
                    {selectedProperty.property_info.coordinates[0].toFixed(4)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-gray-300">
              Recipient
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="recipient"
                type="text"
                placeholder="Enter recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            {currentAccount ? (
              <Button
                onClick={handleConfirm}
                disabled={!selectedPropertyId || !recipient || isLoading}
                className="flex-1 bg-gradient-web3 hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? "Transfering..." : "Transfer"}
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

export default TransferPropertyModal;
