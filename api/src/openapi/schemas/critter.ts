import { OpenAPIV3 } from 'openapi-types';

const critterSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
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
      type: 'string'
    },
    sex: {
      type: 'string'
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
    proximate_predated_by_taxon_id: { type: 'string', format: 'uuid' },
    ultimate_cause_of_death_id: { type: 'string', format: 'uuid' },
    ultimate_cause_of_death_confidence: { type: 'string' },
    ultimate_predated_by_taxon_id: { type: 'string', format: 'uuid' },
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


const bulkResponseCounts: OpenAPIV3.SchemaObject = {
  title: 'Bulk operation counts',
  type: 'object',
  additionalProperties: false,
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
