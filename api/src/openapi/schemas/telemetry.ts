import { OpenAPIV3 } from 'openapi-types';

export const surveyTelemetrySchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    deployment_id: { type: 'string', format: 'uuid' },
    telemetry_manual_id: { type: 'string', nullable: true },
    telemetry_id: { type: 'number', nullable: true },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    acquisition_date: { type: 'string' },
    telemetry_type: { type: 'string' }
  }
};
