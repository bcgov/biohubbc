/**
 * Permit no sampling endpoint post body openapi schema.
 */
export const permitNoSamplingPostBody = {
  title: 'Non-Sampling Permit Post Object',
  type: 'object',
  required: ['coordinator', 'permit'],
  properties: {
    coordinator: {
      title: 'Coordinator',
      type: 'object',
      required: ['first_name', 'last_name', 'email_address', 'coordinator_agency'],
      properties: {
        first_name: {
          type: 'string'
        },
        last_name: {
          type: 'string'
        },
        email_address: {
          type: 'string'
        },
        coordinator_agency: {
          type: 'string'
        },
        share_contact_details: {
          type: 'string',
          enum: ['true', 'false']
        }
      }
    },
    permit: {
      title: 'Non-sampling permits',
      type: 'object',
      required: ['permits'],
      properties: {
        permits: {
          type: 'array',
          items: {
            title: 'Non-sampling permit',
            type: 'object',
            required: ['permit_number'],
            additionalProperties: true,
            properties: {
              permit_number: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Permit no sampling endpoint response body openapi schema.
 */
export const permitNoSamplingResponseBody = {
  title: 'Permit no sampling Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    ids: {
      type: 'array',
      title: 'Permit no sampling ids',
      items: {
        type: 'number'
      }
    }
  }
};
