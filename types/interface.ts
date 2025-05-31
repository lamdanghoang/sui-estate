export interface Property {
  id: string;
  name: string;
  coordinates: [number, number];
  owner: string;
  price: number;
  image?: string;
  description?: string;
  isListed?: boolean;
}
