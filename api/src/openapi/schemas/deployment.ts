import { OpenAPIV3 } from 'openapi-types';
import { GeoJSONFeatureCollection } from './geoJson';

export const getDeploymentSchema: OpenAPIV3.SchemaObject = {
  title: 'Deployment',
  type: 'object',
  // TODO: REMOVE unnecessary columns from BCTW response
  additionalProperties: false,
  required: [
    // BCTW properties
    'assignment_id',
    'collar_id',
    'attachment_start_date',
    'attachment_start_time',
    'attachment_end_date',
    'attachment_end_time',
    'bctw_deployment_id',
    'device_id',
    'device_make',
    'device_model',
    'frequency',
    'frequency_unit',
    // SIMS properties
    'deployment_id',
    'critter_id',
    'critterbase_critter_id',
    'critterbase_start_capture_id',
    'critterbase_end_capture_id',
    'critterbase_end_mortality_id'
  ],
  properties: {
    // BCTW properties
    assignment_id: {
      type: 'string',
      format: 'uuid'
    },
    collar_id: {
      type: 'string',
      description: 'Id of the collar in BCTW'
    },
    attachment_start_date: {
      type: 'string',
      description: 'start date of the deployment.'
    },
    attachment_start_time: {
      type: 'string',
      description: 'start time of the deployment.'
    },
    attachment_end_date: {
      type: 'string',
      description: 'End date of the deployment.',
      nullable: true
    },
    attachment_end_time: {
      type: 'string',
      description: 'End time of the deployment.',
      nullable: true
    },
    bctw_deployment_id: {
      type: 'string',
      format: 'uuid',
      description: 'Id of the deployment in BCTW. May match multiple records in BCTW'
    },
    device_id: {
      type: 'integer',
      description: 'Id of the device, as reported by users. Not unique.'
    },
    device_make: {
      type: 'number',
      nullable: true
    },
    device_model: {
      type: 'string',
      nullable: true
    },
    frequency: {
      type: 'number',
      nullable: true
    },
    frequency_unit: {
      type: 'number',
      nullable: true
    },
    // SIMS properties
    deployment_id: {
      type: 'integer',
      description: 'Id of the deployment in the Survey.'
    },
    critter_id: {
      type: 'integer',
      minimum: 1,
      description: 'Id of the critter in the Survey'
    },
    critterbase_critter_id: {
      type: 'string',
      format: 'uuid',
      description: 'Id of the critter in Critterbase.'
    },
    critterbase_start_capture_id: {
      type: 'string'
    },
    critterbase_end_capture_id: {
      type: 'string',
      nullable: true
    },
    critterbase_end_mortality_id: {
      type: 'string',
      nullable: true
    }
  }
};

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
