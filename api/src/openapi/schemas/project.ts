// TODO add descriptions to each property and define required fields
const project = {
  title: 'Activity Object',
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
    },
    create_date: {
      type: 'string'
    },
    create_user: {
      type: 'number'
    },
    update_date: {
      type: 'string'
    },
    update_user: {
      type: 'number'
    },
    revision_count: {
      type: 'number'
    }
  }
};

export const projectPostBody = {
  ...project
};

export const projectResponseBody = {
  ...project,
  properties: {
    id: {
      description: 'Project ID',
      type: 'number'
    },
    ...project.properties
  }
};
