import { OpenAPIV3 } from 'openapi-types';

export const deploymentSchema: OpenAPIV3.SchemaObject = {
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
    survey_critter_id: { type: 'integer', minimum: 1, description: 'Id of the critter in the Survey' },
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
