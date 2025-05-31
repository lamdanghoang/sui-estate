"use client";
import React, { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import AddressCandidate from "@arcgis/core/rest/support/AddressCandidate.js";
import "@arcgis/core/assets/esri/themes/light/main.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, User, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import * as locator from "@arcgis/core/rest/locator";
import SearchBar from "../pages/home/SearchBar";

interface Property {
  id: string;
  name: string;
  coordinates: [number, number];
  owner: string;
  price: number;
  image?: string;
  description?: string;
  isListed?: boolean;
}

interface MapViewComponentProps {
  center?: {
    lon: number;
    lat: number;
    zoom: number;
  };
  onCoordinateSelect: (coordinates: [number, number]) => void;
  onPropertySelect: (property: Property) => void;
  properties: Property[];
  selectedCoordinates?: [number, number];
}

const MapViewComponent = ({
  center = {
    lon: -74.006,
    lat: 40.7128,
    zoom: 12,
  }, // New York City
  onCoordinateSelect,
  onPropertySelect,
  properties,
  selectedCoordinates,
}: MapViewComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView | null>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(
    null
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create the map
    const map = new Map({
      basemap: "topo-vector",
    });

    // Create graphics layer
    const layer = new GraphicsLayer();
    map.add(layer);

    // Create the map view
    const mapView = new MapView({
      container: mapRef.current,
      map: map,
      center: [center.lon, center.lat],
      zoom: center.zoom,
    });

    // Store view and graphics layer
    setView(mapView);
    setGraphicsLayer(layer);

    // Add click handler for coordinate selection
    mapView.on("click", (event) => {
      // Add null checks for longitude and latitude
      const longitude = event.mapPoint.longitude;
      const latitude = event.mapPoint.latitude;

      if (longitude != null && latitude != null) {
        const coordinates: [number, number] = [longitude, latitude];
        onCoordinateSelect(coordinates);
        toast.success(
          `Coordinates selected: ${latitude.toFixed(6)}, ${longitude.toFixed(
            6
          )}`
        );
      } else {
        toast.error("Could not determine coordinates from click location");
      }
    });

    // Add click handler for markers
    mapView.on("click", (event) => {
      mapView!.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if (
            result.type === "graphic" &&
            result.graphic.attributes &&
            result.graphic.attributes.property
          ) {
            const property = result.graphic.attributes.property;
            setSelectedProperty(property);
            onPropertySelect(property);
          }
        }
      });
    });

    console.log(view);

    return () => {
      mapView.destroy();
    };
  }, []);

  const drawProperties = (properties: Property[]) => {
    if (!graphicsLayer) return;

    graphicsLayer.removeAll();

    // Add property markers
    properties.forEach((property) => {
      const point = new Point({
        longitude: property.coordinates[0],
        latitude: property.coordinates[1],
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: property.isListed ? [34, 197, 94, 0.8] : [102, 126, 234, 0.8],
        size: "16px",
        outline: {
          color: [255, 255, 255],
          width: 2,
        },
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: {
          property: property,
        },
      });

      graphicsLayer.add(graphic);
    });
  };

  // Render graphics when locations change
  useEffect(() => {
    if (properties.length > 0) {
      drawProperties(properties);
    }
  }, [properties, graphicsLayer]);

  const addCurrentLocationMarker = (longitude: number, latitude: number) => {
    if (!graphicsLayer) return;

    // Remove any existing current location marker
    const existingMarkers = graphicsLayer.graphics.filter(
      (graphic) => graphic.attributes && graphic.attributes.isCurrentLocation
    );
    graphicsLayer.removeMany(existingMarkers.toArray());

    // Add current location marker
    const point = new Point({
      longitude: longitude,
      latitude: latitude,
    });

    const currentLocationSymbol = new SimpleMarkerSymbol({
      color: [255, 0, 0, 0.9], // Red color for current location
      size: "20px",
      style: "circle",
      outline: {
        color: [255, 255, 255],
        width: 3,
      },
    });

    const graphic = new Graphic({
      geometry: point,
      symbol: currentLocationSymbol,
      attributes: {
        isCurrentLocation: true,
      },
    });

    graphicsLayer.add(graphic);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation || !view) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    if (isGettingLocation) {
      toast.info("Already getting location...");
      return;
    }

    setIsGettingLocation(true);
    toast.info("Getting your current location...");

    // First try high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        console.log(
          `Location found: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
        );

        // Add marker for current location
        addCurrentLocationMarker(longitude, latitude);

        // Center map on current location
        view!
          .goTo({
            center: [longitude, latitude],
            zoom: 16,
          })
          .then(() => {
            toast.success(
              `Centered to your location (±${Math.round(accuracy)}m accuracy)`
            );
            setIsGettingLocation(false);
          });
      },
      (error) => {
        console.error("High accuracy geolocation error:", error);

        // Fallback: try with lower accuracy
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;

            console.log(
              `Fallback location found: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
            );

            // Add marker for current location
            addCurrentLocationMarker(longitude, latitude);

            // Center map on current location
            view!
              .goTo({
                center: [longitude, latitude],
                zoom: 14, // Lower zoom for less accurate location
              })
              .then(() => {
                toast.success(`Located (±${Math.round(accuracy)}m accuracy)`);
                setIsGettingLocation(false);
              });
          },
          (fallbackError) => {
            console.error("Fallback geolocation error:", fallbackError);
            setIsGettingLocation(false);

            let errorMessage = "Unable to get your location. ";
            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                errorMessage += "Please allow location access in your browser.";
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                errorMessage += "Location information is unavailable.";
                break;
              case fallbackError.TIMEOUT:
                errorMessage += "Location request timed out.";
                break;
              default:
                errorMessage += "An unknown error occurred.";
                break;
            }
            toast.error(errorMessage);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 600000, // Accept 10-minute old location
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Accept 1-minute old location for high accuracy
      }
    );
  };

  const handleLocationSearch = async (searchText: string) => {
    if (!view) return;

    try {
      // Check if input looks like coordinates (lat, lng format)
      const coordMatch = searchText.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);

      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);

        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          view.goTo({
            center: [lng, lat],
            zoom: 15,
          });
          toast.success(`Navigated to coordinates: ${lat}, ${lng}`);
          return;
        }
      }

      // Use ArcGIS geocoding service for location search
      const geocodeUrl =
        "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

      const results = await locator.addressToLocations(geocodeUrl, {
        address: {
          SingleLine: searchText,
        },
        maxLocations: 1,
        outFields: ["*"],
      });

      if (results && results.length > 0) {
        const location: AddressCandidate = results[0];
        if (!location.location) return;

        view.goTo({
          center: [location.location.longitude, location.location.latitude],
          zoom: 15,
        });
        toast.success(`Found: ${location.attributes.LongLabel || searchText}`);
      } else {
        throw new Error("Location not found");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0" />

      <SearchBar
        onLocationSearch={handleLocationSearch}
        onCurrentLocation={handleCurrentLocation}
      />

      {/* Selected Coordinates Display */}
      {selectedCoordinates && (
        <Card className="absolute bottom-6 left-6 p-4 glassmorphism max-w-sm animate-fade-in gap-0">
          <div className="flex items-center space-x-3 mb-3">
            <MapPin className="w-5 h-5 text-web3-purple" />
            <h3 className="font-semibold">Selected Location</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Latitude:</span>
              <span className="font-mono">
                {selectedCoordinates[1].toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Longitude:</span>
              <span className="font-mono">
                {selectedCoordinates[0].toFixed(6)}
              </span>
            </div>
          </div>
          <Button
            onClick={() => {
              /* This will be handled by the parent component */
            }}
            className="w-full mt-4 bg-web3-purple hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Mint Property NFT
          </Button>
        </Card>
      )}

      {/* Property Info Popup */}
      {selectedProperty && (
        <Card className="absolute top-20 right-6 p-4 glassmorphism max-w-sm animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">
              {selectedProperty.name}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProperty(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          {selectedProperty.image && (
            <img
              src={selectedProperty.image}
              alt={selectedProperty.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}

          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">Owner:</span>
              <span className="text-white font-mono text-xs">
                {selectedProperty.owner.slice(0, 6)}...
                {selectedProperty.owner.slice(-4)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Price:</span>
              <Badge
                variant="outline"
                className="text-green-400 border-green-400"
              >
                {selectedProperty.price} SUI
              </Badge>
            </div>
            {selectedProperty.isListed && (
              <Badge className="bg-green-500/20 text-green-400 border-green-400">
                Listed for Sale
              </Badge>
            )}
          </div>

          <div className="flex space-x-2">
            {selectedProperty.isListed ? (
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
            <Button size="sm" variant="outline" className="border-gray-600">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MapViewComponent;
