declare module 'react-simple-maps' {
  import { ReactNode } from 'react';

  export interface Geography {
    rsmKey: string;
    properties: {
      NAME?: string;
      ISO_A3?: string;
      ISO_A3_EH?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface ComposableMapProps {
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      [key: string]: any;
    };
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string;
    children: (args: { geographies: Geography[] }) => ReactNode;
  }

  export interface GeographyProps {
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    [key: string]: any;
  }

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    [key: string]: any;
  }

  export interface ZoomableGroupProps {
    children: ReactNode;
    [key: string]: any;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
}

