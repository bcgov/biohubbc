import { OpenAPIV3 } from 'openapi-types';

/**
 * Normalized Telemetry Schema
 *
 * @see telemetry-vendor-repository.interface.ts
 */
export const TelemetrySchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'telemetry_id',
    'deployment_id',
    'critter_id',
    'vendor',
    'serial',
    'acquisition_date',
    'latitude',
    'longitude',
    'elevation',
    'temperature'
  ],
  properties: {
    telemetry_id: {
      type: 'string',
      format: 'uuid',
      description: 'The unique identifier for the telemetry point.'
    },
    deployment_id: {
      type: 'integer',
      description: 'The unique identifier for the deployment that the telemetry point is associated with.'
    },
    critter_id: {
      type: 'integer',
      description: 'The unique identifier for the critter that the telemetry point is associated with.'
    },
    vendor: {
      type: 'string',
      description: 'The vendor of the telemetry point.'
    },
    serial: {
      type: 'string',
      description: 'The serial number of the telemetry device.'
    },
    acquisition_date: {
      type: 'string',
      description: 'The date the telemetry point was acquired.'
    },
    latitude: {
      type: 'number',
      description: 'The latitude of the telemetry point.',
      nullable: true
    },
    longitude: {
      type: 'number',
      description: 'The longitude of the telemetry point.',
      nullable: true
    },
    elevation: {
      type: 'number',
      description: 'The elevation of the telemetry point.',
      nullable: true
    },
    temperature: {
      type: 'number',
      description: 'The temperature of the telemetry point.',
      nullable: true
    }
  }
};

/**
 * @deprecated Use TelemetrySchema instead
 */
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
