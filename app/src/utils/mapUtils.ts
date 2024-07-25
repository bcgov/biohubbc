import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import L, { LatLng } from 'leaflet';

export interface ColoredCustomMarkerProps {
  latlng: LatLng;
  fillColor?: string;
  borderColor?: string;
}

/**
 * Returns a custom map marker for symbolizing points.
 *
 * @param {ColoredCustomMarkerProps} point
 * @return {*}  {L.CircleMarker<any>}
 */
export const coloredCustomMarker = (props: ColoredCustomMarkerProps): L.CircleMarker<any> => {
  return new L.CircleMarker(props.latlng, {
    radius: 6,
    fillOpacity: 1,
    fillColor: props.fillColor ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
    color: props.borderColor ?? '#ffffff',
    weight: 1
  });
};

/**
 * Util function for creating a custom map marker for symbolizing observation points.
 *
 * @param {string} [color]
 */
const _generateCustomObservationMarkerUrl = (color?: string) =>
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg width="24px" height="24px" viewBox="-3 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${
      color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    }" d="m8.075 23.52c-6.811-9.878-8.075-10.891-8.075-14.52 0-4.971 4.029-9 9-9s9 4.029 9 9c0 3.629-1.264 4.64-8.075 14.516-.206.294-.543.484-.925.484s-.719-.19-.922-.48l-.002-.004z"/></svg>`
  );

/**
 * Util function for creating a custom map marker for symbolizing animal mortality points.
 *
 * @param {string} [color]
 */
const _generateCustomMortalityMarkerUrl = (color?: string) =>
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="none" stroke="${
        color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
      }" stroke-width="7" d="M2,2 L22,22 M22,2 L2,22"/>
    </svg>`
  );

/**
 * Returns custom map marker for symbolizing observation points.
 *
 * @param {ColoredCustomMarkerProps} props
 * @return {*}  {L.Marker<any>}
 */
export const coloredCustomObservationMarker = (props: ColoredCustomMarkerProps): L.Marker<any> => {
  return new L.Marker(props.latlng, {
    icon: L.icon({
      iconUrl: _generateCustomObservationMarkerUrl(props.fillColor),
      iconSize: [20, 15],
      iconAnchor: [12, 12]
    })
  });
};

/**
 * Returns custom map marker for symbolizing animal mortality points.
 *
 * @param {ColoredCustomMarkerProps} props
 * @return {*}  {L.Marker<any>}
 */
export const coloredCustomMortalityMarker = (props: ColoredCustomMarkerProps): L.Marker<any> => {
  return new L.Marker(props.latlng, {
    icon: L.icon({
      iconUrl: _generateCustomMortalityMarkerUrl(props.fillColor),
      iconSize: [20, 15],
      iconAnchor: [12, 12]
    })
  });
};
