import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { submissionValidationSchema } from './submission-validation';

describe('submissionValidationSchema', () => {
  const ajv = new Ajv();

  it('is valid schema', () => {
    expect(ajv.validateSchema(submissionValidationSchema)).to.be.true;
  });
});

describe('example submission validation schema', () => {
  const exampleSchema = {
    name: 'Example Submission Validation Schema',
    description: 'An example submission validation schema.',
    files: [
      {
        name: 'Event',
        description: 'The Event file for this submission. Should contain information about events.',
        columns: [
          {
            name: 'id',
            description: 'A unique id',
            validations: [
              {
                column_unique_validator: {
                  name: '',
                  description: '',
                  is_unique: true
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
              required_columns: ['id']
            }
          }
        ]
      },
      {
        name: 'Occurrence',
        description: 'The Occurrence file for this submission. Should contain information about occurrences.',
        columns: [
          {
            name: 'id',
            desciption: 'The id of an Event record.',
            validations: []
          },
          {
            name: 'location',
            desciption: 'A description of the location.',
            validations: []
          },
          {
            name: 'date',
            desciption: 'The occurrence date. Must be in yyyy-mm-dd format.',
            validations: [
              {
                name: '',
                description: '',
                column_format_validator: {
                  pattern: '^([12]d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]d|3[01]))$'
                }
              }
            ]
          },
          {
            name: 'sex',
            desciption: 'The sex of the observed taxon.',
            validations: [
              {
                column_code_validator: {
                  name: '',
                  description: '',
                  allowed_code_values: [
                    {
                      name: 'male',
                      description: 'Indicates a male lifestage'
                    },
                    {
                      name: 'female',
                      description: 'Indicates a male lifestage'
                    },
                    {
                      name: 'unclassified',
                      description: 'Indicates an unclassified lifestage'
                    }
                  ]
                }
              }
            ]
          },
          {
            name: 'count',
            desciption: 'The occurrence count.',
            validations: [
              {
                column_format_validator: {
                  name: '',
                  description: '',
                  pattern: '^[0-9].*$'
                }
              }
            ]
          },
          {
            name: 'comment',
            desciption: 'Comments about the occurrence.',
            validations: []
          }
        ],
        validations: [
          {
            file_required_columns_validator: {
              name: '',
              description: '',
              required_columns: ['id', 'location', 'date', 'count']
            }
          },
          {
            file_recommended_columns_validator: {
              name: '',
              description: '',
              recommended_columns: ['comment']
            }
          }
        ]
      }
    ],
    validations: [
      {
        submission_required_files_validator: {
          name: '',
          description: '',
          required_files: ['Event', 'Occurrence']
        }
      },
      {
        mimetype_validator: {
          name: '',
          description: '',
          allowed_mimetypes: ['.zip']
        }
      }
    ]
  };

  const ajv = new Ajv();

  it('validates against submissionValidationSchema', () => {
    expect(ajv.validate(submissionValidationSchema, exampleSchema), JSON.stringify(ajv.errors)).to.be.true;
  });
});
