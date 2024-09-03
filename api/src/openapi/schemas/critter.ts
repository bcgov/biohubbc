import { OpenAPIV3 } from 'openapi-types';

export const critterSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    critterbase_critter_id: {
      type: 'string',
      format: 'uuid'
    },
    critter_id: {
      type: 'integer',
      minimum: 1
    },
    animal_id: {
      type: 'string',
      nullable: true
    },
    wlh_id: {
      type: 'string',
      nullable: true
    },
    itis_tsn: {
      type: 'integer'
    },
    itis_scientific_name: {
      type: 'string'
    },
    sex: {
      type: 'object',
      additionalProperties: false,
      description: 'Object describing qualitative_option_id and label of the sex measurement value',
      properties: {
        qualitative_option_id: {
          type: 'string',
          format: 'uuid',
          description: 'Critterbase foreign key referencing a sex measurement option'
        },
        label: { type: 'string', description: 'Name of the sex measurement value, eg. male' }
      },
      nullable: true
    },
    responsible_region_nr_id: {
      type: 'string',
      format: 'uuid',
      nullable: true
    },
    critter_comment: {
      type: 'string',
      nullable: true
    },
    mortality: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['mortality_id', 'mortality_timestamp'],
        properties: {
          mortality_id: {
            type: 'string'
          },
          mortality_timestamp: {
            type: 'string'
          }
        }
      }
    },
    collection_units: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'critter_collection_unit_id',
          'collection_category_id',
          'collection_unit_id',
          'unit_name',
          'category_name'
        ],
        properties: {
          critter_collection_unit_id: {
            type: 'string',
            format: 'uuid'
          },
          collection_category_id: {
            type: 'string',
            format: 'uuid'
          },
          collection_unit_id: {
            type: 'string',
            format: 'uuid'
          },
          unit_name: {
            type: 'string'
          },
          category_name: {
            type: 'string'
          }
        }
      }
    }
  }
};

const locationSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    location_id: {
      type: 'string',
      format: 'uuid'
    },
    latitude: {
      type: 'number'
    },
    longitude: {
      type: 'number'
    },
    coordinate_uncertainty: {
      type: 'number'
    },
    coordinate_uncertainty_unit: {
      type: 'string'
    }
  }
};

const captureSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    capture_id: {
      type: 'string',
      format: 'uuid'
    },
    capture_method_id: {
      type: 'string',
      format: 'uuid'
    },
    capture_location_id: {
      type: 'string',
      format: 'uuid'
    },
    release_location_id: {
      type: 'string',
      format: 'uuid'
    },
    capture_location: locationSchema,
    release_location: locationSchema,
    capture_date: {
      type: 'string'
    },
    capture_time: {
      type: 'string'
    },
    release_date: {
      type: 'string'
    },
    release_time: {
      type: 'string'
    },
    capture_comment: {
      type: 'string'
    },
    release_comment: {
      type: 'string'
    }
  }
};

const collectionUnits: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    critter_collection_unit: {
      type: 'string',
      format: 'uuid'
    },
    collection_unit_id: {
      type: 'string',
      format: 'uuid'
    }
  }
};

const markingSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    marking_id: {
      type: 'string',
      format: 'uuid'
    },
    marking_type_id: {
      type: 'string',
      format: 'uuid'
    },
    taxon_marking_body_location_id: {
      type: 'string',
      format: 'uuid'
    },
    primary_colour_id: {
      type: 'string',
      format: 'uuid'
    },
    secondary_colour_id: {
      type: 'string',
      format: 'uuid'
    },
    marking_comment: {
      type: 'string'
    }
  }
};

const mortalitySchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    mortality_id: { type: 'string', format: 'uuid' },
    critter_id: { type: 'string', format: 'uuid' },
    location_id: { type: 'string', format: 'uuid' },
    mortality_comment: { type: 'string' },
    proximate_cause_of_death_id: { type: 'string', format: 'uuid' },
    proximate_cause_of_death_confidence: { type: 'string' },
    proximate_predated_by_itis_tsn: { type: 'integer' },
    ultimate_cause_of_death_id: { type: 'string', format: 'uuid' },
    ultimate_cause_of_death_confidence: { type: 'string' },
    ultimate_predated_by_itis_tsn: { type: 'integer' },
    projection_mode: { type: 'string', enum: ['wgs', 'utm'] },
    location: locationSchema
  }
};

const qualitativeMeasurementSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    measurement_qualitative_id: { type: 'string', format: 'uuid' },
    taxon_measurement_id: { type: 'string' },
    qualitative_option_id: {
      type: 'string'
    },
    measured_timestamp: { type: 'string' },
    measurement_comment: { type: 'string' }
  }
};

const quantitativeMeasurmentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    measurement_qualitative_id: { type: 'string', format: 'uuid' },
    taxon_measurement_id: { type: 'string' },
    qualitative_option_id: {
      type: 'string',
      format: 'uuid'
    },
    value: {
      type: 'number'
    },
    measured_timestamp: { type: 'string' },
    measurement_comment: { type: 'string' }
  }
};

export const critterBulkRequestObject: OpenAPIV3.SchemaObject = {
  title: 'Bulk post request object',
  type: 'object',
  additionalProperties: false,
  properties: {
    critters: {
      title: 'critters',
      type: 'array',
      items: {
        title: 'critter',
        ...critterSchema
      }
    },
    families: {
      title: 'families',
      type: 'object',
      properties: {
        children: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              family_id: {
                type: 'string'
              },
              child_critter_id: {
                type: 'string'
              },
              _delete: {
                type: 'boolean'
              }
            },
            additionalProperties: false
          }
        },
        families: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              family_id: {
                type: 'string'
              },
              family_label: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        parents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              family_id: {
                type: 'string'
              },
              parent_critter_id: {
                type: 'string'
              },
              _delete: {
                type: 'boolean'
              }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    },
    captures: {
      title: 'captures',
      type: 'array',
      items: {
        title: 'capture',
        ...captureSchema
      }
    },
    collections: {
      title: 'collection units',
      type: 'array',
      items: {
        title: 'collection unit',
        ...collectionUnits
      }
    },
    markings: {
      title: 'markings',
      type: 'array',
      items: {
        title: 'marking',
        ...markingSchema
      }
    },
    locations: {
      title: 'locations',
      type: 'array',
      items: {
        title: 'location',
        ...locationSchema
      }
    },
    mortalities: {
      title: 'locations',
      type: 'array',
      items: {
        title: 'location',
        ...mortalitySchema
      }
    },
    qualitative_measurements: {
      title: 'qualitative measurements',
      type: 'array',
      items: {
        title: 'qualitative measurement',
        ...qualitativeMeasurementSchema
      }
    },
    quantitative_measurements: {
      title: 'quantitative measurements',
      type: 'array',
      items: {
        title: 'quantitative measurement',
        ...quantitativeMeasurmentSchema
      }
    }
  }
};

export const critterBulkRequestPatchObject: OpenAPIV3.SchemaObject = {
  title: 'Bulk post request object',
  type: 'object',
  properties: {
    critters: {
      title: 'critters',
      type: 'array',
      items: {
        title: 'critter',
        ...critterSchema
      }
    },
    captures: {
      title: 'captures',
      type: 'array',
      items: {
        title: 'capture',
        type: 'object',
        properties: {
          ...captureSchema.properties,
          _delete: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    },
    collections: {
      title: 'collection units',
      type: 'array',
      items: {
        title: 'collection unit',
        type: 'object',
        properties: {
          ...collectionUnits.properties,
          _delete: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    },
    markings: {
      title: 'markings',
      type: 'array',
      items: {
        title: 'marking',
        type: 'object',
        properties: {
          ...markingSchema.properties,
          _delete: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    },
    locations: {
      title: 'locations',
      type: 'array',
      items: {
        title: 'location',
        type: 'object',
        properties: {
          ...locationSchema.properties,
          _delete: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    },
    mortalities: {
      title: 'locations',
      type: 'array',
      items: {
        title: 'location',
        type: 'object',
        properties: {
          ...mortalitySchema.properties,
          _delete: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    },
    qualitative_measurements: {
      title: 'qualitative measurements',
      type: 'array',
      items: {
        title: 'qualitative measurement',
        type: 'object',
        properties: {
          ...qualitativeMeasurementSchema.properties,
          _delete: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    },
    quantitative_measurements: {
      title: 'quantitative measurements',
      type: 'array',
      items: {
        title: 'quantitative measurement',
        type: 'object',
        properties: {
          ...quantitativeMeasurmentSchema.properties,
          _delete: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
};

const bulkResponseCounts: OpenAPIV3.SchemaObject = {
  title: 'Bulk operation counts',
  type: 'object',
  additionalProperties: false,
  properties: {
    critters: { type: 'integer' },
    captures: { type: 'integer' },
    markings: { type: 'integer' },
    locations: { type: 'integer' },
    mortalities: { type: 'integer' },
    collections: { type: 'integer' },
    quantitative_measurements: { type: 'integer' },
    qualitative_measurements: { type: 'integer' },
    families: { type: 'integer' },
    family_parents: { type: 'integer' },
    family_children: { type: 'integer' }
  }
};

export const bulkCreateResponse: OpenAPIV3.SchemaObject = {
  title: 'Critterbase bulk creation response object',
  type: 'object',
  additionalProperties: false,
  properties: {
    created: bulkResponseCounts
  }
};

export const bulkUpdateResponse: OpenAPIV3.SchemaObject = {
  title: 'Critterbase bulk update response object',
  type: 'object',
  additionalProperties: false,
  properties: {
    created: bulkCreateResponse,
    updated: bulkResponseCounts,
    deleted: bulkResponseCounts
  }
};
