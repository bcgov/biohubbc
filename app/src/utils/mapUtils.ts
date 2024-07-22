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

/**
 * Util function for creating a custom map marker for symbolizing observations
 *
 * @param color
 * @returns
 */
const _generateCustomPointMarkerUrl = (color?: string) =>
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg width="24px" height="24px" viewBox="-3 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${
      color ?? '#16a3db'
    }" d="m8.075 23.52c-6.811-9.878-8.075-10.891-8.075-14.52 0-4.971 4.029-9 9-9s9 4.029 9 9c0 3.629-1.264 4.64-8.075 14.516-.206.294-.543.484-.925.484s-.719-.19-.922-.48l-.002-.004z"/></svg>`
  );

/**
 * Util function for creating a custom map marker for symbolizing observations
 *
 * @param color
 * @returns
 */
const _generateCustomMortalityMarkerUrl = (color?: string) =>
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="none" stroke="${color ?? '#16a3db'}" stroke-width="7" d="M2,2 L22,22 M22,2 L2,22"/>
    </svg>`
  );

/**
 * Returns custom map marker for symbolizing observations
 * @param point
 * @returns
 */
export const coloredCustomPointMarker = (point: MapPointProps): L.Marker<any> => {
  return new L.Marker(point.latlng, {
    icon: L.icon({ iconUrl: _generateCustomPointMarkerUrl(point?.fillColor), iconSize: [20, 15], iconAnchor: [12, 12] })
  });
};

/**
 * Returns custom map marker for symbolizing observations
 * @param point
 * @returns
 */
export const coloredCustomMortalityMarker = (point: MapPointProps): L.Marker<any> => {
  return new L.Marker(point.latlng, {
    icon: L.icon({
      iconUrl: _generateCustomMortalityMarkerUrl(point?.fillColor),
      iconSize: [20, 15],
      iconAnchor: [12, 12]
    })
  });
};
