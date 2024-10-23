import { OpenAPIV3 } from 'openapi-types';

/**
 * Schema for system alerts
 *
 */
export const systemAlertSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Schema defining alerts created by system administrators.',
  required: ['alert_id', 'name', 'message', 'data', 'alert_type_id', 'record_end_date', 'severity'],
  properties: {
    alert_id: {
      type: 'integer',
      minimum: 1,
      description: 'Primary key of the alert',
    },
    name: {
      description: 'Name to display as the title of the alert',
      type: 'string'
    },
    message: {
      description: 'Message to display on the alert',
      type: 'string'
    },
    alert_type_id: {
      description: 'Type of the alert, controlling how it is displayed or actioned.',
      type: 'number'
    },
    severity: {
      description: 'Message to display on the alert',
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
    }
  }
};


/**
 * Schema for system alerts
 *
 */
export const systemAlertCreateSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Schema defining alerts created by system administrators.',
  required: ['name', 'message', 'data', 'alert_type_id', 'record_end_date', 'severity'],
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
      description: 'Type of the alert, controlling how it is displayed or actioned.',
      type: 'number'
    },
    severity: {
      description: 'Message to display on the alert',
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
    }
  }
};
