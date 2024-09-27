import { OpenAPIV3 } from 'openapi-types';

export const AllTelemetrySchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'deployment_id',
    'latitude',
    'longitude',
    'acquisition_date',
    'telemetry_type',
    'telemetry_id',
    'telemetry_manual_id'
  ],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description:
        'The unique identifier for the telemetry point. Will match whichever of telemetry_id or telemetry_manual_id is not null.'
    },
    deployment_id: {
      type: 'string',
      format: 'uuid',
      description: 'The unique identifier for the deployment that the telemetry point is associated with.'
    },
    latitude: {
      type: 'number',
      description: 'The latitude of the telemetry point.'
    },
    longitude: {
      type: 'number',
      description: 'The longitude of the telemetry point.'
    },
    acquisition_date: {
      type: 'string'
    },
    telemetry_type: {
      type: 'string',
      description: "The type of telemetry point. Will either be 'MANUAL' or the name of the vendor."
    },
    telemetry_id: {
      type: 'string',
      format: 'uuid',
      nullable: true,
      description:
        "The unique identifier for the telemetry point. Will only be non-null if telemetry_type is not 'MANUAL'."
    },
    telemetry_manual_id: {
      type: 'string',
      format: 'uuid',
      nullable: true,
      description: "The unique identifier for the telemetry point. Will only be non-null if telemetry_type is 'MANUAL'."
    }
  }
};
