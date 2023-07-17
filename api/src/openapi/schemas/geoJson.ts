/**
 * GeoJSON schemas derived from {@link https://geojson.org/schema/GeoJSON.json}.
 *
 * Modifications made to match OpenAPI V3:
 * - Removed root `$schema` and `$id` properties.
 * - Replaced `oneOf` option `{type: 'null'}` with `nullable: true`
 */

import { OpenAPIV3 } from 'openapi-types';

export const GeoJSONPoint: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON Point',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: {
      type: 'string',
      enum: ['Point']
    },
    coordinates: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'number'
      }
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSONLineString: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON LineString',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: {
      type: 'string',
      enum: ['LineString']
    },
    coordinates: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'array',
        minItems: 2,
        items: {
          type: 'number'
        }
      }
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSONPolygon: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON Polygon',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: {
      type: 'string',
      enum: ['Polygon']
    },
    coordinates: {
      type: 'array',
      items: {
        type: 'array',
        minItems: 4,
        items: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'number'
          }
        }
      }
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSONMultiPoint: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON MultiPoint',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: {
      type: 'string',
      enum: ['MultiPoint']
    },
    coordinates: {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        items: {
          type: 'number'
        }
      }
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSONMultiLineString: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON MultiLineString',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: {
      type: 'string',
      enum: ['MultiLineString']
    },
    coordinates: {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        items: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'number'
          }
        }
      }
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSONMultiPolygon: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON MultiPolygon',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: {
      type: 'string',
      enum: ['MultiPolygon']
    },
    coordinates: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'array',
          minItems: 4,
          items: {
            type: 'array',
            minItems: 2,
            items: {
              type: 'number'
            }
          }
        }
      }
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSONGeometryCollection: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON GeometryCollection',
  type: 'object',
  required: ['type', 'geometries'],
  properties: {
    type: {
      type: 'string',
      enum: ['GeometryCollection']
    },
    geometries: {
      type: 'array',
      items: {
        oneOf: [
          GeoJSONPoint,
          GeoJSONLineString,
          GeoJSONPolygon,
          GeoJSONMultiPoint,
          GeoJSONMultiLineString,
          GeoJSONMultiPolygon
        ]
      }
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSONFeature: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON Feature',
  type: 'object',
  required: ['type', 'properties', 'geometry'],
  properties: {
    type: {
      type: 'string',
      enum: ['Feature']
    },
    id: {
      oneOf: [
        {
          type: 'number'
        },
        {
          type: 'string'
        }
      ]
    },
    properties: {
      type: 'object',
      nullable: true
    },
    geometry: {
      oneOf: [
        GeoJSONPoint,
        GeoJSONLineString,
        GeoJSONPolygon,
        GeoJSONMultiPoint,
        GeoJSONMultiLineString,
        GeoJSONMultiPolygon,
        GeoJSONGeometryCollection
      ],
      nullable: true
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSONFeatureCollection: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON FeatureCollection',
  type: 'object',
  required: ['type', 'features'],
  properties: {
    type: {
      type: 'string',
      enum: ['FeatureCollection']
    },
    features: {
      type: 'array',
      items: {
        title: 'GeoJSON Feature',
        type: 'object',
        required: ['type', 'properties', 'geometry'],
        properties: {
          type: {
            type: 'string',
            enum: ['Feature']
          },
          id: {
            oneOf: [
              {
                type: 'number'
              },
              {
                type: 'string'
              }
            ]
          },
          properties: {
            type: 'object',
            nullable: true
          },
          geometry: {
            oneOf: [
              GeoJSONPoint,
              GeoJSONLineString,
              GeoJSONPolygon,
              GeoJSONMultiPoint,
              GeoJSONMultiLineString,
              GeoJSONMultiPolygon,
              GeoJSONGeometryCollection
            ],
            nullable: true
          },
          bbox: {
            type: 'array',
            minItems: 4,
            items: {
              type: 'number'
            }
          }
        }
      }
    },
    bbox: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'number'
      }
    }
  }
};

export const GeoJSON: OpenAPIV3.SchemaObject = {
  title: 'GeoJSON',
  oneOf: [
    GeoJSONPoint,
    GeoJSONLineString,
    GeoJSONPolygon,
    GeoJSONMultiPoint,
    GeoJSONMultiLineString,
    GeoJSONMultiPolygon,
    GeoJSONGeometryCollection,
    GeoJSONFeature
  ]
};
