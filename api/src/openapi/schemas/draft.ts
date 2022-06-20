/**
 * Response object for creating/updating a draft
 */
export const draftResponseObject = {
  title: 'Draft Response Object',
  type: 'object',
  required: ['id', 'name', 'date'],
  properties: {
    id: {
      type: 'number'
    },
    name: {
      type: 'string',
      description: 'The name of the draft'
    },
    date: {
      description: 'The date this draft was last updated or created',
      oneOf: [{ type: 'string', format: 'date' }, { type: 'object' }]
    }
  }
};

/**
 * Response object for getting a draft
 */
export const draftGetResponseObject = {
  title: 'Draft Get Response Object',
  type: 'object',
  required: ['id', 'name', 'data'],
  properties: {
    id: {
      type: 'number'
    },
    name: {
      type: 'string',
      description: 'The name of the draft'
    },
    data: {
      title: 'JSON data associated with the draft',
      type: 'object'
    }
  }
};
