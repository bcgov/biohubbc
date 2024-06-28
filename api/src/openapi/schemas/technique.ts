import { OpenAPIV3 } from 'openapi-types';

const techniqueAttractantsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  description: 'Attractants used to lure species during the technique.',
  items: {
    type: 'object',
    required: ['attractant_lookup_id'],
    additionalProperties: false,
    properties: {
      attractant_lookup_id: {
        type: 'integer',
        description: 'The ID of a known attractant type.'
      }
    }
  }
};

const techniqueAttributesSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Attributes of the technique.',
  required: ['qualitative_attributes', 'quantitative_attributes'],
  additionalProperties: false,
  properties: {
    quantitative_attributes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['method_technique_attribute_quantitative_id', 'method_lookup_attribute_quantitative_id', 'value'],
        additionalProperties: false,
        properties: {
          method_technique_attribute_quantitative_id: {
            type: 'integer',
            description: 'Primary key of the attribute.',
            nullable: true
          },
          method_lookup_attribute_quantitative_id: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of a known quantitative attribute.'
          },
          value: {
            type: 'number',
            description: 'The value of the quantitative attribute.'
          }
        }
      }
    },
    qualitative_attributes: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'method_technique_attribute_qualitative_id',
          'method_lookup_attribute_qualitative_id',
          'method_lookup_attribute_qualitative_option_id'
        ],
        additionalProperties: false,
        properties: {
          method_technique_attribute_qualitative_id: {
            type: 'integer',
            description: 'Primary key of the attribute',
            nullable: true
          },
          method_lookup_attribute_qualitative_id: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of a known qualitative attribute.'
          },
          method_lookup_attribute_qualitative_option_id: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of a known qualitative attribute option.'
          }
        }
      }
    }
  }
};

export const techniqueSimpleViewSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['method_technique_id', 'name', 'description'],
  additionalProperties: false,
  properties: {
    method_technique_id: {
      type: 'integer',
      description: 'Primary key of the technique'
    },
    name: {
      type: 'string',
      description: 'Name of the technique.'
    },
    description: {
      type: 'string',
      description: 'Description of the technique.'
    }
  }
};

export const techniqueCreateSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['name', 'description', 'method_lookup_id', 'distance_threshold', 'attractants', 'attributes'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      description: 'Name of the technique.'
    },
    description: {
      type: 'string',
      description: 'Description of the technique.',
      nullable: true
    },
    method_lookup_id: {
      type: 'integer',
      description: 'The ID of a known method type.',
      minimum: 1
    },
    distance_threshold: {
      type: 'number',
      description: 'Maximum detection distance (meters).',
      nullable: true
    },
    attractants: techniqueAttractantsSchema,
    attributes: techniqueAttributesSchema
  }
};

export const techniqueUpdateSchema: OpenAPIV3.SchemaObject = {
  ...techniqueCreateSchema,
  required: [...(techniqueCreateSchema.required ?? []), 'method_technique_id'],
  properties: {
    ...techniqueCreateSchema.properties,
    method_technique_id: {
      type: 'number',
      description: 'Primary key for the technique.'
    }
  }
};

export const techniqueViewSchema: OpenAPIV3.SchemaObject = {
  ...techniqueCreateSchema,
  required: [...(techniqueCreateSchema.required ?? []), 'method_technique_id'],
  properties: {
    ...techniqueCreateSchema.properties,
    method_technique_id: {
      type: 'number',
      description: 'Primary key for the technique.'
    }
  }
};
