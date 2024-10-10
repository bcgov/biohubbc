import { SAMPLING_SITE_SPATIAL_TYPE } from 'constants/spatial';
import { Feature, Point } from 'geojson';
import { getSamplingSiteSpatialType } from 'utils/spatial-utils';
import { getCoordinatesFromGeoJson, isGeoJsonPointFeature, isValidCoordinates } from './spatial-utils';

describe('isValidCoordinates', () => {
  it('returns true when the latitude and longitude values are valid', () => {
    const latitude = 0;
    const longitude = 0;

    const response = isValidCoordinates(latitude, longitude);

    expect(response).toEqual(true);
  });

  it('returns false when the latitude is less than -90', () => {
    const latitude = -91;
    const longitude = 0;

    const response = isValidCoordinates(latitude, longitude);

    expect(response).toEqual(false);
  });

  it('returns false when the latitude is greater than 90', () => {
    const latitude = 91;
    const longitude = 0;

    const response = isValidCoordinates(latitude, longitude);

    expect(response).toEqual(false);
  });

  it('returns false when the longitude is less than -180', () => {
    const latitude = 0;
    const longitude = -181;

    const response = isValidCoordinates(latitude, longitude);

    expect(response).toEqual(false);
  });

  it('returns false when the longitude is greater than 180', () => {
    const latitude = 0;
    const longitude = 181;

    const response = isValidCoordinates(latitude, longitude);

    expect(response).toEqual(false);
  });

  it('returns false when the latitude is undefined', () => {
    const longitude = 0;

    const response = isValidCoordinates(undefined, longitude);

    expect(response).toEqual(false);
  });

  it('returns false when the longitude is undefined', () => {
    const latitude = 0;

    const response = isValidCoordinates(latitude, undefined);

    expect(response).toEqual(false);
  });
});

describe('getCoordinatesFromGeoJson', () => {
  it('returns the latitude and longitude values from a GeoJson Point Feature', () => {
    const feature: Feature<Point> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [11, 22]
      },
      properties: {}
    };

    const response = getCoordinatesFromGeoJson(feature);

    expect(response).toEqual({ latitude: 22, longitude: 11 });
  });
});

describe('isGeoJsonPointFeature', () => {
  it('returns true when the feature is a GeoJson Point Feature', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      },
      properties: {}
    };

    const response = isGeoJsonPointFeature(feature);

    expect(response).toEqual(true);
  });

  it('returns false when the feature is not a GeoJson Point Feature', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1]
        ]
      },
      properties: {}
    };

    const response = isGeoJsonPointFeature(feature);

    expect(response).toEqual(false);
  });

  it('returns false when the feature is undefined', () => {
    const response = isGeoJsonPointFeature(undefined);

    expect(response).toEqual(false);
  });

  it('returns false when the feature is null', () => {
    const response = isGeoJsonPointFeature(null);

    expect(response).toEqual(false);
  });

  it('returns false when the feature is an empty object', () => {
    const response = isGeoJsonPointFeature({});

    expect(response).toEqual(false);
  });

  it('returns false when the feature is an empty array', () => {
    const response = isGeoJsonPointFeature([]);

    expect(response).toEqual(false);
  });

  it('returns false when the feature is a string', () => {
    const response = isGeoJsonPointFeature('string');

    expect(response).toEqual(false);
  });

  it('returns false when the feature is a number', () => {
    const response = isGeoJsonPointFeature(1);

    expect(response).toEqual(false);
  });
});

describe('getSamplingSiteSpatialType', () => {
  it('maps MultiLineString to Transect', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'MultiLineString',
        coordinates: [[[0, 0]], [[1, 1]]]
      },
      properties: {}
    };

    const response = getSamplingSiteSpatialType(feature.geometry.type);

    expect(response).toEqual(SAMPLING_SITE_SPATIAL_TYPE.TRANSECT);
  });

  it('maps LineString to Transect', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1]
        ]
      },
      properties: {}
    };

    const response = getSamplingSiteSpatialType(feature.geometry.type);

    expect(response).toEqual(SAMPLING_SITE_SPATIAL_TYPE.TRANSECT);
  });

  it('maps Point to Point', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      },
      properties: {}
    };

    const response = getSamplingSiteSpatialType(feature.geometry.type);

    expect(response).toEqual(SAMPLING_SITE_SPATIAL_TYPE.POINT);
  });

  it('maps MultiPoint to Point', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'MultiPoint',
        coordinates: [
          [0, 0],
          [1, 1]
        ]
      },
      properties: {}
    };

    const response = getSamplingSiteSpatialType(feature.geometry.type);

    expect(response).toEqual(SAMPLING_SITE_SPATIAL_TYPE.POINT);
  });

  it('maps Polygon to Area', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 1],
            [0, 1],
            [0, 0]
          ]
        ]
      },
      properties: {}
    };

    const response = getSamplingSiteSpatialType(feature.geometry.type);

    expect(response).toEqual(SAMPLING_SITE_SPATIAL_TYPE.AREA);
  });

  it('maps MultiPolygon to Area', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [0, 0],
              [1, 1],
              [0, 1],
              [0, 0]
            ]
          ]
        ]
      },
      properties: {}
    };

    const response = getSamplingSiteSpatialType(feature.geometry.type);

    expect(response).toEqual(SAMPLING_SITE_SPATIAL_TYPE.AREA);
  });
});
