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

const eastingValidator = () => {
  return [
    {
      column_format_validator: {
        reg_exp: '^[0-9]{6,6}$',
        reg_exp_flags: 'g',
        expected_format: 'Easting needs to be a 6 digit number. For example: 123456.'
      }
    }
  ];
};

const northingValidator = () => {
  return [
    {
      column_format_validator: {
        reg_exp: '^[0-9]{7,7}$',
        reg_exp_flags: 'g',
        expected_format: 'Northing needs to be a 7 digit number. For example: 1234567.'
      }
    }
  ];
};

const utmZoneValidator = () => {
  return [
    {
      column_range_validator: {
        min_value: 7,
        max_value: 11
      }
    }
  ];
};
const mooseSpeciesPickListValidator = () => {
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
            name: 'M-ALAM',
            description: 'M-ALAM'
          }
        ]
      }
    }
  ];
};

const presentAbsentPickListValidator = () => {
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
            name: 'Described in Comment',
            description: 'Described in Comment'
          }
        ]
      }
    }
  ];
};
const aircraftPickListValidator = () => {
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
            name: 'Bell JetRanger',
            description: 'Bell JetRanger'
          },
          {
            name: 'Bell JetRanger without bubble window',
            description: 'Bell JetRanger without bubble window'
          },
          {
            name: 'Bell JetRanger with bubble window',
            description: 'Bell JetRanger with bubble window'
          },
          {
            name: 'Bell LongRanger',
            description: 'Bell LongRanger'
          },
          {
            name: 'Hiller 12E4',
            description: 'Hiller 12E4'
          },
          {
            name: 'Hughes 500D',
            description: 'Hughes 500D'
          },
          {
            name: 'Cessna 172',
            description: 'Cessna 172'
          },
          {
            name: 'Cessna 180',
            description: 'Cessna 180'
          },
          {
            name: 'Cessna 182',
            description: 'Cessna 182'
          },
          {
            name: 'Cessna 185',
            description: 'Cessna 185'
          },
          {
            name: 'Cessna 206',
            description: 'Cessna 206'
          },
          {
            name: 'Super Cub',
            description: 'Super Cub'
          },
          {
            name: 'Beaver',
            description: 'Beaver'
          },
          {
            name: 'Single Otter',
            description: 'Single Otter'
          },
          {
            name: 'Twin Otter',
            description: 'Twin Otter'
          },
          {
            name: 'Bell 406',
            description: 'Bell 406'
          },
          {
            name: 'A-Star',
            description: 'A-Star'
          }
        ]
      }
    }
  ];
};
const datumPickListValidator = () => {
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
            name: 'NAD83',
            description: 'NAD83'
          },
          {
            name: 'NAD27',
            description: 'NAD27'
          },
          {
            name: 'WGS84',
            description: 'WGS84'
          }
        ]
      }
    }
  ];
};
const signTypePickListValidator = () => {
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
            name: 'Antler',
            description: 'Antler'
          },
          {
            name: 'Bed',
            description: 'Bed'
          },
          {
            name: 'Body Parts',
            description: 'Body Parts'
          },
          {
            name: 'Trail',
            description: 'Trail'
          },
          {
            name: 'Tracks',
            description: 'Tracks'
          },
          {
            name: 'Carcass',
            description: 'Carcass'
          },
          {
            name: 'Scratchings',
            description: 'Scratchings'
          },
          {
            name: 'Hair',
            description: 'Hair'
          },
          {
            name: 'Excrement',
            description: 'Excrement'
          },
          {
            name: 'Cache',
            description: 'Cache'
          },
          {
            name: 'Egg Shell',
            description: 'Egg Shell'
          },
          {
            name: 'Feeding',
            description: 'Feeding'
          },
          {
            name: 'Feather',
            description: 'Feather'
          },
          {
            name: 'Pellet Group',
            description: 'Pellet Group'
          },
          {
            name: 'Regurgitated Pellet',
            description: 'Regurgitated Pellet'
          },
          {
            name: 'Shed Skin',
            description: 'Shed Skin'
          },
          {
            name: 'Whitewash',
            description: 'Whitewash'
          },
          {
            name: 'Described in Comments',
            description: 'Pellet Group'
          }
        ]
      }
    }
  ];
};

const ageOfSignPickListValidator = () => {
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
            name: 'New',
            description: 'New'
          },
          {
            name: 'Old',
            description: 'Old'
          },
          {
            name: 'Hour',
            description: 'Hour'
          },
          {
            name: 'Day',
            description: 'Day'
          },
          {
            name: 'Week',
            description: 'Week'
          },
          {
            name: 'Month',
            description: 'Month'
          },
          {
            name: 'Year',
            description: 'Year'
          },
          {
            name: 'Unclassified',
            description: 'Unclassified'
          },
          {
            name: 'Described in Comments',
            description: 'Described in Comments'
          }
        ]
      }
    }
  ];
};
const frequencyPickListValidator = () => {
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
            name: 'KHz',
            description: 'KHz'
          },
          {
            name: 'MHz',
            description: 'MHz'
          },
          {
            name: 'Hz',
            description: 'Hz'
          }
        ]
      }
    }
  ];
};

const surveyOrTelemetryPickListValidator = () => {
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
            name: 'Survey',
            description: 'Survey'
          },
          {
            name: 'Telemetry',
            description: 'Telemetry'
          }
        ]
      }
    }
  ];
};
const observationActivityPickListValidator = () => {
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
            name: 'Standing',
            description: 'Standing'
          },
          {
            name: 'Bedding',
            description: 'Bedding'
          },
          {
            name: 'Running',
            description: 'Running'
          },
          {
            name: 'Walking',
            description: 'Walking'
          },
          {
            name: 'Moving',
            description: 'Moving'
          },
          {
            name: 'Not Moving',
            description: 'Not Moving'
          }
        ]
      }
    }
  ];
};

const activityNonTargettedPickListValidator = () => {
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
            name: 'Alert',
            description: 'Alert'
          },
          {
            name: 'Avoiding Pests',
            description: 'Avoiding Pests'
          },
          {
            name: 'Basking',
            description: 'Basking'
          },
          {
            name: 'Bedding',
            description: 'Bedding'
          },
          {
            name: 'Building',
            description: 'Building'
          },
          {
            name: 'Cashing',
            description: 'Cashing'
          },
          {
            name: 'Casting',
            description: 'Casting'
          },
          {
            name: 'Courting',
            description: 'Courting'
          },
          {
            name: 'Denning',
            description: 'Denning'
          },
          {
            name: 'Disturbed',
            description: 'Disturbed'
          },
          {
            name: 'Drinking',
            description: 'Drinking'
          },
          {
            name: 'Excreting',
            description: 'Excreting'
          },
          {
            name: 'Feeding',
            description: 'Feeding'
          },
          {
            name: 'Fleeing',
            description: 'Fleeing'
          },
          {
            name: 'Feeding salmonid',
            description: 'Feeding salmonid'
          },
          {
            name: 'Grooming',
            description: 'Grooming'
          },
          {
            name: 'Habitat',
            description: 'Habitat'
          },
          {
            name: 'Hibernating',
            description: 'Hibernating'
          },
          {
            name: 'Hunting',
            description: 'Building'
          },
          {
            name: 'Ingesting Minerals',
            description: 'Ingesting Minerals'
          },
          {
            name: 'Incubating',
            description: 'Incubating'
          },
          {
            name: 'Living',
            description: 'Living'
          },
          {
            name: 'Migrating Daily',
            description: 'Migrating Daily'
          },
          {
            name: 'Migrating Seasonally',
            description: 'Migrating Seasonally'
          },
          {
            name: 'Reproducing birthing',
            description: 'Reproducing birthing'
          },
          {
            name: 'Reproducing eggs',
            description: 'Reproducing eggs'
          },
          {
            name: 'Rearing',
            description: 'Rearing'
          },
          {
            name: 'Standing',
            description: 'Standing'
          },
          {
            name: 'Security and/or Thermal',
            description: 'Security and/or Thermal'
          },
          {
            name: 'Thermal',
            description: 'Thermal'
          },
          {
            name: 'Territoriality',
            description: 'Territoriality'
          },
          {
            name: 'Not Traveling',
            description: 'Not Traveling'
          },
          {
            name: 'Traveling, Flying',
            description: 'Traveling flying'
          },
          {
            name: 'Traveling, Unclassified',
            description: 'Traveling, Unclassified'
          },
          {
            name: 'Traveling, Walking',
            description: 'Traveling, Walking'
          },
          {
            name: 'Traveling on a Path',
            description: 'Traveling on a Path'
          },
          {
            name: 'Traveling, Running',
            description: 'Traveling running'
          },
          {
            name: 'Traveling, Swimming',
            description: 'Traveling, Swimming'
          },
          {
            name: 'Traveling, Heli-Skiing',
            description: 'Traveling, Heli-Skiing'
          },
          {
            name: 'Traveling, Skiing',
            description: 'Traveling, Skiing'
          },
          {
            name: 'Traveling, Snowmobiling',
            description: 'Traveling, Snowmobiling'
          },
          {
            name: 'Traveling, Snowshoeing',
            description: 'Traveling, Snowshoeing'
          },
          {
            name: 'Traveling, Snow Cat',
            description: 'Traveling, Snow Cat'
          },
          {
            name: 'Urinating',
            description: 'Urinating'
          },
          {
            name: 'Described in comments',
            description: 'Described in comments'
          }
        ]
      }
    }
  ];
};
const targetPickListValidator = () => {
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
            name: 'Targeted',
            description: 'Targeted'
          },
          {
            name: 'Non-Targeted',
            description: 'Non-Targeted'
          }
        ]
      }
    }
  ];
};
const featureTypePickListValidator = () => {
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
            name: 'Breeding Site',
            description: 'Breeding Site'
          },
          {
            name: 'Maternity Roost',
            description: 'Maternity Roost'
          },
          {
            name: 'Bat Nursery Roost',
            description: 'Bat Nursery Roost'
          },
          {
            name: 'Rookery',
            description: 'Rookery'
          },

          {
            name: 'Courting Site',
            description: 'Courting Site'
          },
          {
            name: 'Feeding Site',
            description: 'Feeding Site'
          },

          {
            name: 'Resting Site',
            description: 'Resting Site'
          },
          {
            name: 'Staging Site',
            description: 'Staging Site'
          },
          {
            name: 'Ungulate Winter Range',
            description: 'Ungulate Winter Range'
          },
          {
            name: 'Hibernaculum',
            description: 'Hibernaculum'
          },
          {
            name: 'Roost',
            description: 'Roost'
          },
          {
            name: 'Wallow',
            description: 'Wallow'
          },
          {
            name: 'Mineral Lick',
            description: 'Mineral Lick'
          },
          {
            name: 'Burrow',
            description: 'Burrow'
          },
          {
            name: 'Den',
            description: 'Den'
          },
          {
            name: 'Lodge',
            description: 'Lodge'
          },
          {
            name: 'Nest',
            description: 'Nest'
          },
          {
            name: 'Nest Tree',
            description: 'Nest Tree'
          },
          {
            name: 'Plant Community',
            description: 'Plant Community'
          },
          {
            name: 'Plant Site',
            description: 'Plant Site'
          },
          {
            name: 'Hot Spring',
            description: 'Hot Spring'
          },
          {
            name: 'Water',
            description: 'Water'
          },
          {
            name: 'Fisheries Sensitive Feature',
            description: 'Fisheries Sensitive Feature'
          },
          {
            name: 'Marine Sensitive Feature',
            description: 'Marine Sensitive Feature'
          },
          {
            name: 'Described in Comments',
            description: 'Pellet Group'
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
          name: 'Stratum',
          description: '',
          validations: stratumPickListValidator()
        },
        {
          name: 'Sampled (Y/N)',
          description: '',
          validations: yesNoPickListValidator()
        }
      ]
    },
    {
      name: 'Effort & Site Conditions',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: []
          }
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
            required_columns: ['Study Area', 'Block ID/SU ID', 'Stratum', 'Date', 'Species']
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
          validations: utmZoneValidator()
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
          validations: mooseSpeciesPickListValidator()
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
        },
        {
          file_required_columns_validator: {
            required_columns: []
          }
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
        },
        {
          file_required_columns_validator: {
            required_columns: []
          }
        }
      ],
      columns: [
        {
          name: 'UTM Zone',
          description: '',
          validations: utmZoneValidator()
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
        parent_worksheet_name: 'Observations',
        child_worksheet_name: 'Marked Animals',
        column_names: ['Group Label']
      }
    }
  ]
};

fs.writeFile('./output/moose_SRB_validation_config_output.json', JSON.stringify(mooseSRBTemplateValidationSchema), (err) => {
  if (err) {
    console.error(err);
  }
  // file written successfully

  console.log('All done!');
});
