import {
  activityNonTargetedPickListValidator,
  ageOfSignPickListValidator,
  aircraftPickListValidator,
  basicNumericValidator,
  datumPickListValidator,
  eastingValidator,
  featureTypePickListValidator,
  frequencyPickListValidator,
  northingValidator,
  observationActivityPickListValidator,
  outputValidationSchema,
  presentAbsentPickListValidator,
  signTypePickListValidator,
  surveyOrTelemetryPickListValidator,
  targetPickListValidator,
  utmZonePickListValidator
} from './validation-config-helpers';

const elkSpeciesValidator = () => {
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
            name: 'M-CEEL',
            description: 'M-CEEL'
          },
          {
            name: 'M-CEEL-RO',
            description: 'M-CEEL-RO'
          }
        ]
      }
    }
  ];
};

const elkGeneralTemplateValidationSchema = {
  name: '',
  description: '',
  files: [
    {
      name: 'Effort & Site Conditions',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        }
      ],
      columns: [
        {
          name: 'Aircraft Type',
          description: '',
          validations: aircraftPickListValidator()
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
            required_columns: ['Study Area', 'Date', 'Species']
          }
        }
      ],
      columns: [
        {
          name: 'UTM Zone',
          description: '',
          validations: utmZonePickListValidator()
        },
        {
          name: 'Easting',
          description: '',
          validations: eastingValidator()
        },
        {
          name: 'Northing',
          description: '',
          validations: northingValidator()
        },
        {
          name: 'Datum',
          description: '',
          validations: datumPickListValidator()
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
          name: 'Species',
          description: '',
          validations: elkSpeciesValidator()
        },
        {
          name: 'BC RISC Yearlings Bulls',
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
          name: 'BC RISC Class IV Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Spike Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Raghorn Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '<=3 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '3 - 4 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '3 - 5 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '<4 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '>=4 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '5 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '>=5 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '>= 6 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Bulls - Unclassified',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unclassified Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Cows',
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
          name: 'Yearling - Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unclassified Age/Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sign Type',
          description: '',
          validations: signTypePickListValidator()
        },
        {
          name: 'Sign Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: ageOfSignPickListValidator()
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
          validations: observationActivityPickListValidator()
        },
        {
          name: 'Number of Marked Animals Observed',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Survey or Telemetry Search',
          description: '',
          validations: surveyOrTelemetryPickListValidator()
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        }
      ],
      columns: [
        {
          name: 'Targeted or Non-Targeted',
          description: '',
          validations: targetPickListValidator()
        },
        {
          name: 'Frequency Unit',
          description: '',
          validations: frequencyPickListValidator()
        }
      ]
    },
    {
      name: 'Incidental Observations',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        }
      ],
      columns: [
        {
          name: 'UTM Zone',
          description: '',
          validations: utmZonePickListValidator()
        },
        {
          name: 'Easting',
          description: '',
          validations: eastingValidator()
        },
        {
          name: 'Northing',
          description: '',
          validations: northingValidator()
        },
        {
          name: 'Datum',
          description: '',
          validations: datumPickListValidator()
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
          validations: presentAbsentPickListValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: activityNonTargetedPickListValidator
        },
        {
          name: 'Activity Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Feature Type',
          description: '',
          validations: featureTypePickListValidator()
        },
        {
          name: 'Feature Type Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sign Type',
          description: '',
          validations: signTypePickListValidator()
        },
        {
          name: 'Sign Count',
          description: '',
          validations: basicNumericValidator()
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

outputValidationSchema(elkGeneralTemplateValidationSchema, 'elk_general_validation_config_output');