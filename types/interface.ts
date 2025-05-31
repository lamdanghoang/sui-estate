export interface Property {
  id: string;
  objectId?: string;
  name: string;
  description: string;
  coordinates: [number, number];
  owner: string;
  area: number;
  price: number;
  images: string[];
  isListed?: boolean;
}
