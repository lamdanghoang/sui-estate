"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import MintModal from "@/components/MintModal";
import { Property } from "@/types/interface";
import { NFTFieldProps, useGetNft } from "@/hooks/usePropertiesContract";
import { getPropertyNFTs } from "@/helpers/api";

const MapViewComponent = dynamic(() => import("@/components/map/Map"), {
  ssr: false, // Prevents server-side rendering
});

const HomePage = () => {
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<[number, number]>();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [allProperties, setAllProperties] = useState<NFTFieldProps[]>([]);
  const { get_nft_fields } = useGetNft();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const properties = await getPropertyNFTs({ is_listed: false });
        const nfts = await Promise.all(
          properties.data.map(async (nft: { object_id: string }) => {
            const nftFields = await get_nft_fields(nft.object_id);
            return nftFields;
          })
        );
        setAllProperties(
          nfts.filter((nft): nft is NFTFieldProps => nft !== null)
        );
      } catch (error) {
        console.error("Error fetching property nfts:", error);
      }
    };
    fetchProperties();
  }, []);

  const handleCoordinateSelect = (coordinates: [number, number]) => {
    setSelectedCoordinates(coordinates);
    setIsMintModalOpen(true);
  };

  const handlePropertySelect = (property: Property) => {
    console.log("Selected property:", property);
    toast.info(`Selected ${property.name}`);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      <div className="flex-1 pt-16">
        <MapViewComponent
          onCoordinateSelect={handleCoordinateSelect}
          onPropertySelect={handlePropertySelect}
          properties={allProperties}
          selectedCoordinates={selectedCoordinates}
        />
      </div>
      <MintModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        coordinates={selectedCoordinates}
      />
    </div>
  );
};

export default HomePage;
