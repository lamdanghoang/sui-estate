"use client";
import { useState, useEffect } from "react";
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
import { MapPin, Upload, Coins, X, Home, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { storeImageFile } from "@/helpers/api";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CustomBtn } from "./wallet/ConnectButton";
import { useMintNFT } from "@/hooks/usePropertiesContract";
import { formatDigest } from "@mysten/sui/utils";

interface PropertyData {
  name: string;
  description: string;
  coordinates: [number, number];
  area: number;
  images: string[];
}

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates?: [number, number];
  initialData?: Partial<PropertyData>;
}

interface FormData {
  name: string;
  description: string;
  area: string;
  images: string[];
  uploadedBlobIds: string[];
}

interface FormErrors {
  name?: string;
  description?: string;
  area?: string;
  general?: string;
}

const MintModal = ({
  isOpen,
  onClose,
  coordinates,
  initialData,
}: MintModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    area: "",
    images: [],
    uploadedBlobIds: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const currentAccount = useCurrentAccount();
  const {
    sign_to_mint,
    digest,
    createdObjectId: objectId,
    error,
    isLoading,
  } = useMintNFT();

  // Initialize form with provided data
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        area: initialData.area?.toString() || "",
        images: initialData.images || [],
        uploadedBlobIds: [],
      });
    }
  }, [initialData, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        area: "",
        images: [],
        uploadedBlobIds: [],
      });
      setErrors({});
      setTouched(new Set());
    }
  }, [isOpen]);

  // Validation functions
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 3)
          return "Name must be at least 3 characters";
        if (value.trim().length > 100)
          return "Name must be less than 100 characters";
        break;
      case "description":
        if (!value.trim()) return "Description is required";
        if (value.length > 500)
          return "Description must be less than 500 characters";
        break;
      case "area":
        if (value && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
          return "Area must be a positive number";
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate all fields
    Object.keys(formData).forEach((field) => {
      if (field !== "images") {
        const error = validateField(
          field,
          formData[field as keyof FormData] as string
        );
        if (error) newErrors[field as keyof FormErrors] = error;
      }
    });

    // Check coordinates
    if (!coordinates) {
      newErrors.general = "Please select coordinates on the map first";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Add field to touched set
    setTouched((prev) => new Set(prev).add(field));

    // Validate field if it has been touched
    if (touched.has(field) || value !== "") {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
        general: undefined, // Clear general errors when user makes changes
      }));
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const blobIds: string[] = [];
    for (const file of files) {
      try {
        const blobId = await storeImageFile(file);
        blobIds.push(blobId);
      } catch (error) {
        console.error("Failed to upload image:", error);
        throw new Error("Failed to upload one or more images");
      }
    }
    return blobIds;
  };

  // Effect to observe the digest value from the hook and update UI accordingly
  useEffect(() => {
    if (digest && objectId) {
      toast("Property NFT minted successfully!", {
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
  }, [digest, objectId]);

  // Effect to observe errors from the hook
  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to mint property NFT"
      );
      setErrors((prev) => ({
        ...prev,
        general: "Minting failed. Please try again.",
      }));
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched(new Set(Object.keys(formData)));

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsUploading(true);

    try {
      // Upload images if there are any
      let uploadedBlobIds: string[] = [];
      if (formData.images.length > 0) {
        // Convert image URLs back to File objects
        const imageFiles = await Promise.all(
          formData.images.map(async (imageUrl) => {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            return new File([blob], "image.jpg", { type: blob.type });
          })
        );

        uploadedBlobIds = await uploadImages(imageFiles);
      }

      const propertyData: PropertyData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        coordinates: coordinates!,
        area: formData.area ? parseFloat(formData.area) : 10,
        images: uploadedBlobIds,
      };

      console.log(propertyData);
      await sign_to_mint({
        name: propertyData.name,
        description: propertyData.description,
        coordinates: propertyData.coordinates,
        images: propertyData.images,
        area: propertyData.area,
      });
    } catch (error) {
      console.error("Minting error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Limit to 5 images max
      const currentImageCount = formData.images.length;
      const maxNewImages = Math.min(files.length, 5 - currentImageCount);

      if (maxNewImages === 0) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      if (maxNewImages < files.length) {
        toast.warning(`Only ${maxNewImages} images added (maximum 5 total)`);
      }

      const newImages: string[] = [];
      Array.from(files)
        .slice(0, maxNewImages)
        .forEach((file) => {
          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} is too large (max 5MB)`);
            return;
          }

          const imageUrl = URL.createObjectURL(file);
          newImages.push(imageUrl);
        });

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));

      if (newImages.length > 0) {
        console.log(`${newImages.length} image(s) uploaded successfully`);
      }
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(formData.images[index]);

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => new Set(prev).add(field));
    const value = formData[field];
    if (typeof value === "string") {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg glassmorphism border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Coins className="w-5 h-5 text-web3-purple" />
            <span>Mint Property NFT</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <Card className="p-3 bg-red-900/20 border-red-700">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.general}</span>
              </div>
            </Card>
          )}

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
            <Label
              htmlFor="name"
              className="text-white flex items-center space-x-1"
            >
              <Home className="w-4 h-4" />
              <span>Property Name *</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="Enter property name..."
              className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-web3-purple ${
                errors.name ? "border-red-500 focus:border-red-500" : ""
              }`}
              required
            />
            {errors.name && (
              <span className="text-red-400 text-xs">{errors.name}</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              placeholder="Describe your property..."
              className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-web3-purple min-h-[80px] ${
                errors.description ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
            <div className="flex justify-between text-xs">
              {errors.description && (
                <span className="text-red-400">{errors.description}</span>
              )}
              <span className="text-gray-400 ml-auto">
                {formData.description.length}/500
              </span>
            </div>
          </div>

          {/* Area */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area" className="text-white">
                Area (m²)
              </Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                onBlur={() => handleBlur("area")}
                placeholder="Enter area..."
                className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-web3-purple ${
                  errors.area ? "border-red-500 focus:border-red-500" : ""
                }`}
                min="0"
                step="0.01"
              />
              {errors.area && (
                <span className="text-red-400 text-xs">{errors.area}</span>
              )}
            </div>

            {/* Images Upload */}
            <div className="space-y-2">
              <Label htmlFor="images" className="text-white">
                Property Images
              </Label>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white"
                  onClick={() =>
                    document.getElementById("images-upload")?.click()
                  }
                  disabled={formData.images.length >= 5}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
                <input
                  id="images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {formData.images.length > 0 && (
                  <span className="text-green-400 text-sm">
                    ✓ {formData.images.length}/5 image(s)
                  </span>
                )}
              </div>
              <span className="text-gray-400 text-xs">
                Maximum 5 images, 5MB each
              </span>
            </div>
          </div>

          {/* Images Preview Grid */}
          {formData.images.length > 0 && (
            <Card className="p-3 bg-gray-800/50 border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
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
            {currentAccount ? (
              <Button
                type="submit"
                className="flex-1 bg-gradient-web3 hover:opacity-90"
                disabled={
                  isLoading ||
                  !coordinates ||
                  Object.keys(errors).some(
                    (key) => errors[key as keyof FormErrors]
                  )
                }
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {isUploading ? "Uploading images..." : "Minting..."}
                    </span>
                  </div>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Confirm Mint
                  </>
                )}
              </Button>
            ) : (
              <CustomBtn className="flex-1 w-full" />
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MintModal;
