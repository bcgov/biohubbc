import * as fs from 'fs';

// helper functions for constructing validation schema
const basicNumericValidator = () => {
  return [
    {
      column_numeric_validator: {
        name: '',
        description: ''
      }
    }
  ];
};

const yesNoPickListValidator = () => {
  return [
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
            name: 'Y',
            description: 'Yes'
          },
          {
            name: 'N',
            description: 'No'
          }
        ]
      }
    }
  ];
};

const mooseSRBTemplateValidationSchema = {
  name: '',
  description: '',
  files: [
    {
      name: 'Effort & Site Conditions',
      description: '',
      columns: [],
      validations: [
        {
          file_duplicate_columns_validator: {}
        }
      ]
    },
    {
      name: 'Block Summary',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: ['Study Area', 'Block ID/SU ID', 'Stratum', 'Sampled (Y/N)']
          }
        },
        {
          file_column_unique_validator: {
            column_names: ['Study Area', 'Block ID/SU ID', 'Stratum']
          }
        }
      ],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'Stratum',
          description: '',
          validations: []
        },
        {
          name: 'Sampled (Y/N)',
          description: '',
          validations: yesNoPickListValidator()
        }
      ]
    },
    {
      name: 'Observations',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: ['Study Area', 'Block ID/SU ID', 'Stratum', 'Date', 'Species']
          }
        }
      ],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'UTM Zone',
          description: '',
          validations: []
        },
        {
          name: 'Easting',
          description: '',
          validations: []
        },
        {
          name: 'Northing',
          description: '',
          validations: []
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Group Label',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: []
        },
        {
          name: 'Time',
          description: '',
          validations: []
        },
        {
          name: 'Species',
          description: '',
          validations: [] //TODO What is valid here?
        },
        {
          name: 'Spike/Fork Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sub-Prime Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Prime Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Senior Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '3 Brow/10 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Yearling Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class I Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class II Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class III Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Oswald (1997) Class I Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Oswald (1997) Class II Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Oswald (1997) Class III Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Cow',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Calves',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unclassified Age/Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Cow W/1 calf',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Cow W/2 calves',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sign Type',
          description: '',
          validations: []
        },
        {
          name: 'Sign Count',
          description: '',
          validations: []
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: []
        },
        {
          name: 'Veg Cover (%)',
          description: '',
          validations: []
        },
        {
          name: 'Snow Cover (%)',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      columns: [
        {
          name: 'Group Label',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: [
            {
              column_format_validator: {
                reg_exp: '^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$',
                reg_exp_flags: 'g',
                expected_format: 'Dates need to be formatted in YYYY-MM-DD. For example: 2020-09-15.'
              }
            }
          ]
        },
        {
          name: 'Wildlife Health ID',
          description: '',
          validations: []
        },
        {
          name: 'Animal ID',
          description: '',
          validations: []
        },
        {
          name: 'Telemetry Device ID',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Incidental Observations',
      description: '',
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: [
            {
              column_format_validator: {
                reg_exp: '^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$',
                reg_exp_flags: 'g',
                expected_format: 'Dates need to be formatted in YYYY-MM-DD. For example: 2020-09-15.'
              }
            }
          ]
        },
        {
          name: 'UTM Zone',
          description: '',
          validations: []
        },
        {
          name: 'Easting',
          description: '',
          validations: []
        },
        {
          name: 'Northing',
          description: '',
          validations: []
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Species',
          description: '',
          validations: []
        },
        {
          name: 'Adult Males',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Females',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adults - Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Juvenile Males',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Juvenile Females',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Juveniles - Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unknown Age/Sex',
          description: '',
          validations: basicNumericValidator()
        }
      ],
      validations: []
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: [
          'Block Summary',
          'Effort & Site Conditions',
          'Observations',
          'Marked Animals',
          'Incidental Observations'
        ]
      }
    }
  ],
  workbookValidations: [
    {
      workbook_parent_child_key_match_validator: {
        parent_worksheet_name: 'Observations',
        child_worksheet_name: 'Marked Animals',
        column_names: ['Group Label']
      }
    }
  ]
};

fs.writeFile('./moose_SRB_template_output.json', JSON.stringify(mooseSRBTemplateValidationSchema), (err) => {
  if (err) {
    console.error(err);
  }
  // file written successfully

  console.log('All done!');
});
