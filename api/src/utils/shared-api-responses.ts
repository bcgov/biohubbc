import { WRITE_ROLES } from '../constants/roles';

export const getAttachmentApiResponseObject = (basicDescription: string, successDescription: string) => {
  return {
    description: basicDescription,
    tags: ['attachment'],
    security: [
      {
        Bearer: WRITE_ROLES
      }
    ],
    parameters: [
      {
        in: 'path',
        name: 'projectId',
        schema: {
          type: 'number'
        },
        required: true
      },
      {
        in: 'path',
        name: 'attachmentId',
        schema: {
          type: 'number'
        },
        required: true
      }
    ],
    responses: {
      200: {
        description: successDescription,
        content: {
          'text/plain': {
            schema: {
              type: 'number'
            }
          }
        }
      },
      401: {
        $ref: '#/components/responses/401'
      },
      default: {
        $ref: '#/components/responses/default'
      }
    }
  };
};
