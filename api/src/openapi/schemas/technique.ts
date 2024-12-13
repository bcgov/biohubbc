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

export const techniqueVantagesSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  description: 'Vantages from which a method is done, like water, air, or ground.',
  items: {
    type: 'object',
    required: ['vantage_mode_method_id', 'vantage_id'],
    additionalProperties: false,
    properties: {
      method_technique_vantage_mode_id: {
        type: 'integer',
        minimum: 1
      },
      vantage_mode_method_id: {
        type: 'integer',
        minimum: 1
      },
      vantage_id: {
        type: 'integer',
        minimum: 1
      }
    }
  }
};

export const techniqueSimpleViewSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['method_technique_id', 'name', 'description', 'attractants'],
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
      description: 'Description of the technique.',
      nullable: true
    },
    attractants: techniqueAttractantsSchema
  }
};

export const techniqueCreateSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: [
    'name',
    'description',
    'method_lookup_id',
    'distance_threshold',
    'attractants',
    'attributes',
    'vantage_mode_methods'
  ],
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
    attributes: techniqueAttributesSchema,
    vantage_mode_methods: techniqueVantagesSchema
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

export const vantageReferenceRecordsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  description: 'Vantage reference records.',
  items: {
    type: 'object',
    description: 'Vantage reference record and its associated vantage modes.',
    required: ['vantage_id', 'name', 'description', 'vantage_modes'],
    additionalProperties: false,
    properties: {
      vantage_id: {
        type: 'integer',
        minimum: 1
      },
      name: {
        type: 'string'
      },
      description: {
        type: 'string',
        nullable: true
      },
      vantage_modes: {
        type: 'array',
        description: 'Supported vantage mode for the vantage record.',
        items: {
          type: 'object',
          required: ['vantage_mode_method_id', 'name', 'vantage_id', 'description'],
          additionalProperties: false,
          properties: {
            vantage_mode_method_id: {
              type: 'integer',
              description: 'The primary key of the vantage mode option.'
            },
            vantage_id: {
              type: 'integer',
              description: 'The vantage of the mode.'
            },
            name: {
              type: 'string',
              description: 'The name of the vantage mode option.'
            },
            description: {
              type: 'string',
              description: 'The description of the mode option.'
            }
          }
        }
      }
    }
  }
};
