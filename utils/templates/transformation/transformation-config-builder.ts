import Ajv from 'ajv';
import * as fs from 'fs';
import { transformationConfigJSONSchema } from '../../../api/src/utils/media/xlsx/transformation/xlsx-transform-schema';
import { TransformSchema } from '../../../api/src/utils/media/xlsx/transformation/xlsx-transform-schema-parser';
import { createPathField, createValueField, getValuesByName } from './xlsx-transform-json-path-queries';

// Build your transform config here, using any helper typescript functions or variables to reduce the manual effort
// needed to make the config.

const TRANSFORMATION_SCHEMA: TransformSchema = {
  templateMeta: [
    {
      sheetName: 'Observations',
      primaryKey: ['Study Area', 'Block ID/SU ID'],
      parentKey: [],
      type: 'root',

      foreignKeys: [
        {
          sheetName: 'Marked Animals',
          primaryKey: ['Group Label']
        }
      ]
    },
    {
      sheetName: 'Marked Animals',
      primaryKey: ['Wildlife Health ID', 'Animal ID', 'Telemetry Device ID'],
      parentKey: ['Group Label'],
      type: '',
      foreignKeys: []
    }
  ],
  map: [
    {
      sheetName: 'record',
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'basisOfRecord ',
          columnValue: [
            {
              static: 'HumanObservation'
            }
          ]
        }
      ]
    },
    {
      sheetName: 'event',
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'eventDate',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['Date'])]
            }
          ]
        },
        {
          columnName: 'eventRemarks',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['Observation Comments'])]
            }
          ]
        }
      ]
    },
    {
      sheetName: 'location',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['_key']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'verbatimCoordinates',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['UTM Zone', 'Easting', 'Northing'])],
              join: ' '
            },
            {
              paths: [getValuesByName('Observations', ['Lat (DD)', 'Long (DD)'])],
              join: ' '
            }
          ]
        },
        {
          columnName: 'decimalLatitude',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['Lat (DD)'])]
            }
          ]
        },
        {
          columnName: 'decimalLongitude',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['Long (DD)'])]
            }
          ]
        },
        {
          columnName: 'verbatimSRS',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['Datum'])]
            }
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['BC RISC Class I Rams']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '0'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['BC RISC Class I Rams']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '0'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'BC RISC Class I Rams')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['Sub-Prime Bulls']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '1'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Sub-Prime Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'unknown'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '1'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'Sub-Prime')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['Prime Bulls']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '2'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Prime Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '2'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'Prime')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['Senior Bulls']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '3'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Senior Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '3'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'Senior')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['3 Brow/10 Points Bulls']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '4'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['3 Brow/10 Points Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '4'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', '3 Brow/10 Points')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['BC RISC Yearling Bulls']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '5'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['BC RISC Yearling Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'yearling'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '5'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'BC RISC Yearling')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['BC RISC Class I Bulls']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '6'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['BC RISC Class I Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'unknown'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '6'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'BC RISC Class I')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['BC RISC Class II Bulls']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '7'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['BC RISC Class II Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '7'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'BC RISC Class II')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['BC RISC Class III Bulls']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '8'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['BC RISC Class III Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '8'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'BC RISC Class III')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Oswald (1997) Class I Bulls']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '9'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Oswald (1997) Class I Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'unknown'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '9'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'Oswald (1997) Class I')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Oswald (1997) Class II Bulls']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '10'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Oswald (1997) Class II Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'unknown'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '10'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'Oswald (1997) Class II')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Oswald (1997) Class III Bulls']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '11'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Oswald (1997) Class III Bulls']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ],
      add: [
        {
          sheetName: 'measurementOrFact',
          fields: [
            {
              columnName: 'eventID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
                }
              ]
            },
            {
              columnName: 'measurementID',
              columnValue: [
                {
                  paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: 'antler-configuration'
                  }
                }
              ]
            },
            {
              columnName: 'occurrenceID',
              columnValue: [
                {
                  paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
                  postfix: {
                    static: '11'
                  }
                }
              ]
            },
            createValueField('measurementType', 'Antler Configuration'),
            createValueField('measurementUnit', ''),
            createValueField('measurementValue', 'Oswald (1997) Class III')
          ]
        }
      ]
    },
    {
      sheetName: 'occurrence',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Adult Bulls - Unclassified']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '12'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Adult Bulls - Unclassified']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['Bulls - Unclassified']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '13'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Bulls - Unclassified']),
        createValueField('sex', 'male'),
        createValueField('lifeStage', 'unknown'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['Cow']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '14'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Cow']),
        createValueField('sex', 'female'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['Calves']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '15'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Calves']),
        createValueField('sex', 'unknown'),
        createValueField('lifeStage', 'juvenile'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['Adult Unclassified Sex']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '16'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Adult Unclassified Sex']),
        createValueField('sex', 'unknown'),
        createValueField('lifeStage', 'adult'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ]
    },
    {
      sheetName: 'occurrence',
      condition: { type: 'and', checks: [{ ifNotEmpty: getValuesByName('Observations', ['Unclassified Age/Sex']) }] },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'occurrenceID',
          columnValue: [
            {
              paths: [getValuesByName('Observations', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: '17'
              }
            }
          ]
        },
        createPathField('individualCount', 'Observations', ['Unclassified Age/Sex']),
        createValueField('sex', 'unknown'),
        createValueField('lifeStage', 'unknown'),
        createPathField('taxonID', 'Observations', ['Species']),
        createPathField('occurrenceRemarks', 'Observations', ['Observation Comments'])
      ]
    },
    {
      sheetName: 'organism',
      condition: {
        type: 'and',
        checks: [
          { ifNotEmpty: getValuesByName('Marked Animals', ['Wildlife Health ID', 'Animal ID', 'Telemetry Device ID']) }
        ]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        createPathField('organismRemarks', 'Marked Animals', ['Marked Animals Comments'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'study-area'
              }
            }
          ]
        },
        createValueField('measurementType', 'Study Area'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Block Summary', ['Study Area'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'block-id/su-id'
              }
            }
          ]
        },
        createValueField('measurementType', 'Block ID/SU ID'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Block Summary', ['Block ID/SU ID'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'stratum'
              }
            }
          ]
        },
        createValueField('measurementType', 'Stratum'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Block Summary', ['Stratum'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'stratum/block-area'
              }
            }
          ]
        },
        createValueField('measurementType', 'Stratum/Block Area'),
        createValueField('measurementUnit', 'km2'),
        createPathField('measurementValue', 'Block Summary', ['Stratum/Block Area (km2)'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'sampled'
              }
            }
          ]
        },
        createValueField('measurementType', 'Sampled'),
        createValueField('measurementUnit', 'Y/N'),
        createPathField('measurementValue', 'Block Summary', ['Sampled (Y/N)'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Group Label']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'group-label'
              }
            }
          ]
        },
        createValueField('measurementType', 'Group Label'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Group Label'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Cow W/1 calves']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'cow-w/1-calf'
              }
            }
          ]
        },
        createValueField('measurementType', 'Cow W/1 calf'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Cow W/1 calf'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Cow W/2 calves']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'cow-w/2-calves'
              }
            }
          ]
        },
        createValueField('measurementType', 'Cow W/2 calves'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Cow W/2 calves'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'or',
        checks: [
          { ifNotEmpty: getValuesByName('Observations', ['Sign Type']) },
          { ifNotEmpty: getValuesByName('Observations', ['Sign Count']) }
        ]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'sign-type'
              }
            }
          ]
        },
        createValueField('measurementType', 'Sign Type'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Sign Type'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'or',
        checks: [
          { ifNotEmpty: getValuesByName('Observations', ['Sign Count']) },
          { ifNotEmpty: getValuesByName('Observations', ['Sign Type']) }
        ]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'sign-count'
              }
            }
          ]
        },
        createValueField('measurementType', 'Sign Count'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Sign Count'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Age of Sign']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'age-of-sign'
              }
            }
          ]
        },
        createValueField('measurementType', 'Age of Sign'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Age of Sign'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Veg Cover (%)']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'veg-cover'
              }
            }
          ]
        },
        createValueField('measurementType', 'Veg Cover'),
        createValueField('measurementUnit', '%'),
        createPathField('measurementValue', 'Observations', ['Veg Cover (%)'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Snow Cover (%)']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'snow-cover'
              }
            }
          ]
        },
        createValueField('measurementType', 'Snow Cover'),
        createValueField('measurementUnit', '%'),
        createPathField('measurementValue', 'Observations', ['Snow Cover (%)'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Activity']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'activity'
              }
            }
          ]
        },
        createValueField('measurementType', 'Activity'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Activity'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Number of Marked Animals Observed']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'number-of-marked-animals-observed'
              }
            }
          ]
        },
        createValueField('measurementType', 'Number of Marked Animals Observed'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Number of Marked Animals Observed'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Survey or Telemetry Search']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'survey-or-telemetry-search'
              }
            }
          ]
        },
        createValueField('measurementType', 'Survey or Telemetry Search'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Survey or Telemetry Search'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Photos']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])],
              postfix: {
                static: 'photos'
              }
            }
          ]
        },
        createValueField('measurementType', 'Photos'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Observations', ['Photos'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Observations', ['Targeted or Non-Targeted']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'targeted-or-non-targeted'
              }
            }
          ]
        },
        createValueField('measurementType', 'Targeted or Non-Targeted'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Marked Animals', ['Targeted or Non-Targeted'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Marked Animals', ['Wildlife Health ID']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'wildlife-health-id'
              }
            }
          ]
        },
        createValueField('measurementType', 'Wildlife Health ID'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Marked Animals', ['Wildlife Health ID'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Marked Animals', ['Animal ID']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'animal-id'
              }
            }
          ]
        },
        createValueField('measurementType', 'Animal ID'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Marked Animals', ['Animal ID'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Marked Animals', ['Telemetry Device ID']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'telemetry-device-id'
              }
            }
          ]
        },
        createValueField('measurementType', 'Telemetry Device ID'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Marked Animals', ['Telemetry Device ID'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Marked Animals', ['Collar/Tag Frequency']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'collar/tag-frequency'
              }
            }
          ]
        },
        createValueField('measurementType', 'Collar/Tag Frequency'),
        createPathField('measurementUnit', 'Marked Animals', ['Frequency Unit']),
        createPathField('measurementValue', 'Marked Animals', ['Collar/Tag Frequency'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Marked Animals', ['Right Ear Tag ID']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'right-ear-tag-id'
              }
            }
          ]
        },
        createValueField('measurementType', 'Right Ear Tag ID'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Marked Animals', ['Right Ear Tag ID'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Marked Animals', ['Right Ear Tag Colour']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'right-ear-tag-colour'
              }
            }
          ]
        },
        createValueField('measurementType', 'Right Ear Tag Colour'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Marked Animals', ['Right Ear Tag Colour'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Marked Animals', ['Left Ear Tag ID']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'left-ear-tag-id'
              }
            }
          ]
        },
        createValueField('measurementType', 'Left Ear Tag ID'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Marked Animals', ['Left Ear Tag ID'])
      ]
    },
    {
      sheetName: 'measurementOrFact',
      condition: {
        type: 'and',
        checks: [{ ifNotEmpty: getValuesByName('Marked Animals', ['Left Ear Tag Colour']) }]
      },
      fields: [
        {
          columnName: 'eventID',
          columnValue: [
            {
              paths: [getValuesByName('Block Summary', ['_key']), getValuesByName('Observations', ['_row'])]
            }
          ]
        },
        {
          columnName: 'organismID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])]
            }
          ]
        },
        {
          columnName: 'measurementID',
          columnValue: [
            {
              paths: [getValuesByName('Marked Animals', ['_key']), getValuesByName('Marked Animals', ['_row'])],
              postfix: {
                static: 'left-ear-tag-colour'
              }
            }
          ]
        },
        createValueField('measurementType', 'Left Ear Tag Colour'),
        createValueField('measurementUnit', ''),
        createPathField('measurementValue', 'Marked Animals', ['Left Ear Tag Colour'])
      ]
    }
  ],
  dwcMeta: [
    {
      sheetName: 'record',
      primaryKey: ['eventID']
    },
    {
      sheetName: 'event',
      primaryKey: ['eventID']
    },
    {
      sheetName: 'location',
      primaryKey: ['eventID']
    },
    {
      sheetName: 'occurrence',
      primaryKey: ['occurrenceID']
    },
    {
      sheetName: 'organism',
      primaryKey: ['organismID']
    },
    {
      sheetName: 'measurementOrFact',
      primaryKey: ['eventID', 'measurementID', 'occurrenceID', 'organismID']
    }
  ]
};
//const TRANSFORMATION_SCHEMA: TransformSchema = { dwcMeta: [], map: [], templateMeta: [] };

// Validates the config against the json-schema definition to catch errors early
const ajv = new Ajv();
ajv.validate(transformationConfigJSONSchema, TRANSFORMATION_SCHEMA);
if (ajv.errors) {
  console.log(ajv.errors);
  throw new Error(JSON.stringify(ajv.errors));
}

// Write the raw transform JSON config.
fs.writeFile('./output/transformation_config_output.json', JSON.stringify(TRANSFORMATION_SCHEMA), (error) => {
  if (error) {
    throw new Error(JSON.stringify(error));
  }
  // file written successfully
  console.log('All done!');
});
