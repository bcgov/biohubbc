import { OpenAPIV3 } from 'openapi-types';

/**
 * Base schema for system alerts
 */
const baseSystemAlertSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Schema defining alerts created by system administrators.',
  additionalProperties: false,
  properties: {
    name: {
      description: 'Name to display as the title of the alert',
      type: 'string'
    },
    message: {
      description: 'Message to display on the alert',
      type: 'string'
    },
    alert_type_id: {
      description: 'Type of the alert, controlling how it is displayed.',
      type: 'number'
    },
    severity: {
      description: 'Severity level of the alert',
      type: 'string',
      enum: ['info', 'success', 'warning', 'error']
    },
    data: {
      description: 'Data associated with the alert',
      type: 'object',
      nullable: true
    },
    record_end_date: {
      description: 'End date of the alert',
      type: 'string',
      nullable: true
    },
    create_date: {
      description: 'Timestamp for when the record was created',
      type: 'string'
    }
  }
};

/**
 * Schema for updating system alerts
 */
export const systemAlertPutSchema: OpenAPIV3.SchemaObject = {
  ...baseSystemAlertSchema,
  required: ['alert_id', 'name', 'message', 'data', 'alert_type_id', 'record_end_date', 'severity'],
  additionalProperties: false,
  properties: {
    ...baseSystemAlertSchema.properties,
    alert_id: {
      type: 'integer',
      minimum: 1,
      description: 'Primary key of the alert'
    }
  }
};

/**
 * Schema for getting system alerts
 */
export const systemAlertGetSchema: OpenAPIV3.SchemaObject = {
  ...baseSystemAlertSchema,
  required: [
    'alert_id',
    'name',
    'message',
    'data',
    'alert_type_id',
    'record_end_date',
    'severity',
    'status',
    'create_date'
  ],
  additionalProperties: false,
  properties: {
    ...systemAlertPutSchema.properties,
    status: {
      type: 'string',
      enum: ['active', 'expired'],
      description:
        'Status of the alert based on comparing the current date to record_end_date, calculated in the get query.'
    }
  }
};

/**
 * Schema for creating system alerts
 */
export const systemAlertCreateSchema: OpenAPIV3.SchemaObject = {
  ...baseSystemAlertSchema,
  additionalProperties: false,
  required: ['name', 'message', 'data', 'alert_type_id', 'record_end_date', 'severity']
};
