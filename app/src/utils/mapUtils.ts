import { Feature } from 'geojson';
import L, { LatLng } from 'leaflet';

export const DefaultMapValues = {
  zoom: 5,
  center: [55, -128]
};

export interface MapPointProps {
  feature: Feature;
  latlng: LatLng;
  fillColor?: string;
  borderColor?: string;
}

export const coloredPoint = (point: MapPointProps): L.CircleMarker<any> => {
  return new L.CircleMarker(point.latlng, {
    radius: 6,
    fillOpacity: 1,
    fillColor: point.fillColor ?? '#006edc',
    color: point.borderColor ?? '#ffffff',
    weight: 1
  });
};
