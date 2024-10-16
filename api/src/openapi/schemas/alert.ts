import { OpenAPIV3 } from 'openapi-types';

/**
 * Schema for system alerts
 *
 */
export const systemAlertSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Schema defining alerts created by system administrators.',
  required: ['alert_id', 'name', 'message', 'data', 'type', 'record_end_date'],
  properties: {
    alert_id: {
      type: 'integer',
      minimum: 1,
      description: 'Primary key of the alert'
    },
    name: {
      description: 'Name to display as the title of the alert',
      type: 'string'
    },
    message: {
      description: 'Message to display on the alert',
      type: 'string'
    },
    type: {
      description: 'Type of the alert, controlling how it is displayed or actioned.',
      type: 'string'
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
    }
  }
};
