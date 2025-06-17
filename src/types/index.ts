export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface RouteStep {
  location: Location;
  order: number;
  estimatedTime: string;
  distance: string;
}

export interface OptimizedRoute {
  steps: RouteStep[];
  totalDistance: string;
  totalTime: string;
}