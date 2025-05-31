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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin, Upload, Coins } from "lucide-react";
import { toast } from "sonner";

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates?: [number, number];
  onMint: (propertyData: {
    name: string;
    description: string;
    coordinates: [number, number];
    image?: string;
  }) => void;
}

const MintModal = ({
  isOpen,
  onClose,
  coordinates,
  onMint,
}: MintModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coordinates) {
      toast.error("Please select coordinates on the map first");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Property name is required");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate minting process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onMint({
        name: formData.name,
        description: formData.description,
        coordinates,
        image: formData.image || undefined,
      });

      toast.success("Property NFT minted successfully!");
      setFormData({ name: "", description: "", image: "" });
      onClose();
    } catch (error) {
      toast.error("Failed to mint property NFT");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to IPFS or another storage service
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Image uploaded successfully");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glassmorphism border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Coins className="w-5 h-5 text-web3-purple" />
            <span>Mint Property NFT</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coordinates Display */}
          {coordinates && (
            <Card className="p-4 bg-gray-800/50 border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-web3-purple" />
                <span className="text-sm font-medium text-white">
                  Selected Location
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Latitude:</span>
                  <div className="text-white font-mono">
                    {coordinates[1].toFixed(6)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Longitude:</span>
                  <div className="text-white font-mono">
                    {coordinates[0].toFixed(6)}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Property Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Property Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter property name..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-web3-purple"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your property..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-web3-purple min-h-[80px]"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-white">
              Property Image (Optional)
            </Label>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {formData.image && (
                <span className="text-green-400 text-sm">✓ Image uploaded</span>
              )}
            </div>
          </div>

          {/* Image Preview */}
          {formData.image && (
            <Card className="p-3 bg-gray-800/50 border-gray-700">
              <img
                src={formData.image}
                alt="Property preview"
                className="w-full h-32 object-cover rounded-lg"
              />
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-web3 hover:opacity-90"
              disabled={isLoading || !coordinates}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Minting...</span>
                </div>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Confirm Mint
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MintModal;
