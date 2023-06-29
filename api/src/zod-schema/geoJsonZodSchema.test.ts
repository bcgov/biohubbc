import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GeoJSONFeatureCollectionZodSchema,
  GeoJSONFeatureZodSchema,
  GeoJSONGeometryCollectionZodSchema,
  GeoJSONLineStringZodSchema,
  GeoJSONMultiLineStringZodSchema,
  GeoJSONMultiPointZodSchema,
  GeoJSONMultiPolygonZodSchema,
  GeoJSONPointZodSchema,
  GeoJSONPolygonZodSchema,
  GeoJSONZodSchema
} from './geoJsonZodSchema';

describe('geoJsonZodSchema', () => {
  describe('GeoJSONPointZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        coordinates: [-120.89455551309156, 50.55558184778528],
        type: 'Point'
      };

      expect(() => GeoJSONPointZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        coordinates: [[[-120.89455551309156, 50.55558184778528]]],
        type: 'Point'
      };

      expect(() => GeoJSONPointZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONLineStringZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        coordinates: [
          [-122.7523690343273, 50.14949756562072],
          [-121.50892156862892, 50.1424249906992]
        ],
        type: 'LineString'
      };

      expect(() => GeoJSONLineStringZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        coordinates: [[-122.7523690343273, 50.14949756562072]],
        type: 'LineString'
      };

      expect(() => GeoJSONLineStringZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONPolygonZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        coordinates: [
          [
            [-124.11504035918227, 51.08084984848492],
            [-124.11504035918227, 48.947203083932465],
            [-118.88808742345168, 48.947203083932465],
            [-118.88808742345168, 51.08084984848492],
            [-124.11504035918227, 51.08084984848492]
          ]
        ],
        type: 'Polygon'
      };

      expect(() => GeoJSONPolygonZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        coordinates: [
          [
            [-124.11504035918227, 51.08084984848492],
            [-124.11504035918227, 51.08084984848492]
          ]
        ],
        type: 'Polygon'
      };

      expect(() => GeoJSONPolygonZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONMultiPointZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        coordinates: [
          [-120.89455551309156, 50.55558184778528],
          [-120.89455551309156, 50.55558184778528]
        ],
        type: 'MultiPoint'
      };

      expect(() => GeoJSONMultiPointZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        coordinates: [[[-120.89455551309156, 50.55558184778528]]],
        type: 'MultiPoint'
      };

      expect(() => GeoJSONMultiPointZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONMultiLineStringZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        coordinates: [
          [
            [-122.7523690343273, 50.14949756562072],
            [-121.50892156862892, 50.1424249906992]
          ],
          [
            [-122.7523690343273, 50.14949756562072],
            [-121.50892156862892, 50.1424249906992]
          ]
        ],
        type: 'MultiLineString'
      };

      expect(() => GeoJSONMultiLineStringZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        coordinates: [
          [-124.11504035918227, 51.08084984848492],
          [-124.11504035918227, 51.08084984848492]
        ],
        type: 'MultiLineString'
      };

      expect(() => GeoJSONMultiLineStringZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONMultiPolygonZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        coordinates: [
          [
            [
              [-124.11504035918227, 51.08084984848492],
              [-124.11504035918227, 48.947203083932465],
              [-118.88808742345168, 48.947203083932465],
              [-118.88808742345168, 51.08084984848492],
              [-124.11504035918227, 51.08084984848492]
            ]
          ],
          [
            [
              [-124.11504035918227, 51.08084984848492],
              [-124.11504035918227, 48.947203083932465],
              [-118.88808742345168, 48.947203083932465],
              [-118.88808742345168, 51.08084984848492],
              [-124.11504035918227, 51.08084984848492]
            ]
          ]
        ],
        type: 'MultiPolygon'
      };

      expect(() => GeoJSONMultiPolygonZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        coordinates: [
          [
            [-124.11504035918227, 51.08084984848492],
            [-124.11504035918227, 48.947203083932465],
            [-118.88808742345168, 48.947203083932465],
            [-118.88808742345168, 51.08084984848492],
            [-124.11504035918227, 51.08084984848492]
          ]
        ],
        type: 'MultiPolygon'
      };

      expect(() => GeoJSONMultiPolygonZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONGeometryCollectionZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        type: 'GeometryCollection',
        geometries: [
          {
            coordinates: [-120.89455551309156, 50.55558184778528],
            type: 'Point'
          },
          {
            coordinates: [
              [-122.7523690343273, 50.14949756562072],
              [-121.50892156862892, 50.1424249906992]
            ],
            type: 'LineString'
          },
          {
            coordinates: [
              [
                [-124.11504035918227, 51.08084984848492],
                [-124.11504035918227, 48.947203083932465],
                [-118.88808742345168, 48.947203083932465],
                [-118.88808742345168, 51.08084984848492],
                [-124.11504035918227, 51.08084984848492]
              ]
            ],
            type: 'Polygon'
          },
          {
            coordinates: [
              [-120.89455551309156, 50.55558184778528],
              [-120.89455551309156, 50.55558184778528]
            ],
            type: 'MultiPoint'
          },
          {
            coordinates: [
              [
                [-122.7523690343273, 50.14949756562072],
                [-121.50892156862892, 50.1424249906992]
              ],
              [
                [-122.7523690343273, 50.14949756562072],
                [-121.50892156862892, 50.1424249906992]
              ]
            ],
            type: 'MultiLineString'
          },
          {
            coordinates: [
              [
                [
                  [-124.11504035918227, 51.08084984848492],
                  [-124.11504035918227, 48.947203083932465],
                  [-118.88808742345168, 48.947203083932465],
                  [-118.88808742345168, 51.08084984848492],
                  [-124.11504035918227, 51.08084984848492]
                ]
              ],
              [
                [
                  [-124.11504035918227, 51.08084984848492],
                  [-124.11504035918227, 48.947203083932465],
                  [-118.88808742345168, 48.947203083932465],
                  [-118.88808742345168, 51.08084984848492],
                  [-124.11504035918227, 51.08084984848492]
                ]
              ]
            ],
            type: 'MultiPolygon'
          }
        ]
      };

      expect(() => GeoJSONGeometryCollectionZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        type: 'FeatureCollection',
        geometries: [
          {
            coordinates: [-120.89455551309156, 50.55558184778528],
            type: 'Point'
          }
        ]
      };

      expect(() => GeoJSONGeometryCollectionZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONFeatureZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        type: 'Feature',
        geometry: {
          coordinates: [-120.89455551309156, 50.55558184778528],
          type: 'Point'
        },
        properties: {
          prop0: 'value0'
        }
      };

      expect(() => GeoJSONFeatureZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        type: 'Polygon',
        geometry: {
          coordinates: [-120.89455551309156, 50.55558184778528],
          type: 'Point'
        },
        properties: {
          prop0: 'value0'
        }
      };

      expect(() => GeoJSONFeatureZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONFeatureCollectionZodSchema', () => {
    it('validates and returns correct geo json', () => {
      const geoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { prop0: 'value0' },
            geometry: {
              coordinates: [-122.91259963675338, 49.37596881840895],
              type: 'Point'
            }
          },
          {
            type: 'Feature',
            properties: { prop0: 'value0' },
            geometry: {
              coordinates: [
                [-122.33078290142579, 49.52462898822321],
                [-122.82749139343922, 49.63533663294646]
              ],
              type: 'LineString'
            }
          },
          {
            type: 'Feature',
            properties: { prop0: 'value0' },
            geometry: {
              coordinates: [
                [
                  [-123.01165460668969, 49.64896702554316],
                  [-123.01165460668969, 49.27062822525298],
                  [-122.26659186866941, 49.27062822525298],
                  [-122.26659186866941, 49.64896702554316],
                  [-123.01165460668969, 49.64896702554316]
                ]
              ],
              type: 'Polygon'
            }
          }
        ]
      };

      expect(() => GeoJSONFeatureCollectionZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        type: 'Feature',
        geometry: {
          coordinates: [-120.89455551309156, 50.55558184778528],
          type: 'Point'
        },
        properties: {
          prop0: 'value0'
        }
      };

      expect(() => GeoJSONFeatureCollectionZodSchema.parse(geoJson)).to.throw();
    });
  });

  describe('GeoJSONZodSchema', () => {
    it('validates and returns correct geo json (FeatureCollection)', () => {
      const geoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { prop0: 'value0' },
            geometry: {
              coordinates: [-122.91259963675338, 49.37596881840895],
              type: 'Point'
            }
          },
          {
            type: 'Feature',
            properties: { prop0: 'value0' },
            geometry: {
              coordinates: [
                [-122.33078290142579, 49.52462898822321],
                [-122.82749139343922, 49.63533663294646]
              ],
              type: 'LineString'
            }
          },
          {
            type: 'Feature',
            properties: { prop0: 'value0' },
            geometry: {
              coordinates: [
                [
                  [-123.01165460668969, 49.64896702554316],
                  [-123.01165460668969, 49.27062822525298],
                  [-122.26659186866941, 49.27062822525298],
                  [-122.26659186866941, 49.64896702554316],
                  [-123.01165460668969, 49.64896702554316]
                ]
              ],
              type: 'Polygon'
            }
          }
        ]
      };

      expect(() => GeoJSONZodSchema.parse(geoJson)).not.to.throw();
    });

    it('validates and returns correct geo json (GeometryCollection)', () => {
      const geoJson = {
        type: 'GeometryCollection',
        geometries: [
          {
            coordinates: [-120.89455551309156, 50.55558184778528],
            type: 'Point'
          },
          {
            coordinates: [
              [-122.7523690343273, 50.14949756562072],
              [-121.50892156862892, 50.1424249906992]
            ],
            type: 'LineString'
          },
          {
            coordinates: [
              [
                [-124.11504035918227, 51.08084984848492],
                [-124.11504035918227, 48.947203083932465],
                [-118.88808742345168, 48.947203083932465],
                [-118.88808742345168, 51.08084984848492],
                [-124.11504035918227, 51.08084984848492]
              ]
            ],
            type: 'Polygon'
          },
          {
            coordinates: [
              [-120.89455551309156, 50.55558184778528],
              [-120.89455551309156, 50.55558184778528]
            ],
            type: 'MultiPoint'
          },
          {
            coordinates: [
              [
                [-122.7523690343273, 50.14949756562072],
                [-121.50892156862892, 50.1424249906992]
              ],
              [
                [-122.7523690343273, 50.14949756562072],
                [-121.50892156862892, 50.1424249906992]
              ]
            ],
            type: 'MultiLineString'
          },
          {
            coordinates: [
              [
                [
                  [-124.11504035918227, 51.08084984848492],
                  [-124.11504035918227, 48.947203083932465],
                  [-118.88808742345168, 48.947203083932465],
                  [-118.88808742345168, 51.08084984848492],
                  [-124.11504035918227, 51.08084984848492]
                ]
              ],
              [
                [
                  [-124.11504035918227, 51.08084984848492],
                  [-124.11504035918227, 48.947203083932465],
                  [-118.88808742345168, 48.947203083932465],
                  [-118.88808742345168, 51.08084984848492],
                  [-124.11504035918227, 51.08084984848492]
                ]
              ]
            ],
            type: 'MultiPolygon'
          }
        ]
      };

      expect(() => GeoJSONZodSchema.parse(geoJson)).not.to.throw();
    });

    it('validates and returns correct geo json (Polygon)', () => {
      const geoJson = {
        coordinates: [
          [
            [-124.11504035918227, 51.08084984848492],
            [-124.11504035918227, 48.947203083932465],
            [-118.88808742345168, 48.947203083932465],
            [-118.88808742345168, 51.08084984848492],
            [-124.11504035918227, 51.08084984848492]
          ]
        ],
        type: 'Polygon'
      };

      expect(() => GeoJSONZodSchema.parse(geoJson)).not.to.throw();
    });

    it('throws an exception on incorrect geo json', () => {
      const geoJson = {
        type: 'Polygon',
        geometry: {
          coordinates: [-120.89455551309156, 50.55558184778528],
          type: 'Point'
        },
        properties: {
          prop0: 'value0'
        }
      };

      expect(() => GeoJSONZodSchema.parse(geoJson)).to.throw();
    });
  });
});
