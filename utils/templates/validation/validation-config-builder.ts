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

const basicDateValidator = () => {
  return [
    {
      column_format_validator: {
        reg_exp: '^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$',
        reg_exp_flags: 'g',
        expected_format: 'Dates need to be formatted in YYYY-MM-DD. For example: 2020-09-15.'
      }
    }
  ];
};

// const templateValidationSchema = {
//   name: '',
//   description: '',
//   files: [
//     {
//       name: '',
//       description: '',
//       validations: [],
//       columns: [
//         {
//           name: '',
//           description: '',
//           validations: []
//         }
//       ]
//     }
//   ],
//   validations: []
// };

const templateValidationSchema = {
  name: '',
  description: '',
  files: [
    {
      name: 'Effort & Site Conditions',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: ['Study Area']
          }
        }
      ],
      columns: []
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
            required_columns: ['Study Area', 'Date', 'Species']
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
          validations: basicNumericValidator()
        },
        {
          name: 'Northing',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: basicNumericValidator()
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
          name: 'Spike/ Fork Bulls',
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
          validations: basicNumericValidator()
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: []
        },
        {
          name: 'Veg Cover (%)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Snow Cover (%)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: []
        },
        {
          name: 'Number of Marked Animals Observed',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Survey or Telemetry Search',
          description: '',
          validations: []
        },
        {
          name: 'Photos',
          description: '',
          validations: []
        },
        {
          name: 'Observation Comments',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      validations: [],
      columns: [
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
          name: 'Targeted or Non-Targeted',
          description: '',
          validations: []
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
        },
        {
          name: 'Collar/Tag Frequency',
          description: '',
          validations: []
        },
        {
          name: 'Frequency Unit',
          description: '',
          validations: []
        },
        {
          name: 'Right Ear Tag ID',
          description: '',
          validations: []
        },
        {
          name: 'Right Ear Tag Colour',
          description: '',
          validations: []
        },
        {
          name: 'Left Ear Tag ID',
          description: '',
          validations: []
        },
        {
          name: 'Left Ear Tag Colour',
          description: '',
          validations: []
        },
        {
          name: 'Marked Animals Comments',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Incidental Observations',
      description: '',
      validations: [],
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
          validations: basicNumericValidator()
        },
        {
          name: 'Northing',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Date',
          description: '',
          validations: basicDateValidator()
        },
        {
          name: 'Time',
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
        },
        {
          name: 'Species Occurrence Status',
          description: '',
          validations: []
        },
        {
          name: 'Activity',
          description: '',
          validations: []
        },
        {
          name: 'Activity Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Feature Type',
          description: '',
          validations: []
        },
        {
          name: 'FEature Type Count',
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
          validations: basicNumericValidator()
        },
        {
          name: 'Photos',
          description: '',
          validations: []
        },
        {
          name: 'Incidental Observation Comments',
          description: '',
          validations: []
        }
      ]
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: ['Effort & Site Conditions', 'Observations', 'Marked Animals', 'Incidental Observations']
      }
    }
  ],
  workbookValidations: [
    {
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'Marked Animals',
        parent_worksheet_name: 'Observations',
        column_names: ['Group Label']
      }
    }
  ]
};

fs.writeFile('./output/validation_config_output.json', JSON.stringify(templateValidationSchema), (err) => {
  // file written successfully

  console.log('All done!');
});
