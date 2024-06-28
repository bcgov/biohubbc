import { Feature } from 'geojson';

export const MAP_DEFAULT_ZOOM = 6;
export const MAP_DEFAULT_CENTER: L.LatLngExpression = [55, -128];

export const ALL_OF_BC_BOUNDARY: Feature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-146.95401365536304, 44.62175409623327],
        [-146.95401365536304, 63.528970541102794],
        [-105.07413084286304, 63.528970541102794],
        [-105.07413084286304, 44.62175409623327],
        [-146.95401365536304, 44.62175409623327]
      ]
    ]
  }
};

export const SURVEY_MAP_LAYER_COLOURS = {
  OBSERVATIONS_COLOUR: '#f15454',
  STUDY_AREA_COLOUR: '#e3a82b',
  SAMPLING_SITE_COLOUR: '#1f6fb5',
  MARKED_ANIMAL_COLOUR: '#f15454',
  TELEMETRY_COLOUR: '#ff5454',
  DEFAULT_COLOUR: '#a7bfd1'
};
