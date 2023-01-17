import * as fs from 'fs';
import {
  activityNonTargettedPickListValidator,
  ageOfSignPickListValidator,
  aircraftPickListValidator,
  basicNumericValidator,
  datumPickListValidator,
  featureTypePickListValidator,
  frequencyPickListValidator,
  goatSpeciesPickListValidator,
  habitatPickListValidator,
  observationActivityPickListValidator,
  presentAbsentPickListValidator,
  sheepSpeciesPickListValidator,
  signTypePickListValidator,
  surveyOrTelemetryPickListValidator,
  targetPickListValidator,
  // utmZonePickListValidator,
  yesNoPickListValidator
} from './validation-config-helpers';

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

const sheepTemplateValidationSchema = {
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
          validations: sheepSpeciesPickListValidator()
        },
        {
          name: 'BC RISC Class I Rams',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class II Rams',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class III Rams',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class IV Rams',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Ram - Unclassified',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Yearling Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Ewes',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Yearlings',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Lambs',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Ewe-Like Sheep',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adults Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unclassified Age/Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Total Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sign Count',
          description: '',
          validations: basicNumericValidator()
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
          name: 'Elevation (m) of Observation',
          description: '',
          validations: basicNumericValidator()
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
        },
        {
          name: 'Sign Type',
          description: '',
          validations: signTypePickListValidator()
        },
        {
          name: 'Sign Age',
          description: '',
          validations: ageOfSignPickListValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: observationActivityPickListValidator()
        },
        {
          name: 'Habitat',
          description: '',
          validations: habitatPickListValidator()
        },
        {
          name: 'Terrain Obstruction',
          description: '',
          validations: yesNoPickListValidator()
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      validations: [],
      columns: [
        {
          name: 'Date',
          description: '',
          validations: []
        },
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
          validations: presentAbsentPickListValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: activityNonTargettedPickListValidator()
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
          name: 'FEature Type Count',
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

const goatTemplateValidationSchema = {
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
          validations: goatSpeciesPickListValidator()
        },
        {
          name: 'Adults Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Kid',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Nanny',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Billy',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unclassified Age/Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Total Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sign Count',
          description: '',
          validations: basicNumericValidator()
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
          name: 'Elevation (m) of Observation',
          description: '',
          validations: basicNumericValidator()
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
        },
        {
          name: 'Sign Type',
          description: '',
          validations: signTypePickListValidator()
        },
        {
          name: 'Sign Age',
          description: '',
          validations: ageOfSignPickListValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: observationActivityPickListValidator()
        },
        {
          name: 'Habitat',
          description: '',
          validations: habitatPickListValidator()
        },
        {
          name: 'Terrain Obstruction',
          description: '',
          validations: yesNoPickListValidator()
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      validations: [],
      columns: [
        {
          name: 'Date',
          description: '',
          validations: []
        },
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
          validations: presentAbsentPickListValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: activityNonTargettedPickListValidator()
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
          name: 'FEature Type Count',
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


fs.writeFile('./output/goat_validation_config_output.json', JSON.stringify(goatTemplateValidationSchema), (err) => {
  // file written successfully

  console.log('All done!');
});
