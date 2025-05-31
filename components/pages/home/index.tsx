"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import MintModal from "@/components/MintModal";
import { Property } from "@/types/interface";

const MapViewComponent = dynamic(() => import("@/components/map/Map"), {
  ssr: false, // Prevents server-side rendering
});

const HomePage = () => {
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<[number, number]>();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  // const [properties, setProperties] = useState<Property[]>([
  const properties: Property[] = [
    {
      id: "1",
      name: "Central Park View",
      coordinates: [-73.9712, 40.7831],
      owner: "0xabcdef1234567890abcdef1234567890abcdef12",
      price: 150,
      images: [
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400",
      ],
      description: "Stunning property overlooking Central Park",
      area: 0,
      isListed: false,
    },
    {
      id: "2",
      name: "Brooklyn Bridge Loft",
      coordinates: [-73.9969, 40.7061],
      owner: "0x1234567890abcdef1234567890abcdef12345678",
      price: 200,
      images: [
        "https://images.unsplash.com/photo-1551038247-3d9af20df552?w=400",
      ],
      description: "Modern loft with Brooklyn Bridge views",
      area: 0,
      isListed: true,
    },
    {
      id: "3",
      name: "Financial District Office",
      coordinates: [-74.0123, 40.7074],
      owner: "0xfedcba0987654321fedcba0987654321fedcba09",
      price: 300,
      images: [
        "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=400",
      ],
      description: "Prime commercial real estate in Financial District",
      area: 0,
      isListed: true,
    },
  ];

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
          properties={properties}
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
