import * as fs from 'fs';

/**
 * Stringifies the template object for insertion into the database.
 * 
 * Note: outputName should follow the pattern `template_validation_config_output`
 * Example: `elk_general_validation_config_output`
 * 
 * @param {any} template validation schema for a given template
 * @param {string} outputName output name for the file
 */
export const outputValidationSchema = (template: any, outputName: string) => {
  fs.writeFile(
    `./output/${outputName}.json`,
    JSON.stringify(template),
    (err) => {
      // file written successfully
  
      console.log('All done!');
    }
  );
};

export const basicNumericValidator = () => {
  return [
    {
      column_numeric_validator: {
        name: '',
        description: ''
      }
    }
  ];
};

export const basicDateValidator = () => {
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

export const basicRequiredValidator = () => {
  return [
    {
      column_format_validator: {
        reg_exp: '^(?!s*$).+',
        reg_exp_flags: 'g'
      }
    }
  ];
};

export const sheepSpeciesPickListValidator = () => {
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
            name: 'M-OVCA',
            description: 'M-OVCA'
          },
          {
            name: 'M-OVDA',
            description: 'M-OVDA'
          },
          {
            name: 'M-OVDA-DA',
            description: 'M-OVDA-DA'
          },
          {
            name: 'M-OVDA-ST',
            description: 'M-OVDAST'
          }
        ]
      }
    }
  ];
};

export const goatSpeciesPickListValidator = () => {
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
            name: 'M-ORAM',
            description: 'M-ORAM'
          }
        ]
      }
    }
  ];
};

export const targetPickListValidator = () => {
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

export const frequencyPickListValidator = () => {
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

export const utmZonePickListValidator = () => {
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
            name: '7',
            description: '7'
          },
          {
            name: '8',
            description: '8'
          },
          {
            name: '9',
            description: '9'
          },
          {
            name: '10',
            description: '10'
          },
          {
            name: '11',
            description: '11'
          }
        ]
      }
    }
  ];
};

export const eastingValidator = () => {
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

export const northingValidator = () => {
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

export const surveyOrTelemetryPickListValidator = () => {
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

export const datumPickListValidator = () => {
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

export const signTypePickListValidator = () => {
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

export const ageOfSignPickListValidator = () => {
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

export const aircraftPickListValidator = () => {
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

export const observationActivityPickListValidator = () => {
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

export const activityNonTargetedPickListValidator = () => {
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
            name: 'Activity described in comments',
            description: 'Described in comments'
          }
        ]
      }
    }
  ];
};

export const habitatPickListValidator = () => {
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
            name: 'Alpine',
            description: 'Alpine'
          },
          {
            name: 'Alpine Barren',
            description: 'Alpine Barren'
          },
          {
            name: 'Alpine Heath Meadows',
            description: 'Alpine Heath Meadows'
          },
          {
            name: 'Avalanche Path',
            description: 'Avalanche Path'
          },
          {
            name: 'Avalanche path, herbaceous',
            description: 'Avalanche path, herbaceous'
          },
          {
            name: 'Avalanche path, shrubby',
            description: 'Avalanche path, shrubby'
          },
          {
            name: 'Burn',
            description: 'Burn'
          },
          {
            name: 'Bush or Scrub land',
            description: 'Bush or Scrub land'
          },
          {
            name: 'Caves',
            description: 'Caves'
          },
          {
            name: 'Cutblock',
            description: 'Cutblock'
          },
          {
            name: 'Cutblock, herbaceous',
            description: 'Cutblock, herbaceous'
          },
          {
            name: 'Cutblock, shrubby',
            description: 'Cutblock, shrubby'
          },
          {
            name: 'Cutblock, unvegetated',
            description: 'Cutblock, unvegetated'
          },
          {
            name: 'Cutblock - free to grow',
            description: 'Cutblock - free to grow'
          },
          {
            name: 'Cutblock - mature',
            description: 'Cutblock - mature'
          },
          {
            name: 'Cutblock - not sufficiently restored',
            description: 'Cutblock - not sufficiently restored'
          },
          {
            name: 'Agricultural',
            description: 'Agricultural'
          },
          {
            name: 'Cultivated field',
            description: 'Cultivated field'
          },
          {
            name: 'Cultivated or Agricultural',
            description: 'Cultivated or Agricultural'
          },
          {
            name: 'Cultivated orchard',
            description: 'Cultivated orchard'
          },
          {
            name: 'Cultivated vineyard',
            description: 'Cultivated vineyard'
          },
          {
            name: 'Cutbank',
            description: 'Cutbank'
          },
          {
            name: 'Cliff',
            description: 'Cliff'
          },
          {
            name: 'Cliff, broken',
            description: 'Cliff, broken'
          },
          {
            name: 'Cliff, dissected',
            description: 'Cliff, dissected'
          },
          {
            name: 'Cliff, in forest',
            description: 'Cliff, in forest'
          },
          {
            name: 'Cliff, open',
            description: 'Cliff, open'
          },
          {
            name: 'Electrical transmission line',
            description: 'Electrical transmission line'
          },
          {
            name: 'Estuary',
            description: 'Estuary'
          },
          {
            name: 'Flat or Open Slopes',
            description: 'Flat or Open Slopes'
          },
          {
            name: 'Forest',
            description: 'Forest'
          },
          {
            name: 'Forest, coniferous',
            description: 'Forest, coniferous'
          },
          {
            name: 'Forest, deciduous',
            description: 'Forest, deciduous'
          },
          {
            name: 'Forest, commercially thinned',
            description: 'Forest, commercially thinned'
          },
          {
            name: 'Forest, mature',
            description: 'Forest, mature'
          },
          {
            name: 'Forest, mixed',
            description: 'Forest, mixed'
          },
          {
            name: 'Forest, old',
            description: 'Forest, old'
          },
          {
            name: 'Forest, young',
            description: 'Forest, young'
          },
          {
            name: 'Forest, riparian',
            description: 'Forest, riparian'
          },
          {
            name: 'Glacier',
            description: 'Glacier'
          },
          {
            name: 'Golf course',
            description: 'Golf course'
          },
          {
            name: 'Grassland',
            description: 'Grassland'
          },
          {
            name: 'Gravel bar',
            description: 'Gravel bar'
          },
          {
            name: 'Gravel pit',
            description: 'Gravel pit'
          },
          {
            name: 'Krummholtz',
            description: 'Krummholtz'
          },
          {
            name: 'Lake',
            description: 'Lake'
          },
          {
            name: 'Low-elevation',
            description: 'Low-elevation'
          },
          {
            name: 'Mid-elevation',
            description: 'Mid-elevation'
          },
          {
            name: 'Moraine',
            description: 'Moraine'
          },
          {
            name: 'Parkland',
            description: 'Parkland'
          },

          {
            name: 'Pasture',
            description: 'Pasture'
          },
          {
            name: 'Pipeline right-of-way',
            description: 'Pipeline right-of-way'
          },
          {
            name: 'Railway surface',
            description: 'Railway surface'
          },
          {
            name: 'Reservoir',
            description: 'Reservoir'
          },
          {
            name: 'Ridge',
            description: 'Ridge'
          },

          {
            name: 'Riparian',
            description: 'Riparian'
          },
          {
            name: 'River',
            description: 'River'
          },
          {
            name: 'Rock/Talus',
            description: 'Rock/Talus'
          },
          {
            name: 'Rubble',
            description: 'Rubble'
          },
          {
            name: 'Rock outcrop',
            description: 'Rock outcrop'
          },
          {
            name: 'Scree',
            description: 'Scree'
          },
          {
            name: 'Shrub',
            description: 'Shrub'
          },
          {
            name: 'Shore',
            description: 'Shore'
          },
          {
            name: 'Snow',
            description: 'Snow'
          },
          {
            name: 'Sub-Alpine',
            description: 'Sub-Alpine'
          },
          {
            name: 'Talus/Slope',
            description: 'Talus/Slope'
          },
          {
            name: 'Terraces',
            description: 'Terraces'
          },

          {
            name: 'Timber',
            description: 'Timber'
          },

          {
            name: 'Transportation or Transmission Corridor',
            description: 'Transportation or Transmission Corridor'
          },
          {
            name: 'Urban or Residential',
            description: 'Urban or Residential'
          },
          {
            name: 'Wetland/Meadow',
            description: 'Wetland/Meadow'
          },
          {
            name: 'Willow/Shrub',
            description: 'Willow/Shrub'
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
export const featureTypePickListValidator = () => {
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
export const yesNoPickListValidator = () => {
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

export const presentAbsentPickListValidator = () => {
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

export const lightPickListValidator = () => {
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
            name: 'Bright',
            description: 'Bright'
          },
          {
            name: 'Light',
            description: 'Light'
          },
          {
            name: 'Shady',
            description: 'Shady'
          }
        ]
      }
    }
  ];
};