import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { submissionTransformationSchema } from './transformation-schema';

// Useful online json-schema validator: https://www.jsonschemavalidator.net/

describe('submissionTransformationSchema', () => {
  const ajv = new Ajv();

  it('is valid schema', () => {
    expect(ajv.validateSchema(submissionTransformationSchema)).to.be.true;
  });
});

describe('example submission transformation schema', () => {
  const exampleSchema = {
    name: 'test file 1',
    flatten: [
      { fileName: 'Effort & Site Conditions', uniqueId: ['Survey Area', 'Sampling Unit ID', 'Stratum'] },
      {
        fileName: 'Observations - Skeena',
        uniqueId: ['Waypoint'],
        parent: { fileName: 'Effort & Site Conditions', uniqueId: ['Survey Area', 'Sampling Unit ID', 'Stratum'] }
      },
      {
        fileName: 'UTM_LatLong',
        uniqueId: ['Waypoint'],
        parent: { fileName: 'Observations - Skeena', uniqueId: ['Waypoint'] }
      }
    ],
    transform: [
      [
        {
          fileName: 'event',
          fields: {
            id: {
              columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
              separator: ':'
            },
            eventID: {
              columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
              separator: ':'
            },
            eventDate: {
              columns: ['Date']
            },
            verbatimCoordinates: {
              columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
            }
          }
        },
        {
          fileName: 'occurrence',
          conditionalFields: ['individualCount'],
          fields: {
            occurrenceID: {
              columns: ['Waypoint'],
              unique: 'occ'
            },
            individualCount: {
              columns: ['Mature Bulls']
            },
            taxon: {
              columns: ['Species']
            },
            lifestage: {
              value: 'Adult'
            },
            sex: {
              value: 'Male'
            },
            occurrenceRemarks: {
              columns: ['Observation Comments']
            }
          }
        }
      ],
      [
        {
          fileName: 'event',
          fields: {
            id: {
              columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
              separator: ':'
            },
            eventID: {
              columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
              separator: ':'
            },
            eventDate: {
              columns: ['Date']
            },
            verbatimCoordinates: {
              columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
            }
          }
        },
        {
          fileName: 'occurrence',
          conditionalFields: ['individualCount'],
          fields: {
            occurrenceID: {
              columns: ['Waypoint'],
              unique: 'occ'
            },
            individualCount: {
              columns: ['Yearlings Bulls']
            },
            taxon: {
              columns: ['Species']
            },
            lifestage: {
              value: 'Yearling'
            },
            sex: {
              value: 'Male'
            },
            occurrenceRemarks: {
              columns: ['Observation Comments']
            }
          }
        }
      ]
    ],
    parse: [
      {
        fileName: 'event',
        columns: ['id', 'eventID', 'eventDate', 'verbatimCoordinates']
      },
      {
        fileName: 'occurrence',
        conditionalFields: ['individualCount'],
        columns: ['id', 'occurrenceID', 'individualCount', 'taxon', 'lifestage', 'sex', 'occurrenceRemarks']
      }
    ]
  };

  const ajv = new Ajv();

  it('validates against submissionTransformationSchema', () => {
    expect(ajv.validate(submissionTransformationSchema, exampleSchema), JSON.stringify(ajv.errors)).to.be.true;
  });
});
