import {
  activityNonTargetedPickListValidator,
  aircraftPickListValidator,
  basicNumericValidator,
  datumPickListValidator,
  featureTypePickListValidator,
  frequencyPickListValidator,
  habitatPickListValidator,
  outputValidationSchema,
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

const stratumPickListValidator = () => {
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
            name: 'very high',
            description: 'very high'
          },
          {
            name: 'high',
            description: 'high'
          },
          {
            name: 'medium',
            description: 'medium'
          },
          {
            name: 'low',
            description: 'low'
          },
          {
            name: 'very low',
            description: 'very low'
          },
          {
            name: 'describe in comments',
            description: 'describe in comments'
          }
        ]
      }
    }
  ];
};

const sampledPickListValidator = () => {
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
            description: 'Y'
          },
          {
            name: 'N',
            description: 'N'
          }
        ]
      }
    }
  ];
};

const speciesOccurrenceStatusPickListValidator = () => {
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
            name: 'Present',
            description: 'Present'
          },
          {
            name: 'Absent',
            description: 'Absent'
          }
        ]
      }
    }
  ];
};

const signAgePickListValidator = () => {
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
          { name: 'New', description: 'New' },
          { name: 'Old', description: 'Old' },
          { name: 'Hour', description: 'Hour' },
          { name: 'Day', description: 'Day' },
          { name: 'Week', description: 'Week' },
          { name: 'Month', description: 'Month' },
          { name: 'Year', description: 'Year' },
          { name: 'Unclassified', description: 'Unclassified' },
          { name: 'Described in Comments', description: 'Described in Comments' }
        ]
      }
    }
  ];
};

const elkSRBTemplateValidationSchema = {
  name: '',
  description: '',
  files: [
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
        }
      ],
      columns: [
        {
          name: 'Stratum',
          description: '',
          validations: stratumPickListValidator()
        },
        {
          name: 'Stratum/Block Area (km2)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sampled (Y/N)',
          description: '',
          validations: sampledPickListValidator()
        }
      ]
    },
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
          name: 'Block Area (km2)',
          description: '',
          validations: basicNumericValidator()
        },
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
            required_columns: [
              'Study Area',
              'Block ID/SU ID',
              'Stratum',
              'UTM Zone',
              'Easting',
              'Northing',
              'Lat (DD)',
              'Long (DD)',
              'Species',
              'Group Label',
              'Date'
            ]
          }
        }
      ],
      columns: [
        {
          name: 'Stratum',
          description: '',
          validations: stratumPickListValidator()
        },
        {
          name: 'UTM Zone',
          description: '',
          validations: utmZonePickListValidator()
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
        { name: 'BC RISC Yearlings Bulls', description: '', validations: basicNumericValidator() },
        { name: 'BC RISC Class I Bulls', description: '', validations: basicNumericValidator() },
        { name: 'BC RISC Class II Bulls', description: '', validations: basicNumericValidator() },
        { name: 'BC RISC Class III Bulls', description: '', validations: basicNumericValidator() },
        { name: 'BC RISC Class IV Bulls', description: '', validations: basicNumericValidator() },
        { name: 'Spike Bulls', description: '', validations: basicNumericValidator() },
        { name: 'Raghorn Bulls', description: '', validations: basicNumericValidator() },
        { name: '<=3 Point Bulls', description: '', validations: basicNumericValidator() },
        { name: '3 - 4 Point Bulls', description: '', validations: basicNumericValidator() },
        { name: '3 - 5 Point Bulls', description: '', validations: basicNumericValidator() },
        { name: '<4 Point Bulls', description: '', validations: basicNumericValidator() },
        { name: '>=4 Point Bulls', description: '', validations: basicNumericValidator() },
        { name: '5 Point Bulls', description: '', validations: basicNumericValidator() },
        { name: '>=5 Point Bulls', description: '', validations: basicNumericValidator() },
        { name: '>= 6 Point Bulls', description: '', validations: basicNumericValidator() },
        { name: 'Adult Bulls - Unclassified', description: '', validations: basicNumericValidator() },
        { name: 'Unclassified Bulls', description: '', validations: basicNumericValidator() },
        { name: 'Cows', description: '', validations: basicNumericValidator() },
        { name: 'Calves', description: '', validations: basicNumericValidator() },
        { name: 'Adult Unclassified Sex', description: '', validations: basicNumericValidator() },
        { name: 'Yearling - Unclassified Sex', description: '', validations: basicNumericValidator() },
        { name: 'Unclassified Age/Sex', description: '', validations: basicNumericValidator() },
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
          name: 'Sign Age',
          description: '',
          validations: signAgePickListValidator()
        },
        {
          name: 'Habitat',
          description: '',
          validations: habitatPickListValidator()
        },
        {
          name: '% Veg Cover',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '% Snow Cover',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: activityNonTargetedPickListValidator()
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
        },
        {
          file_required_columns_validator: {
            required_columns: ['Group Label']
          }
        }
      ],
      columns: [
        {
          name: 'Target or Non-Targeted',
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
          validators: basicNumericValidator() 
        },
        { 
          name: 'Adult Females', 
          description: '', 
          validators: basicNumericValidator() 
        },
        { 
          name: 'Adults - Unclassified Sex', 
          description: '', 
          validators: basicNumericValidator() 
        },
        { 
          name: 'Juvenile Males', 
          description: '', 
          validators: basicNumericValidator() 
        },
        { 
          name: 'Juvenile Females', 
          description: '', 
          validators: basicNumericValidator() 
        },
        { 
          name: 'Juveniles - Unclassified Sex', 
          description: '', 
          validators: basicNumericValidator() 
        },
        { 
          name: 'Unknown Age/Sex', 
          description: '', 
          validators: basicNumericValidator() 
        },
        {
          name: 'SpeciesOccurrence Status',
          description: '',
          validations: speciesOccurrenceStatusPickListValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: activityNonTargetedPickListValidator()
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
        child_worksheet_name: 'Marked Animals',
        parent_worksheet_name: 'Observations',
        column_names: ['Group Label']
      }
    }
  ]
};

outputValidationSchema(elkSRBTemplateValidationSchema, 'elk_srb_validation_config_output');