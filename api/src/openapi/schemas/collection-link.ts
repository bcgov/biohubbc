import { OpenAPIV3 } from 'openapi-types';

export const CollectionLinkSchema: OpenAPIV3.SchemaObject = {
  title: 'Collection Link',
  type: 'object',
  additionalProperties: false,
  required: ['collection_links_id', 'name', 'url', 'collection_id', 'create_date', 'create_user'],
  properties: {
    collection_link_id: {
      type: 'integer',
      minimum: 1,
      description: 'Collection link ID'
    },
    name: {
      type: 'string',
      maxLength: 100,
      description: 'Collection link name'
    },
    description: {
      type: 'string',
      maxLength: 500,
      nullable: true,
      description: 'Collection link description'
    },
    url: {
      type: 'string',
      maxLength: 500,
      format: 'uri',
      description: 'Collection link URL'
    },
    collection_id: {
      type: 'integer',
      minimum: 1,
      description: 'Collection ID this link belongs to'
    },
    record_end_date: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      description: 'Record end date'
    },
    create_date: {
      type: 'string',
      format: 'date-time',
      description: 'Record creation date'
    },
    create_user: {
      type: 'integer',
      minimum: 1,
      description: 'User ID that created the record'
    }
  }
};

export const CreateCollectionLinkSchema: OpenAPIV3.SchemaObject = {
  title: 'Create Collection Link',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'url'],
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
      description: 'Collection link name'
    },
    description: {
      type: 'string',
      maxLength: 500,
      description: 'Collection link description'
    },
    url: {
      type: 'string',
      maxLength: 500,
      format: 'uri',
      description: 'Collection link URL'
    }
  }
};

export const UpdateCollectionLinkSchema: OpenAPIV3.SchemaObject = {
  title: 'Update Collection Link',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'url'],
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
      description: 'Collection link name'
    },
    description: {
      type: 'string',
      maxLength: 500,
      description: 'Collection link description'
    },
    url: {
      type: 'string',
      maxLength: 500,
      format: 'uri',
      description: 'Collection link URL'
    }
  }
};

export const EndCollectionLinkSchema: OpenAPIV3.SchemaObject = {
  title: 'End Collection Link',
  type: 'object',
  additionalProperties: false,
  required: ['record_end_date'],
  properties: {
    record_end_date: {
      type: 'string',
      format: 'date-time',
      description: 'Record end date (typically current timestamp)'
    }
  }
};
