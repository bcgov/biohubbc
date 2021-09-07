import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { submissionValidationSchema } from './validation-schema';

// Useful online json-schema validator: https://www.jsonschemavalidator.net/

describe('submissionValidationSchema', () => {
  const ajv = new Ajv();

  it('is valid schema', () => {
    expect(ajv.validateSchema(submissionValidationSchema)).to.be.true;
  });
});

describe('example submission validation schema', () => {
  const exampleSchema2 = {
    name: 'Example Submission Validation Schema',
    description: 'An example submission validation schema.',
    files: [
      {
        name: 'event',
        description: 'The Event file for this submission. Should contain information about events.',
        columns: [
          {
            name: 'eventID',
            validations: []
          },
          {
            name: 'parentEventID',
            validations: []
          },
          {
            name: 'samplingProtocol',
            validations: []
          },
          {
            name: 'geodeticDatum',
            validations: []
          },
          {
            name: 'verbatimCoordinates',
            validations: [
              {
                column_format_validator: {
                  reg_exp: '^9N [0-9]{6} [0-9]{7}$',
                  expected_format: '9N 12345 123456'
                }
              }
            ]
          },
          {
            name: 'verbatimElevation',
            validations: []
          },
          {
            name: 'coordinateUncertaintyInMeters',
            validations: []
          },
          {
            name: 'coordinatePrecision',
            validations: []
          },
          {
            name: 'verbatimLocality',
            validations: []
          },
          {
            name: 'locationRemarks',
            validations: []
          }
        ],
        validations: [
          {
            file_required_columns_validator: {
              required_columns: [
                'eventID',
                'parentEventID',
                'eventDate',
                'samplingProtocol',
                'geodeticDatum',
                'verbatimCoordinates',
                'verbatimElevation',
                'coordinateUncertaintyInMeters',
                'coordinatePrecision',
                'verbatimLocality',
                'locationRemarks'
              ]
            }
          }
        ]
      },
      {
        name: 'occurrence',
        description: 'The Occurrence file for this submission. Should contain information about occurrences.',
        columns: [
          {
            name: 'sex',
            desciption: 'The sex of the observed taxon.',
            validations: [
              {
                column_code_validator: {
                  name: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  allowed_code_values: [
                    {
                      name: 'male',
                      description: 'A male'
                    },
                    {
                      name: 'female',
                      description: 'A female'
                    },
                    {
                      name: 'unclassified',
                      description: 'An unclassified sex'
                    }
                  ]
                }
              }
            ]
          },
          {
            name: 'lifeStage',
            desciption: 'A description of the location.',
            validations: [
              {
                column_code_validator: {
                  name: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  allowed_code_values: [
                    {
                      name: 'adult',
                      description: 'An adult'
                    },
                    {
                      name: 'juvenile',
                      description: 'A child'
                    }
                  ]
                }
              }
            ]
          },
          {
            name: 'individualCount',
            desciption: 'The occurrence count.',
            validations: [
              {
                column_format_validator: {
                  name: '',
                  description: '',
                  reg_exp: '^[0-9].*$',
                  expected_format: 'A positive integer'
                }
              }
            ]
          }
        ],
        validations: [
          {
            file_required_columns_validator: {
              name: '',
              description: '',
              required_columns: [
                'eventID',
                'occurrenceID',
                'basisOfRecord',
                'type',
                'associatedTaxa',
                'sex',
                'lifeStage',
                'individualCount',
                'occurrenceRemarks',
                'identifiedBy',
                'organismQuantity',
                'organismQuantityType'
              ]
            }
          },
          {
            file_recommended_columns_validator: {
              name: '',
              description: '',
              recommended_columns: ['occurrenceRemarks']
            }
          }
        ]
      },
      {
        name: 'measurementorfact',
        description: 'The Event file for this submission. Should contain information about events.',
        columns: [],
        validations: []
      },
      {
        name: 'resourcerelationship',
        description: 'The Event file for this submission. Should contain information about events.',
        columns: [],
        validations: []
      },
      {
        name: 'taxon',
        description: 'The Event file for this submission. Should contain information about events.',
        columns: [],
        validations: []
      }
    ],
    validations: [
      {
        submission_required_files_validator: {
          name: '',
          description: '',
          required_files: ['event', 'occurrence', 'taxon']
        }
      },
      {
        mimetype_validator: {
          name: '',
          description: '',
          reg_exps: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed']
        }
      }
    ]
  };

  const ajv = new Ajv();

  it('validates against submissionValidationSchema', () => {
    expect(ajv.validate(submissionValidationSchema, exampleSchema2), JSON.stringify(ajv.errors)).to.be.true;
  });
});
