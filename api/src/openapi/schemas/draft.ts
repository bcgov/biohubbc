/**
 * Response object for creating/updating a draft
 */
export const draftResponseObject = {
  title: 'Draft Response Object',
  type: 'object',
  required: ['webform_draft_id', 'name', 'create_date', 'update_date'],
  properties: {
    webform_draft_id: {
      type: 'number'
    },
    name: {
      type: 'string',
      description: 'The name of the draft'
    },
    create_date: {
      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
      description: 'ISO 8601 date string for the date the draft was created'
    },
    update_date: {
      oneOf: [
        { type: 'object', nullable: true },
        { type: 'string', format: 'date' }
      ],
      description: 'ISO 8601 date string for the date the draft was updated'
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
