/**
 * Project endpoint post body openapi schema.
 *
 * TODO WIP - this object is not in any kind of final form and can change as needed.
 */
export const projectPostBody = {
  title: 'Project Post Object',
  type: 'object',
  required: ['project'],
  properties: {
    project: {
      title: 'Project Model Object',
      type: 'object',
      // required: [],
      properties: {
        name: {
          type: 'string'
        },
        objectives: {
          type: 'string'
        },
        scientific_collection_permit_number: {
          type: 'string'
        },
        management_recovery_action: {
          type: 'string'
        },
        location_description: {
          type: 'string'
        },
        start_date: {
          type: 'string'
        },
        end_date: {
          type: 'string'
        },
        results: {
          type: 'string'
        },
        caveats: {
          type: 'string'
        },
        comments: {
          type: 'string'
        }
      }
    },
    proponent: {
      title: 'Proponent Model Object',
      type: 'object',
      properties: {}
    },
    agency: {
      title: 'Agency Model Object',
      type: 'object',
      properties: {}
    },
    funding: {
      title: 'Funding Model Object',
      type: 'object',
      properties: {}
    }
  }
};

/**
 * Project endpoint response body openapi schema.
 */
export const projectResponseBody = {
  title: 'Project Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
