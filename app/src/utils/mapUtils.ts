import { Feature } from 'geojson';
import L, { LatLng } from 'leaflet';

export const MapDefaultBlue = '#3388ff';

export const DefaultMapValues = {
  zoom: 5,
  center: [55, -128]
};

export interface INonEditableGeometries {
  feature: Feature;
  popupComponent?: JSX.Element;
}

export interface IClusteredPointGeometries {
  coordinates: number[];
  popupComponent?: JSX.Element;
}
export interface MapPointProps {
  latlng: LatLng;
  fillColor?: string;
  borderColor?: string;
}

export const coloredPoint = (point: MapPointProps): L.CircleMarker<any> => {
  return new L.CircleMarker(point.latlng, {
    radius: 6,
    fillOpacity: 1,
    fillColor: point.fillColor ?? MapDefaultBlue,
    color: point.borderColor ?? '#ffffff',
    weight: 1
  });
};
