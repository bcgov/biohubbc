import { OpenAPIV3 } from 'openapi-types';
import { GeoJSONFeatureCollection } from './geoJson';

const GeoJSONFeatureCollectionFeaturesItems = (
  GeoJSONFeatureCollection.properties?.features as OpenAPIV3.ArraySchemaObject
)?.items as OpenAPIV3.SchemaObject;

export const GeoJSONTelemetryPointsAPISchema: OpenAPIV3.SchemaObject = {
  ...GeoJSONFeatureCollection,
  properties: {
    ...GeoJSONFeatureCollection.properties,
    features: {
      type: 'array',
      items: {
        ...GeoJSONFeatureCollectionFeaturesItems,
        properties: {
          ...GeoJSONFeatureCollectionFeaturesItems?.properties,
          properties: {
            type: 'object',
            additionalProperties: false,
            required: ['collar_id', 'device_id', 'date_recorded', 'deployment_id', 'critter_id'],
            properties: {
              collar_id: {
                type: 'string',
                format: 'uuid'
              },
              device_id: {
                type: 'integer'
              },
              elevation: {
                type: 'number',
                nullable: true
              },
              frequency: {
                type: 'number',
                nullable: true
              },
              critter_id: {
                type: 'string',
                format: 'uuid'
              },
              date_recorded: {
                type: 'string'
              },
              deployment_id: {
                type: 'string',
                format: 'uuid'
              },
              device_status: {
                type: 'string',
                nullable: true
              },
              device_vendor: {
                type: 'string',
                nullable: true
              },
              frequency_unit: {
                type: 'number',
                nullable: true
              },
              wlh_id: {
                type: 'string',
                nullable: true
              },
              animal_id: {
                type: 'string',
                nullable: true
              },
              sex: {
                type: 'string'
              },
              taxon: {
                type: 'string'
              },
              collection_units: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    collection_unit_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    unit_name: {
                      type: 'string'
                    },
                    collection_category_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    category_name: {
                      type: 'string'
                    }
                  }
                }
              },
              mortality_timestamp: {
                type: 'string',
                nullable: true
              },
              _merged: {
                type: 'boolean'
              },
              map_colour: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
};

export const GeoJSONTelemetryTracksAPISchema: OpenAPIV3.SchemaObject = {
  ...GeoJSONFeatureCollection,
  properties: {
    ...GeoJSONFeatureCollection.properties,
    features: {
      type: 'array',
      items: {
        ...GeoJSONFeatureCollectionFeaturesItems,
        properties: {
          ...GeoJSONFeatureCollectionFeaturesItems?.properties,
          properties: {
            type: 'object',
            additionalProperties: false,
            required: ['critter_id', 'deployment_id'],
            properties: {
              critter_id: {
                type: 'string',
                format: 'uuid'
              },
              deployment_id: {
                type: 'string',
                format: 'uuid'
              },
              map_colour: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
};
