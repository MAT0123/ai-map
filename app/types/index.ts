export interface Location {
    lat: number;
    lng: number;
  }
  
  export interface Marker {
    position: Location;
    name: string;
    type: 'primary' | 'suggestion';
  }
  
  export interface SuggestedLocation {
    lat: number;
    lng: number;
    name: string;
  }
  
  export type AnalysisType = 'tourism' | 'realestate' | 'environment';
  
  export interface AnalysisRequest {
    location: Location;
    locationName: string;
    analysisType: AnalysisType;
  }
  
  export interface AnalysisResponse {
    analysis: string;
    suggestedLocations: SuggestedLocation[];
    error?: string;
  }