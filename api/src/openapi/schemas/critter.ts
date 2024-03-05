import { OpenAPIV3 } from 'openapi-types';

const critterSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    animal_id: {
      type: 'string'
    },
    wlh_id: {
      type: 'string'
    },
    itis_tsn: {
      type: 'number'
    },
    itis_scientific_name: {
      type: 'string'
    },
    sex: {
      type: 'string'
    }
  },
  additionalProperties: false
};

const locationSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
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
  },
  additionalProperties: false
};

const captureSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    capture_id: {
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
    force_create_release: {
      type: 'boolean'
    },
    capture_timestamp: {
      type: 'string'
    },
    release_timestamp: {
      type: 'string'
    },
    capture_comment: {
      type: 'string'
    },
    release_comment: {
      type: 'string'
    }
  },
  additionalProperties: false
};

const collectionUnits: OpenAPIV3.SchemaObject = {
  type: 'object',
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
  },
  additionalProperties: false
};

const markingSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
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
  },
  additionalProperties: false
};

const mortalitySchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    mortality_id: { type: 'string', format: 'uuid' },
    critter_id: { type: 'string', format: 'uuid' },
    location_id: { type: 'string', format: 'uuid' },
    mortality_comment: { type: 'string' },
    proximate_cause_of_death_id: { type: 'string', format: 'uuid' },
    proximate_cause_of_death_confidence: { type: 'string' },
    proximate_predated_by_itis_tsn: { type: 'string', format: 'uuid' },
    ultimate_cause_of_death_id: { type: 'string', format: 'uuid' },
    ultimate_cause_of_death_confidence: { type: 'string' },
    ultimate_predated_by_itis_tsn: { type: 'string', format: 'uuid' },
    projection_mode: { type: 'string', enum: ['wgs', 'utm'] },
    location: locationSchema
  },
  additionalProperties: false
};

const qualitativeMeasurementSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    measurement_qualitative_id: { type: 'string', format: 'uuid' },
    taxon_measurement_id: { type: 'string' },
    qualitative_option_id: {
      type: 'string'
    },
    measured_timestamp: { type: 'string' },
    measurement_comment: { type: 'string' }
  },
  additionalProperties: false
};

const quantitativeMeasurmentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
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
  },
  additionalProperties: false
};

export const critterBulkRequestObject: OpenAPIV3.SchemaObject = {
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
    measurements: {
      title: 'measurements',
      type: 'object',
      properties: {
        qualitative: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              critter_id: {
                type: 'string'
              },
              measurement_qualitative_id: {
                type: 'string'
              },
              measurement_quantitative_id: {
                type: 'string'
              },
              taxon_measurement_id: {
                type: 'string'
              },
              qualitative_option_id: {
                type: 'string'
              },
              measured_timestamp: {
                type: 'string'
              },
              measurement_comment: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        quantitative: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              critter_id: {
                type: 'string'
              },
              measurement_qualitative_id: {
                type: 'string'
              },
              measurement_quantitative_id: {
                type: 'string'
              },
              taxon_measurement_id: {
                type: 'string'
              },
              value: {
                type: 'number'
              },
              measured_timestamp: {
                type: 'string'
              },
              measurement_comment: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
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
  },
  additionalProperties: false
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
  properties: {
    critters: { type: 'integer' },
    captures: { type: 'integer' },
    markings: { type: 'integer' },
    locations: { type: 'integer' },
    moralities: { type: 'integer' },
    collections: { type: 'integer' },
    quantitative_measurements: { type: 'integer' },
    qualitative_measurements: { type: 'integer' },
    families: { type: 'integer' },
    family_parents: { type: 'integer' },
    family_children: { type: 'integer' }
  },
  additionalProperties: false
};

export const bulkCreateResponse: OpenAPIV3.SchemaObject = {
  title: 'Critterbase bulk creation response object',
  type: 'object',
  properties: {
    created: bulkResponseCounts
  },
  additionalProperties: false
};

export const bulkUpdateResponse: OpenAPIV3.SchemaObject = {
  title: 'Critterbase bulk update response object',
  type: 'object',
  properties: {
    created: bulkCreateResponse,
    updated: bulkResponseCounts,
    deleted: bulkResponseCounts
  },
  additionalProperties: false
};
