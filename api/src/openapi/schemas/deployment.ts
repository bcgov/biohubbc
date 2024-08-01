import { OpenAPIV3 } from 'openapi-types';
import { GeoJSONFeatureCollection } from './geoJson';

export const getDeploymentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  // TODO: REMOVE unnecessary columns from BCTW response
  // additionalProperties: false,
  properties: {
    deployment_id: {
      type: 'integer',
      description: 'Id of the deployment in the Survey'
    },
    bctw_deployment_id: {
      type: 'string',
      format: 'uuid',
      description: 'Id of the deployment in BCTW. May match multiple records in BCTW'
    },
    assignment_id: {
      type: 'string',
      format: 'uuid'
    },
    collar_id: { type: 'string', description: 'Id of the collar in BCTW' },
    critter_id: { type: 'integer', minimum: 1, description: 'Id of the critter in the Survey' },
    critterbase_critter_id: {
      type: 'string',
      format: 'uuid',
      description: 'Id of the critter in Critterbase'
    },
    device_id: { type: 'integer', description: 'Id of the device, as reported by users. Not unique.' },
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
    },
    critterbase_end_date: {
      type: 'string',
      nullable: true
    },
    critterbase_end_time: {
      type: 'string',
      nullable: true
    }
  }
};

export const postDeploymentSchema: OpenAPIV3.SchemaObject = {
  title: 'Deploy device request object',
  type: 'object',
  additionalProperties: false,
  properties: {
    critter_id: {
      type: 'integer'
    },
    device_id: {
      type: 'integer'
    },
    frequency: {
      type: 'number'
    },
    frequency_unit: {
      type: 'string'
    },
    device_make: {
      type: 'string'
    },
    device_model: {
      type: 'string'
    },
    critterbase_start_capture_id: {
      type: 'string',
      description: 'Critterbase capture record when the deployment started',
      format: 'uuid',
      nullable: true
    },
    critterbase_end_capture_id: {
      type: 'string',
      description: 'Critterbase capture record when the deployment ended',
      format: 'uuid',
      nullable: true
    },
    critterbase_end_mortality_id: {
      type: 'string',
      description: 'Critterbase mortality record when the deployment ended',
      format: 'uuid',
      nullable: true
    },
    attachment_end_date: {
      type: 'string',
      description: 'End date of the deployment, without time.',
      nullable: true
    },
    attachment_end_time: {
      type: 'string',
      description: 'End time of the deployment.',
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
                type: 'string',
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
