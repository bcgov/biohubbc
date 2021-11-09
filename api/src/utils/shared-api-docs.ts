import { projectFundingSourcePostRequestObject } from '../openapi/schemas/project-funding-source';

export const attachmentApiDocObject = (basicDescription: string, successDescription: string) => {
  return {
    description: basicDescription,
    tags: ['attachment'],
    security: [
      {
        Bearer: []
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

export const deleteFundingSourceApiDocObject = (basicDescription: string, successDescription: string) => {
  return {
    description: basicDescription,
    tags: ['funding-sources'],
    security: [
      {
        Bearer: []
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
        name: 'pfsId',
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

export const addFundingSourceApiDocObject = (basicDescription: string, successDescription: string) => {
  return {
    description: basicDescription,
    tags: ['funding-sources'],
    security: [
      {
        Bearer: []
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
      }
    ],
    requestBody: {
      description: 'Add funding source request object.',
      content: {
        'application/json': {
          schema: {
            ...(projectFundingSourcePostRequestObject as object)
          }
        }
      }
    },
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
