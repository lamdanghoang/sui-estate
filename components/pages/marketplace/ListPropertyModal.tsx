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
import { DollarSign, Tag } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CustomBtn } from "@/components/wallet/ConnectButton";
import {
  NFTFieldProps,
  useGetNft,
  useListNFT,
} from "@/hooks/usePropertiesContract";
import { toast } from "sonner";
import { formatDigest } from "@mysten/sui/utils";

interface ListPropertyModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ListPropertyModal = ({ isOpen, onClose, id }: ListPropertyModalProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(id);
  const [listingPrice, setListingPrice] = useState("");
  const [nfts, setNfts] = useState<NFTFieldProps[]>([]);
  const currentAccount = useCurrentAccount();
  const { sign_to_list, digest, error, isLoading } = useListNFT();
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

      onClose();

      // Reset form
      setSelectedPropertyId("");
      setListingPrice("");
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

  const handleConfirm = async () => {
    if (!selectedPropertyId || !listingPrice) return;

    console.log(selectedPropertyId, parseFloat(listingPrice));

    await sign_to_list(selectedPropertyId, parseFloat(listingPrice));
  };

  const selectedProperty = nfts.find((p) => p.id === selectedPropertyId);

  const unlistProperties = nfts.filter((p) => !p.is_listed);

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
            {currentAccount ? (
              <Button
                onClick={handleConfirm}
                disabled={!selectedPropertyId || !listingPrice || isLoading}
                className="flex-1 bg-gradient-web3 hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? "Listing..." : "List Property"}
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

export default ListPropertyModal;
