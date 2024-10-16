import { OpenAPIV3 } from 'openapi-types';

/**
 * Schema for system alerts
 *
 */
export const systemAlertSchema: OpenAPIV3.SchemaObject = {
    type: 'object',
    description: 'Schema defining alerts created by system administrators.',
    required: ['name', 'message', 'data', 'type'],
    properties: {
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
        type: 'string',
        nullable: true
      }
    }
  
};
