import { OpenAPIV3 } from 'openapi-types';
import { updateCreateUserPropertiesSchema } from './user';

export const surveyDetailsSchema: OpenAPIV3.SchemaObject = {
  title: 'survey response object',
  type: 'object',
  additionalProperties: false,
  required: ['survey_name', 'start_date', 'survey_types', 'progress_id'],
  properties: {
    id: {
      description: 'Survey id',
      type: 'integer',
      minimum: 1
    },
    project_id: {
      description: 'Project id',
      type: 'integer',
      minimum: 1
    },
    uuid: {
      description: 'Survey uuid',
      type: 'string',
      format: 'uuid',
      nullable: true
    },
    survey_name: {
      description: 'Survey name',
      type: 'string'
    },
    start_date: {
      description: 'Survey start date',
      type: 'string',
      format: 'date'
    },
    end_date: {
      description: 'Survey end date',
      type: 'string',
      nullable: true
    },
    progress_id: {
      type: 'integer'
    },
    survey_types: {
      description: 'Survey types',
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};

export const surveyFundingSourceSchema: OpenAPIV3.SchemaObject = {
  title: 'survey funding source response object',
  type: 'object',
  additionalProperties: false,
  required: ['survey_funding_source_id', 'survey_id', 'funding_source_id', 'amount'],
  properties: {
    survey_funding_source_id: {
      description: 'Survey funding source id',
      type: 'integer',
      minimum: 1
    },
    survey_id: {
      description: 'Survey id',
      type: 'integer',
      minimum: 1
    },
    funding_source_id: {
      description: 'Funding source id',
      type: 'integer',
      minimum: 1
    },
    amount: {
      description: 'Funding source amount',
      type: 'number',
      minimum: 0
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    },
    funding_source_name: {
      description: 'Funding source name',
      type: 'string'
    },
    start_date: {
      description: 'Funding source start date',
      type: 'string',
      format: 'date',
      nullable: true
    },
    end_date: {
      description: 'Funding source end date',
      type: 'string',
      format: 'date',
      nullable: true
    },
    description: {
      description: 'Funding source description',
      type: 'string',
      nullable: true
    }
  }
};

export const focalSpeciesSchema: OpenAPIV3.SchemaObject = {
  title: 'focal species response object',
  type: 'object',
  additionalProperties: false,
  properties: {
    tsn: {
      description: 'Taxonomy tsn',
      type: 'number'
    },
    commonName: {
      description: 'Taxonomy common name',
      type: 'string',
      nullable: true
    },
    scientificName: {
      description: 'Taxonomy scientific name',
      type: 'string'
    }
  }
};

export const ancillarySpeciesSchema: OpenAPIV3.SchemaObject = {
  title: 'ancillary species response object',
  type: 'object',
  additionalProperties: false,
  properties: {
    tsn: {
      description: 'Taxonomy tsn',
      type: 'number'
    },
    commonName: {
      description: 'Taxonomy common name',
      type: 'string',
      nullable: true
    },
    scientificName: {
      description: 'Taxonomy scientific name',
      type: 'string'
    }
  }
};

export const surveySpeciesSchema: OpenAPIV3.SchemaObject = {
  description: 'Survey Species',
  type: 'object',
  additionalProperties: false,
  required: ['focal_species', 'ancillary_species'],
  properties: {
    ancillary_species: {
      nullable: true,
      type: 'array',
      items: ancillarySpeciesSchema
    },
    focal_species: {
      type: 'array',
      items: focalSpeciesSchema
    }
  }
};

export const surveyPermitSchema: OpenAPIV3.SchemaObject = {
  title: 'permit response object',
  type: 'object',
  additionalProperties: false,
  required: ['permits'],
  properties: {
    permits: {
      description: 'Permits',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          permit_id: {
            description: 'Permit id',
            type: 'integer',
            nullable: true
          },
          permit_number: {
            description: 'Permit number',
            type: 'string'
          },
          permit_type: {
            description: 'Permit type',
            type: 'string'
          }
        }
      }
    }
  }
};

export const surveyFundingSourceDataSchema: OpenAPIV3.SchemaObject = {
  title: 'survey funding source response object',
  type: 'object',
  additionalProperties: false,
  required: ['funding_source_id', 'amount'],
  properties: {
    survey_funding_source_id: {
      description: 'Survey funding source id',
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    survey_id: {
      description: 'Survey id',
      type: 'integer',
      nullable: true
    },
    funding_source_id: {
      description: 'Funding source id',
      type: 'integer',
      minimum: 1
    },
    amount: {
      description: 'Funding source amount',
      type: 'number',
      minimum: 0
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    },
    funding_source_name: {
      description: 'Funding source name',
      type: 'string'
    },
    start_date: {
      description: 'Funding source start date',
      type: 'string',
      format: 'date',
      nullable: true
    },
    end_date: {
      description: 'Funding source end date',
      type: 'string',
      format: 'date',
      nullable: true
    },
    description: {
      description: 'Funding source description',
      type: 'string',
      nullable: true
    }
  }
};

export const surveyPurposeAndMethodologySchema: OpenAPIV3.SchemaObject = {
  title: 'survey purpose and methodology response object',
  type: 'object',
  additionalProperties: false,
  required: ['intended_outcome_ids', 'additional_details', 'vantage_code_ids'],
  properties: {
    intended_outcome_ids: {
      description: 'Intended outcome ids',
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    additional_details: {
      description: 'Additional details',
      type: 'string',
      nullable: true
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    },
    vantage_code_ids: {
      description: 'Vantage code ids',
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    }
  }
};

export const surveyPartnershipsSchema: OpenAPIV3.SchemaObject = {
  title: 'Survey partnerships',
  type: 'object',
  additionalProperties: false,
  required: ['indigenous_partnerships', 'stakeholder_partnerships'],
  properties: {
    indigenous_partnerships: {
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    stakeholder_partnerships: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

export const surveyProprietorSchema: OpenAPIV3.SchemaObject = {
  title: 'survey proprietor response object',
  type: 'object',
  nullable: true,
  additionalProperties: false,
  required: ['category_rationale', 'proprietor_name', 'disa_required'],
  properties: {
    survey_data_proprietary: {
      description: 'Survey data proprietary',
      type: 'string'
    },
    proprietary_data_category: {
      description: 'Proprietary data category',
      type: 'integer',
      nullable: true
    },
    proprietor_type_name: {
      description: 'Proprietor type name',
      type: 'string',
      nullable: true
    },
    proprietor_type_id: {
      description: 'Proprietor type id',
      type: 'integer',
      nullable: true
    },
    first_nations_name: {
      description: 'First nations name',
      type: 'string',
      nullable: true
    },
    first_nations_id: {
      description: 'First nations id',
      type: 'integer',
      nullable: true
    },
    category_rationale: {
      description: 'Category rationale',
      type: 'string'
    },
    proprietor_name: {
      description: 'Proprietor name',
      type: 'string'
    },
    disa_required: {
      description: 'Disa required',
      oneOf: [{ type: 'string' }, { type: 'boolean' }],
      nullable: true
    }
  }
};

export const surveyLocationSchema: OpenAPIV3.SchemaObject = {
  title: 'survey location response object',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description', 'geojson', 'revision_count'],
  properties: {
    survey_location_id: {
      description: 'Survey location id',
      type: 'integer',
      nullable: true
    },
    leaflet_id: {
      description: 'Leaflet id',
      type: 'integer',
      nullable: true
    },
    uuid: {
      description: 'Survey location uuid',
      type: 'string',
      format: 'uuid',
      nullable: true
    },
    name: {
      description: 'Name',
      type: 'string'
    },
    description: {
      description: 'Description',
      type: 'string'
    },
    geojson: {
      description: 'Geojson',
      type: 'array',
      items: {
        type: 'object'
      }
    },
    geometry: {
      description: 'Geometry',
      type: 'object',
      nullable: true
    },
    geography: {
      description: 'Geography',
      type: 'string'
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};

export const surveySiteSelectionSchema: OpenAPIV3.SchemaObject = {
  title: 'survey site selection response object',
  type: 'object',
  additionalProperties: false,
  required: ['strategies', 'stratums'],
  properties: {
    strategies: {
      description: 'Strategies',
      type: 'array',
      items: {
        type: 'string'
      }
    },
    stratums: {
      description: 'Stratums',
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: {
            description: 'Name',
            type: 'string'
          },
          description: {
            description: 'Description',
            type: 'string',
            nullable: true
          },
          survey_id: {
            description: 'Survey id',
            type: 'integer',
            minimum: 1
          },
          survey_stratum_id: {
            description: 'Survey stratum id',
            type: 'integer',
            minimum: 1
          },
          ...updateCreateUserPropertiesSchema.properties
        }
      }
    }
  }
};

export const surveyBlockSchema: OpenAPIV3.SchemaObject = {
  title: 'Survey Block',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description', 'sample_block_count'],
  properties: {
    survey_block_id: {
      description: 'Survey block id',
      type: 'integer',
      nullable: true
    },
    survey_id: {
      description: 'Survey id',
      type: 'integer',
      nullable: true
    },
    name: {
      description: 'Name',
      type: 'string'
    },
    description: {
      description: 'Description',
      type: 'string'
    },
    sample_block_count: {
      description: 'Sample block count',
      type: 'number'
    },
    ...updateCreateUserPropertiesSchema.properties
  }
};

export const surveySupplementaryDataSchema: OpenAPIV3.SchemaObject = {
  description: 'Survey supplementary data',
  type: 'object',
  additionalProperties: false,
  required: ['survey_metadata_publish'],
  properties: {
    survey_metadata_publish: {
      description: 'Survey metadata publish record',
      type: 'object',
      additionalProperties: false,
      nullable: true,
      required: [
        'survey_metadata_publish_id',
        'survey_id',
        'event_timestamp',
        'submission_uuid',
        'create_date',
        'create_user',
        'update_date',
        'update_user',
        'revision_count'
      ],
      properties: {
        survey_metadata_publish_id: {
          type: 'integer',
          minimum: 1
        },
        survey_id: {
          type: 'integer',
          minimum: 1
        },
        event_timestamp: {
          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
          description: 'ISO 8601 date string for the project start date'
        },
        submission_uuid: {
          type: 'string',
          format: 'uuid'
        },
        ...updateCreateUserPropertiesSchema.properties
      }
    }
  }
};
