"use client";
import { useEffect, useRef, useState } from "react";
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
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import * as locator from "@arcgis/core/rest/locator";
import SearchBar from "../pages/home/SearchBar";
import PropertyPopup from "../pages/home/PropertyPopup";
import { Property } from "@/types/interface";
import { NFTFieldProps } from "@/hooks/usePropertiesContract";

interface HoverPopupState {
  x: number;
  y: number;
  property: NFTFieldProps | null;
}

interface MapViewComponentProps {
  center?: {
    lon: number;
    lat: number;
    zoom: number;
  };
  onCoordinateSelect: (coordinates: [number, number]) => void;
  onPropertySelect: (property: Property) => void;
  properties: NFTFieldProps[];
  selectedCoordinates?: [number, number];
}

const MapViewComponent = ({
  center = {
    lon: 106.6522,
    lat: 10.8041,
    zoom: 15,
  },
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
  const [selectedProperty, setSelectedProperty] =
    useState<NFTFieldProps | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hoverPopup, setHoverPopup] = useState<HoverPopupState>({
    x: 0,
    y: 0,
    property: null,
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create the map
    const map = new Map({
      basemap: "satellite",
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

    // Add pointer move event for hover
    mapView.on("pointer-move", async (event) => {
      try {
        const hitResponse = await mapView.hitTest(event);
        const result = hitResponse.results[0];

        if (
          result &&
          result.type === "graphic" &&
          result.graphic.attributes?.property
        ) {
          const property = result.graphic.attributes.property as NFTFieldProps;
          setHoverPopup({
            x: event.x,
            y: event.y - 10,
            property: property,
          });
        } else {
          setHoverPopup({ x: 0, y: 0, property: null });
        }
      } catch (error) {
        console.error("Error during hit test:", error);
      }
    });

    // Add click handler for coordinate selection
    mapView.on("click", async (event) => {
      // Check if click is on a marker first
      const hitResponse = await mapView.hitTest(event);
      const result = hitResponse.results[0];

      if (
        result &&
        result.type === "graphic" &&
        result.graphic.attributes?.property
      ) {
        // Click is on a marker, handle property selection
        const property = result.graphic.attributes.property;
        setSelectedProperty(property);
        onPropertySelect(property);
        return; // Don't proceed with coordinate selection
      }

      // If not clicking on a marker, handle coordinate selection
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

    console.log(view);

    return () => {
      mapView.destroy();
    };
  }, []);

  const drawProperties = (properties: NFTFieldProps[]) => {
    if (!graphicsLayer) return;

    graphicsLayer.removeAll();

    // Add property markers
    properties.forEach((property) => {
      const point = new Point({
        longitude: property.property_info.coordinates[0],
        latitude: property.property_info.coordinates[1],
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: property.is_listed ? [34, 197, 94, 0.8] : [102, 126, 234, 0.8],
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

      {/* Hover Popup */}
      {hoverPopup.property && (
        <Card
          className="absolute z-50 p-3 glassmorphism max-w-xs animate-fade-in"
          style={{
            left: hoverPopup.x,
            top: hoverPopup.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="space-y-2">
            <h4 className="font-semibold">{hoverPopup.property.name}</h4>
            <img
              src={hoverPopup.property.image_url}
              alt={hoverPopup.property.name}
            />
            {/* <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Price:</span>
              <span className="text-green-400 font-semibold">
                {hoverPopup.property.listing_price} SUI
              </span>
            </div> */}
          </div>
        </Card>
      )}

      {/* Selected Coordinates Display */}
      {selectedCoordinates && (
        <Card className="absolute bottom-6 left-6 p-4 glassmorphism max-w-sm animate-fade-in gap-0">
          <div className="flex items-center space-x-3 mb-3">
            <MapPin className="w-5 h-5 text-web3-purple" />
            <h3 className="font-semibold">Selected Location</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Latitude:</span>
              <span className="font-mono">
                {selectedCoordinates[1].toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longitude:</span>
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
        <PropertyPopup
          property={selectedProperty}
          onSelectProperty={setSelectedProperty}
        />
      )}
    </div>
  );
};

export default MapViewComponent;
