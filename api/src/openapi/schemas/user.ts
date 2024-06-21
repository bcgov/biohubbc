import { OpenAPIV3 } from 'openapi-types';

export const updateCreateUserPropertiesSchema: OpenAPIV3.SchemaObject = {
  properties: {
    create_user: {
      description: 'The user who created the record.',
      type: 'integer',
      minimum: 1
    },
    create_date: {
      description: 'The date the record was created.',
      type: 'string'
    },
    update_user: {
      description: 'The user who last updated the record.',
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    update_date: {
      description: 'The date the record was last updated.',
      type: 'string',
      nullable: true
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};

export const systemUserSchema: OpenAPIV3.SchemaObject = {
  title: 'User Response Object',
  type: 'object',
  additionalProperties: false,
  required: [
    'system_user_id',
    'user_identifier',
    'user_guid',
    'identity_source',
    'record_end_date',
    'role_ids',
    'role_names',
    'email',
    'display_name',
    'given_name',
    'family_name',
    'agency'
  ],
  properties: {
    system_user_id: {
      description: 'user id',
      type: 'integer',
      minimum: 1
    },
    user_identifier: {
      description: 'The unique user identifier',
      type: 'string'
    },
    user_guid: {
      type: 'string',
      description: 'The GUID for the user.',
      nullable: true
    },
    identity_source: {
      description: 'The source of the user identity',
      type: 'string'
    },
    record_end_date: {
      type: 'string',
      description: 'Determines if the user record has expired',
      nullable: true
    },
    role_ids: {
      description: 'list of role ids for the user',
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    role_names: {
      description: 'list of role names for the user',
      type: 'array',
      items: {
        type: 'string'
      }
    },
    email: {
      type: 'string'
    },
    display_name: {
      type: 'string'
    },
    given_name: {
      type: 'string',
      nullable: true
    },
    family_name: {
      type: 'string',
      nullable: true
    },
    agency: {
      type: 'string',
      nullable: true
    }
  }
};

export const projectUserSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'project_participation_id',
    'project_id',
    'system_user_id',
    'project_role_ids',
    'project_role_names',
    'project_role_permissions'
  ],
  properties: {
    project_participation_id: {
      type: 'number'
    },
    project_id: {
      type: 'number'
    },
    system_user_id: {
      type: 'number'
    },
    project_role_ids: {
      type: 'array',
      items: {
        type: 'number'
      }
    },
    project_role_names: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    project_role_permissions: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

export const projectAndSystemUserSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'project_participation_id',
    'project_id',
    'system_user_id',
    'project_role_ids',
    'project_role_names',
    'project_role_permissions'
  ],
  properties: {
    project_participation_id: {
      type: 'number'
    },
    project_id: {
      type: 'number'
    },
    system_user_id: {
      type: 'number'
    },
    project_role_ids: {
      type: 'array',
      items: {
        type: 'number'
      }
    },
    project_role_names: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    project_role_permissions: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    user_identifier: {
      description: 'The unique user identifier',
      type: 'string'
    },
    user_guid: {
      type: 'string',
      description: 'The GUID for the user.',
      nullable: true
    },
    identity_source: {
      description: 'The source of the user identity',
      type: 'string'
    },
    record_end_date: {
      type: 'string',
      description: 'Determines if the user record has expired',
      nullable: true
    },
    role_ids: {
      description: 'list of role ids for the user',
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    role_names: {
      description: 'list of role names for the user',
      type: 'array',
      items: {
        type: 'string'
      }
    },
    email: {
      type: 'string'
    },
    display_name: {
      type: 'string'
    },
    given_name: {
      type: 'string',
      nullable: true
    },
    family_name: {
      type: 'string',
      nullable: true
    },
    agency: {
      type: 'string',
      nullable: true
    }
  }
};

export const surveyParticipationAndSystemUserSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['system_user_id', 'survey_job_name'],
  properties: {
    survey_participation_id: {
      type: 'number'
    },
    survey_id: {
      type: 'number'
    },
    system_user_id: {
      type: 'number'
    },
    survey_job_id: {
      type: 'number'
    },
    survey_job_name: {
      type: 'string'
    },
    user_identifier: {
      description: 'The unique user identifier',
      type: 'string'
    },
    user_guid: {
      type: 'string',
      description: 'The GUID for the user.',
      nullable: true
    },
    identity_source: {
      description: 'The source of the user identity',
      type: 'string'
    },
    record_end_date: {
      type: 'string',
      description: 'Determines if the user record has expired',
      nullable: true
    },
    role_ids: {
      description: 'list of role ids for the user',
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    role_names: {
      description: 'list of role names for the user',
      type: 'array',
      items: {
        type: 'string'
      }
    },
    email: {
      type: 'string'
    },
    display_name: {
      type: 'string'
    },
    given_name: {
      type: 'string',
      nullable: true
    },
    family_name: {
      type: 'string',
      nullable: true
    },
    agency: {
      type: 'string',
      nullable: true
    }
  }
};
