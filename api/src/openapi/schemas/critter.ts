import { OpenAPIV3 } from 'openapi-types';

export const critterCreateRequestObject: OpenAPIV3.SchemaObject = {
  title: 'Bulk post request object',
  type: 'object',
  properties: {
    critters: {
      title: 'critters',
      type: 'array',
      items: {
        title: 'critter',
        type: 'object'
      }
    },
    captures: {
      title: 'captures',
      type: 'array',
      items: {
        title: 'capture',
        type: 'object'
      }
    },
    collections: {
      title: 'collection units',
      type: 'array',
      items: {
        title: 'collection unit',
        type: 'object'
      }
    },
    markings: {
      title: 'markings',
      type: 'array',
      items: {
        title: 'marking',
        type: 'object'
      }
    },
    locations: {
      title: 'locations',
      type: 'array',
      items: {
        title: 'location',
        type: 'object'
      }
    },
    mortalities: {
      title: 'locations',
      type: 'array',
      items: {
        title: 'location',
        type: 'object'
      }
    },
    qualitative_measurements: {
      title: 'qualitative measurements',
      type: 'array',
      items: {
        title: 'qualitative measurement',
        type: 'object'
      }
    },
    quantitative_measurements: {
      title: 'quantitative measurements',
      type: 'array',
      items: {
        title: 'quantitative measurement',
        type: 'object'
      }
    }
  }
};
