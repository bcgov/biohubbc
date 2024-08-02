import { Feature, GeoJsonProperties, Point } from 'geojson';
import {
  createGeoJSONFeature,
  createGeoJSONPoint,
  getCoordinatesFromGeoJson,
  isGeoJsonPointFeature,
  isValidCoordinates
} from './spatial-utils';

describe('createGeoJSONPoint', () => {
  it('creates a valid GeoJSON point', () => {
    const latitude = 45;
    const longitude = -75;
    const point = createGeoJSONPoint(latitude, longitude);

    expect(point).toEqual({
      type: 'Point',
      coordinates: [-75, 45]
    });
  });
});

describe('createGeoJSONFeature', () => {
  it('creates a valid GeoJSON feature with point geometry and properties', () => {
    const latitude = 45;
    const longitude = -75;
    const properties = { name: 'Test Point' };
    const feature = createGeoJSONFeature(latitude, longitude, properties);

    expect(feature).toEqual({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-75, 45]
      },
      properties
    });
  });

  it('creates a valid GeoJSON feature with point geometry and empty properties', () => {
    const latitude = 45;
    const longitude = -75;
    const feature = createGeoJSONFeature(latitude, longitude);

    expect(feature).toEqual({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-75, 45]
      },
      properties: {}
    });
  });
});

describe('isValidCoordinates', () => {
  it('returns true for valid coordinates', () => {
    expect(isValidCoordinates(45, -75)).toBe(true);
  });

  it('returns false for invalid latitude', () => {
    expect(isValidCoordinates(95, -75)).toBe(false);
  });

  it('returns false for invalid longitude', () => {
    expect(isValidCoordinates(45, -195)).toBe(false);
  });

  it('returns false for undefined latitude', () => {
    expect(isValidCoordinates(undefined, -75)).toBe(false);
  });

  it('returns false for undefined longitude', () => {
    expect(isValidCoordinates(45, undefined)).toBe(false);
  });
});

describe('getCoordinatesFromGeoJson', () => {
  it('extracts coordinates from a GeoJSON point feature', () => {
    const feature: Feature<Point, GeoJsonProperties> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-75, 45]
      },
      properties: {}
    };

    const coordinates = getCoordinatesFromGeoJson(feature);

    expect(coordinates).toEqual({ latitude: 45, longitude: -75 });
  });
});

describe('isGeoJsonPointFeature', () => {
  it('returns true for a GeoJSON feature with point geometry', () => {
    const feature: Feature<Point, GeoJsonProperties> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-75, 45]
      },
      properties: {}
    };

    expect(isGeoJsonPointFeature(feature)).toBe(true);
  });

  it('returns false for a GeoJSON feature with non-point geometry', () => {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-75, 45],
          [-80, 50]
        ]
      },
      properties: {}
    };

    expect(isGeoJsonPointFeature(feature)).toBe(false);
  });

  it('returns false for non-GeoJSON feature', () => {
    const nonFeature = {
      not: 'a feature'
    };

    expect(isGeoJsonPointFeature(nonFeature)).toBe(false);
  });
});
