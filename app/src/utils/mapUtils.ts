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

export const generateMarkerIconUrl = (fillColor?: string) =>
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg width="24px" height="24px" viewBox="-3 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${
      fillColor ?? '#16a3db'
    }" d="m8.075 23.52c-6.811-9.878-8.075-10.891-8.075-14.52 0-4.971 4.029-9 9-9s9 4.029 9 9c0 3.629-1.264 4.64-8.075 14.516-.206.294-.543.484-.925.484s-.719-.19-.922-.48l-.002-.004z"/></svg>`
  );

export const coloredPoint = (point: MapPointProps): L.Marker<any> => {
  return new L.Marker(point.latlng, {
    icon: L.icon({ iconUrl: generateMarkerIconUrl(point?.fillColor), iconSize: [20, 15], iconAnchor: [12, 12] })
  });
};
