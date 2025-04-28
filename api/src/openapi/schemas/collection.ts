import { OpenAPIV3 } from 'openapi-types';

export const CreateCollectionParticipantSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['system_user_id', 'collection_role_name'],
  properties: {
    system_user_id: { type: 'number', description: 'Primary key of a system user to add to the collection' },
    collection_role_name: {
      type: 'string',
      enum: ['Admin', 'Member'],
      description: 'Name of a collection role for the participant'
    }
  }
};

export const CreateCollectionSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description', 'participants'],
  properties: {
    name: { type: 'string', description: 'The name of the collection to create' },
    description: { type: 'string', description: 'The description of the collection to create', nullable: true },
    participants: {
      type: 'array',
      description: 'List of users to add to the collection',
      minItems: 1,
      items: CreateCollectionParticipantSchema
    }
  }
};

export const UpdateCollectionSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    name: { type: 'string', description: 'The name of the collection to create' },
    description: { type: 'string', description: 'The description of the collection to create', nullable: true },
    participants: {
      type: 'array',
      description: 'List of users to add to the collection',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['system_user_id', 'collection_role_name'],
        properties: {
          system_user_id: { type: 'number', description: 'Primary key of a system user to add to the collection' },
          collection_role_name: {
            type: 'string',
            enum: ['Admin', 'Member'],
            description: 'Name of a collection role for the participant'
          }
        }
      }
    }
  }
};

export const CollectionAndSystemUserSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['collection_member_id', 'collection_id', 'system_user_id', 'collection_role_id', 'collection_role_name'],
  properties: {
    collection_member_id: {
      type: 'number'
    },
    collection_id: {
      type: 'number'
    },
    system_user_id: {
      type: 'number'
    },
    collection_role_id: {
      type: 'number'
    },
    collection_role_name: {
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

export const GetCollectionSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['collection_id', 'name', 'description', 'participants'],
  properties: {
    collection_id: { type: 'integer', description: 'Primary key of the collection' },
    name: { type: 'string', description: 'The name of the collection to create' },
    description: { type: 'string', description: 'The description of the collection to create', nullable: true },
    participants: {
      type: 'array',
      description: 'List of users to add to the collection',
      items: CollectionAndSystemUserSchema
    }
  }
};
