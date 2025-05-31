export interface Property {
  id: string;
  name: string;
  description?: string;
  coordinates: [number, number];
  owner: string;
  area?: number;
  price: number;
  images?: string[];
  isListed?: boolean;
}
