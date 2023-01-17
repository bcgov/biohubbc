set
  search_path = biohub;

set schema
  'biohub';

do $ $ DECLARE _template_name varchar := $ _template_name $ Sheep Aerial Population Total Count Recruitment Composition Survey $ _template_name $;

_template_version varchar := $ _template_version $ 2.0 $ _template_version $;

_template_description varchar := $ _template_description $ Sheep Aerial Population Total Count Recruitment Composition Survey $ _template_description $;

_field_method_name varchar := null;

_validation_config varchar := $ _validation_config $ { "name" :"",
"description" :"",
"files" :[{"name":"Effort & Site Conditions","description":"","validations":[{"file_duplicate_columns_validator":{}},{"file_required_columns_validator":{"required_columns":["Study Area"] } } ],
"columns" :[{"name":"Aircraft Type","description":"","validations":[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Bell JetRanger","description":"Bell JetRanger"},{"name":"Bell JetRanger without bubble window","description":"Bell JetRanger without bubble window"},{"name":"Bell JetRanger with bubble window","description":"Bell JetRanger with bubble window"},{"name":"Bell LongRanger","description":"Bell LongRanger"},{"name":"Hiller 12E4","description":"Hiller 12E4"},{"name":"Hughes 500D","description":"Hughes 500D"},{"name":"Cessna 172","description":"Cessna 172"},{"name":"Cessna 180","description":"Cessna 180"},{"name":"Cessna 182","description":"Cessna 182"},{"name":"Cessna 185","description":"Cessna 185"},{"name":"Cessna 206","description":"Cessna 206"},{"name":"Super Cub","description":"Super Cub"},{"name":"Beaver","description":"Beaver"},{"name":"Single Otter","description":"Single Otter"},{"name":"Twin Otter","description":"Twin Otter"},{"name":"Bell 406","description":"Bell 406"},{"name":"A-Star","description":"A-Star"}] } } ] } ] },
{ "name" :"Observations",
"description" :"",
"validations" :[{"file_duplicate_columns_validator":{}},{"file_required_columns_validator":{"required_columns":["Study Area","Date","Species"] } } ],
"columns" :[{"name":"Easting","description":"","validations":[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Northing",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Datum",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"NAD83","description":"NAD83"},{"name":"NAD27","description":"NAD27"},{"name":"WGS84","description":"WGS84"}] } } ] },
{ "name" :"Lat (DD)",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Long (DD)",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Species",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"M-OVCA","description":"M-OVCA"},{"name":"M-OVDA","description":"M-OVDA"},{"name":"M-OVDA-DA","description":"M-OVDA-DA"},{"name":"M-OVDA-ST","description":"M-OVDAST"}] } } ] },
{ "name" :"BC RISC Class I Rams",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"BC RISC Class II Rams",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"BC RISC Class III Rams",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"BC RISC Class IV Rams",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Ram - Unclassified",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"BC RISC Yearling Bulls",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Ewes",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Yearlings",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Lambs",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Ewe-Like Sheep",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Adults Unclassified Sex",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Unclassified Age/Sex",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Total Count",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Sign Count",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Veg Cover (%)",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Snow Cover (%)",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Elevation (m) of Observation",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Number of Marked Animals Observed",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Survey or Telemetry Search",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Survey","description":"Survey"},{"name":"Telemetry","description":"Telemetry"}] } } ] },
{ "name" :"Sign Type",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Antler","description":"Antler"},{"name":"Bed","description":"Bed"},{"name":"Body Parts","description":"Body Parts"},{"name":"Trail","description":"Trail"},{"name":"Tracks","description":"Tracks"},{"name":"Carcass","description":"Carcass"},{"name":"Scratchings","description":"Scratchings"},{"name":"Hair","description":"Hair"},{"name":"Excrement","description":"Excrement"},{"name":"Cache","description":"Cache"},{"name":"Egg Shell","description":"Egg Shell"},{"name":"Feeding","description":"Feeding"},{"name":"Feather","description":"Feather"},{"name":"Pellet Group","description":"Pellet Group"},{"name":"Regurgitated Pellet","description":"Regurgitated Pellet"},{"name":"Shed Skin","description":"Shed Skin"},{"name":"Whitewash","description":"Whitewash"},{"name":"Described in Comments","description":"Pellet Group"}] } } ] },
{ "name" :"Sign Age",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"New","description":"New"},{"name":"Old","description":"Old"},{"name":"Hour","description":"Hour"},{"name":"Day","description":"Day"},{"name":"Week","description":"Week"},{"name":"Month","description":"Month"},{"name":"Year","description":"Year"},{"name":"Unclassified","description":"Unclassified"},{"name":"Described in Comments","description":"Described in Comments"}] } } ] },
{ "name" :"Activity",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Standing","description":"Standing"},{"name":"Bedding","description":"Bedding"},{"name":"Running","description":"Running"},{"name":"Walking","description":"Walking"},{"name":"Moving","description":"Moving"},{"name":"Not Moving","description":"Not Moving"}] } } ] },
{ "name" :"Habitat",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Alpine","description":"Alpine"},{"name":"Alpine Barren","description":"Alpine Barren"},{"name":"Alpine Heath Meadows","description":"Alpine Heath Meadows"},{"name":"Avalanche Path","description":"Avalanche Path"},{"name":"Avalanche path, herbaceous","description":"Avalanche path, herbaceous"},{"name":"Avalanche path, shrubby","description":"Avalanche path, shrubby"},{"name":"Burn","description":"Burn"},{"name":"Bush or Scrub land","description":"Bush or Scrub land"},{"name":"Caves","description":"Caves"},{"name":"Cutblock","description":"Cutblock"},{"name":"Cutblock, herbaceous","description":"Cutblock, herbaceous"},{"name":"Cutblock, shrubby","description":"Cutblock, shrubby"},{"name":"Cutblock, unvegetated","description":"Cutblock, unvegetated"},{"name":"Cutblock - free to grow","description":"Cutblock - free to grow"},{"name":"Cutblock - mature","description":"Cutblock - mature"},{"name":"Cutblock - not sufficiently restored","description":"Cutblock - not sufficiently restored"},{"name":"Agricultural","description":"Agricultural"},{"name":"Cultivated field","description":"Cultivated field"},{"name":"Cultivated or Agricultural","description":"Cultivated or Agricultural"},{"name":"Cultivated orchard","description":"Cultivated orchard"},{"name":"Cultivated vineyard","description":"Cultivated vineyard"},{"name":"Cutbank","description":"Cutbank"},{"name":"Cliff","description":"Cliff"},{"name":"Cliff, broken","description":"Cliff, broken"},{"name":"Cliff, dissected","description":"Cliff, dissected"},{"name":"Cliff, in forest","description":"Cliff, in forest"},{"name":"Cliff, open","description":"Cliff, open"},{"name":"Electrical transmission line","description":"Electrical transmission line"},{"name":"Estuary","description":"Estuary"},{"name":"Flat or Open Slopes","description":"Flat or Open Slopes"},{"name":"Forest","description":"Forest"},{"name":"Forest, coniferous","description":"Forest, coniferous"},{"name":"Forest, deciduous","description":"Forest, deciduous"},{"name":"Forest, commercially thinned","description":"Forest, commercially thinned"},{"name":"Forest, mature","description":"Forest, mature"},{"name":"Forest, mixed","description":"Forest, mixed"},{"name":"Forest, old","description":"Forest, old"},{"name":"Forest, young","description":"Forest, young"},{"name":"Forest, riparian","description":"Forest, riparian"},{"name":"Glacier","description":"Glacier"},{"name":"Golf course","description":"Golf course"},{"name":"Grassland","description":"Grassland"},{"name":"Gravel bar","description":"Gravel bar"},{"name":"Gravel pit","description":"Gravel pit"},{"name":"Krummholtz","description":"Krummholtz"},{"name":"Lake","description":"Lake"},{"name":"Low-elevation","description":"Low-elevation"},{"name":"Mid-elevation","description":"Mid-elevation"},{"name":"Moraine","description":"Moraine"},{"name":"Parkland","description":"Parkland"},{"name":"Pasture","description":"Pasture"},{"name":"Pipeline right-of-way","description":"Pipeline right-of-way"},{"name":"Railway surface","description":"Railway surface"},{"name":"Reservoir","description":"Reservoir"},{"name":"Ridge","description":"Ridge"},{"name":"Riparian","description":"Riparian"},{"name":"River","description":"River"},{"name":"Rock/Talus","description":"Rock/Talus"},{"name":"Rubble","description":"Rubble"},{"name":"Rock outcrop","description":"Rock outcrop"},{"name":"Scree","description":"Scree"},{"name":"Shrub","description":"Shrub"},{"name":"Shore","description":"Shore"},{"name":"Snow","description":"Snow"},{"name":"Sub-Alpine","description":"Sub-Alpine"},{"name":"Talus/Slope","description":"Talus/Slope"},{"name":"Terraces","description":"Terraces"},{"name":"Timber","description":"Timber"},{"name":"Transportation or Transmission Corridor","description":"Transportation or Transmission Corridor"},{"name":"Urban or Residential","description":"Urban or Residential"},{"name":"Wetland/Meadow","description":"Wetland/Meadow"},{"name":"Willow/Shrub","description":"Willow/Shrub"},{"name":"Described in Comments","description":"Described in Comments"}] } } ] },
{ "name" :"Terrain Obstruction",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Yes","description":"Yes"},{"name":"No","description":"No"}] } } ] } ] },
{ "name" :"Marked Animals",
"description" :"",
"validations" :[],
"columns" :[{"name":"Date","description":"","validations":[] },
{ "name" :"Targeted or Non-Targeted",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Targeted","description":"Targeted"},{"name":"Non-Targeted","description":"Non-Targeted"}] } } ] },
{ "name" :"Frequency Unit",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"KHz","description":"KHz"},{"name":"MHz","description":"MHz"},{"name":"Hz","description":"Hz"}] } } ] } ] },
{ "name" :"Incidental Observations",
"description" :"",
"validations" :[],
"columns" :[{"name":"Study Area","description":"","validations":[] },
{ "name" :"Block ID/SU ID",
"description" :"",
"validations" :[] },
{ "name" :"Easting",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Northing",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Datum",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"NAD83","description":"NAD83"},{"name":"NAD27","description":"NAD27"},{"name":"WGS84","description":"WGS84"}] } } ] },
{ "name" :"Lat (DD)",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Long (DD)",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Time",
"description" :"",
"validations" :[] },
{ "name" :"Species",
"description" :"",
"validations" :[] },
{ "name" :"Adult Males",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Adult Females",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Adults - Unclassified Sex",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Juvenile Males",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Juvenile Females",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Juveniles - Unclassified Sex",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Unknown Age/Sex",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Species Occurrence Status",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Present","description":"Present"},{"name":"Absent","description":"Absent"}] } } ] },
{ "name" :"Activity",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Alert","description":"Alert"},{"name":"Avoiding Pests","description":"Avoiding Pests"},{"name":"Basking","description":"Basking"},{"name":"Bedding","description":"Bedding"},{"name":"Building","description":"Building"},{"name":"Cashing","description":"Cashing"},{"name":"Casting","description":"Casting"},{"name":"Courting","description":"Courting"},{"name":"Denning","description":"Denning"},{"name":"Disturbed","description":"Disturbed"},{"name":"Drinking","description":"Drinking"},{"name":"Excreting","description":"Excreting"},{"name":"Feeding","description":"Feeding"},{"name":"Fleeing","description":"Fleeing"},{"name":"Feeding salmonid","description":"Feeding salmonid"},{"name":"Grooming","description":"Grooming"},{"name":"Habitat","description":"Habitat"},{"name":"Hibernating","description":"Hibernating"},{"name":"Hunting","description":"Building"},{"name":"Ingesting Minerals","description":"Ingesting Minerals"},{"name":"Incubating","description":"Incubating"},{"name":"Living","description":"Living"},{"name":"Migrating Daily","description":"Migrating Daily"},{"name":"Migrating Seasonally","description":"Migrating Seasonally"},{"name":"Reproducing birthing","description":"Reproducing birthing"},{"name":"Reproducing eggs","description":"Reproducing eggs"},{"name":"Rearing","description":"Rearing"},{"name":"Standing","description":"Standing"},{"name":"Security and/or Thermal","description":"Security and/or Thermal"},{"name":"Thermal","description":"Thermal"},{"name":"Territoriality","description":"Territoriality"},{"name":"Not Traveling","description":"Not Traveling"},{"name":"Traveling, Flying","description":"Traveling flying"},{"name":"Traveling, Unclassified","description":"Traveling, Unclassified"},{"name":"Traveling, Walking","description":"Traveling, Walking"},{"name":"Traveling on a Path","description":"Traveling on a Path"},{"name":"Traveling, Running","description":"Traveling running"},{"name":"Traveling, Swimming","description":"Traveling, Swimming"},{"name":"Traveling, Heli-Skiing","description":"Traveling, Heli-Skiing"},{"name":"Traveling, Skiing","description":"Traveling, Skiing"},{"name":"Traveling, Snowmobiling","description":"Traveling, Snowmobiling"},{"name":"Traveling, Snowshoeing","description":"Traveling, Snowshoeing"},{"name":"Traveling, Snow Cat","description":"Traveling, Snow Cat"},{"name":"Urinating","description":"Urinating"},{"name":"Described in comments","description":"Described in comments"}] } } ] },
{ "name" :"Activity Count",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Feature Type",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Breeding Site","description":"Breeding Site"},{"name":"Maternity Roost","description":"Maternity Roost"},{"name":"Bat Nursery Roost","description":"Bat Nursery Roost"},{"name":"Rookery","description":"Rookery"},{"name":"Courting Site","description":"Courting Site"},{"name":"Feeding Site","description":"Feeding Site"},{"name":"Resting Site","description":"Resting Site"},{"name":"Staging Site","description":"Staging Site"},{"name":"Ungulate Winter Range","description":"Ungulate Winter Range"},{"name":"Hibernaculum","description":"Hibernaculum"},{"name":"Roost","description":"Roost"},{"name":"Wallow","description":"Wallow"},{"name":"Mineral Lick","description":"Mineral Lick"},{"name":"Burrow","description":"Burrow"},{"name":"Den","description":"Den"},{"name":"Lodge","description":"Lodge"},{"name":"Nest","description":"Nest"},{"name":"Nest Tree","description":"Nest Tree"},{"name":"Plant Community","description":"Plant Community"},{"name":"Plant Site","description":"Plant Site"},{"name":"Hot Spring","description":"Hot Spring"},{"name":"Water","description":"Water"},{"name":"Fisheries Sensitive Feature","description":"Fisheries Sensitive Feature"},{"name":"Marine Sensitive Feature","description":"Marine Sensitive Feature"},{"name":"Described in Comments","description":"Pellet Group"}] } } ] },
{ "name" :"FEature Type Count",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Sign Type",
"description" :"",
"validations" :[{"column_code_validator":{"name":{"type":"string"},"description":{"type":"string"},"allowed_code_values":[{"name":"Antler","description":"Antler"},{"name":"Bed","description":"Bed"},{"name":"Body Parts","description":"Body Parts"},{"name":"Trail","description":"Trail"},{"name":"Tracks","description":"Tracks"},{"name":"Carcass","description":"Carcass"},{"name":"Scratchings","description":"Scratchings"},{"name":"Hair","description":"Hair"},{"name":"Excrement","description":"Excrement"},{"name":"Cache","description":"Cache"},{"name":"Egg Shell","description":"Egg Shell"},{"name":"Feeding","description":"Feeding"},{"name":"Feather","description":"Feather"},{"name":"Pellet Group","description":"Pellet Group"},{"name":"Regurgitated Pellet","description":"Regurgitated Pellet"},{"name":"Shed Skin","description":"Shed Skin"},{"name":"Whitewash","description":"Whitewash"},{"name":"Described in Comments","description":"Pellet Group"}] } } ] },
{ "name" :"Sign Count",
"description" :"",
"validations" :[{"column_numeric_validator":{"name":"","description":""}}] },
{ "name" :"Photos",
"description" :"",
"validations" :[] },
{ "name" :"Incidental Observation Comments",
"description" :"",
"validations" :[] } ] } ],
"validations" :[{"submission_required_files_validator":{"required_files":["Effort & Site Conditions","Observations","Marked Animals","Incidental Observations"] } } ],
"workbookValidations" :[{"workbook_parent_child_key_match_validator":{"child_worksheet_name":"Marked Animals","parent_worksheet_name":"Observations","column_names":["Group Label"] } } ] } $ _validation_config $;

_transformation_config varchar := $ _transformation_config $ { "templateMeta": [
    {
      "sheetName": "Observations",
      "primaryKey": [
        "Study Area",
        "Block ID/SU ID"
      ],
"parentKey": [],
"type": "root",
"foreignKeys": [
        {
          "sheetName": "Marked Animals",
          "primaryKey": [
            "Group Label"
          ] } ] },
{ "sheetName": "Marked Animals",
"primaryKey": [
        "Wildlife Health ID",
        "Animal ID",
        "Telemetry Device ID"
      ],
"parentKey": [
        "Group Label"
      ],
"type": "",
"foreignKeys": [] } ],
"map": [
    {
      "sheetName": "record",
      "fields": [
        {
          "columnName": "eventID",
          "columnValue": [
            {
              "paths": [
                "$..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " basisOfRecord ",
          " columnValue ": [
            {
              " static ": " HumanObservation "
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " event ",
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " eventDate ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Date'] "
              ]
            }
          ]
        },
        {
          " columnName ": " eventRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " location ",
      " condition ": {
        " type ": "
and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['_key'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " verbatimCoordinates ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['UTM Zone,Easting,Northing'] "
              ],
              "
join ": " "
            },
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Lat (DD),Long (DD)'] "
              ],
              "
join ": " "
            }
          ]
        },
        {
          " columnName ": " decimalLatitude ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Lat (DD)'] "
              ]
            }
          ]
        },
        {
          " columnName ": " decimalLongitude ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Long (DD)'] "
              ]
            }
          ]
        },
        {
          " columnName ": " verbatimSRS ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Datum'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['BC RISC Class I Rams'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 0 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['BC RISC Class I Rams'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " male "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " 2 year old (Peace - Liard) "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ],
      "
add
  ": [
        {
          " sheetName ": " measurementOrFact ",
          " fields ": [
            {
              " columnName ": " eventID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ]
                }
              ]
            },
            {
              " columnName ": " measurementID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ],
                  " postfix ": {
                    " static ": " horn - configuration "
                  }
                }
              ]
            },
            {
              " columnName ": " occurrenceID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ],
                  " postfix ": {
                    " static ": " 0 "
                  }
                }
              ]
            },
            {
              " columnName ": " measurementType ",
              " columnValue ": [
                {
                  " static ": " Horn Configuration "
                }
              ]
            },
            {
              " columnName ": " measurementUnit ",
              " columnValue ": [
                {
                  " static ": ""
                }
              ]
            },
            {
              " columnName ": " measurementValue ",
              " columnValue ": [
                {
                  " static ": " BC RISC Class I "
                }
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['BC RISC Class II Rams'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 1 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['BC RISC Class II Rams'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " male "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " 3 year old (Peace - Liard) "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ],
      "
add
  ": [
        {
          " sheetName ": " measurementOrFact ",
          " fields ": [
            {
              " columnName ": " eventID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ]
                }
              ]
            },
            {
              " columnName ": " measurementID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ],
                  " postfix ": {
                    " static ": " horn - configuration "
                  }
                }
              ]
            },
            {
              " columnName ": " occurrenceID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ],
                  " postfix ": {
                    " static ": " 1 "
                  }
                }
              ]
            },
            {
              " columnName ": " measurementType ",
              " columnValue ": [
                {
                  " static ": " Horn Configuration "
                }
              ]
            },
            {
              " columnName ": " measurementUnit ",
              " columnValue ": [
                {
                  " static ": ""
                }
              ]
            },
            {
              " columnName ": " measurementValue ",
              " columnValue ": [
                {
                  " static ": " BC RISC Class II "
                }
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['BC RISC Class III Rams'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 2 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['BC RISC Class III Rams'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " male "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " = > 4 years old (Peace - Liard) "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ],
      "
add
  ": [
        {
          " sheetName ": " measurementOrFact ",
          " fields ": [
            {
              " columnName ": " eventID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ]
                }
              ]
            },
            {
              " columnName ": " measurementID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ],
                  " postfix ": {
                    " static ": " horn - configuration "
                  }
                }
              ]
            },
            {
              " columnName ": " occurrenceID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ],
                  " postfix ": {
                    " static ": " 2 "
                  }
                }
              ]
            },
            {
              " columnName ": " measurementType ",
              " columnValue ": [
                {
                  " static ": " Horn Configuration "
                }
              ]
            },
            {
              " columnName ": " measurementUnit ",
              " columnValue ": [
                {
                  " static ": ""
                }
              ]
            },
            {
              " columnName ": " measurementValue ",
              " columnValue ": [
                {
                  " static ": " BC RISC Class III "
                }
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['BC RISC Class IV Rams'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 3 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['BC RISC Class IV Rams'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " male "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " adult "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ],
      "
add
  ": [
        {
          " sheetName ": " measurementOrFact ",
          " fields ": [
            {
              " columnName ": " eventID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ]
                }
              ]
            },
            {
              " columnName ": " measurementID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ],
                  " postfix ": {
                    " static ": " horn - configuration "
                  }
                }
              ]
            },
            {
              " columnName ": " occurrenceID ",
              " columnValue ": [
                {
                  " paths ": [
                    " $..[?(@._name === 'Observations')]..['_key'] ",
                    " $..[?(@._name === 'Observations')]..['_row'] "
                  ],
                  " postfix ": {
                    " static ": " 3 "
                  }
                }
              ]
            },
            {
              " columnName ": " measurementType ",
              " columnValue ": [
                {
                  " static ": " Horn Configuration "
                }
              ]
            },
            {
              " columnName ": " measurementUnit ",
              " columnValue ": [
                {
                  " static ": ""
                }
              ]
            },
            {
              " columnName ": " measurementValue ",
              " columnValue ": [
                {
                  " static ": " BC RISC Class IV "
                }
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Ram - Unclassified'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 4 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Ram - Unclassified'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " male "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " unknown "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Ewes'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 5 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Ewes'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " female "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " adult "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Yearlings'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 6 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Yearlings'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " unknown "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " juvenile "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Lambs'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 7 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Lambs'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " unknown "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " juvenile "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Ewe-Like Sheep'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 8 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Ewe-Like Sheep'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " unknown "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " ewe - like "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Adults Unclassified Sex'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 9 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Adults Unclassified Sex'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " unknown "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " adult "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " occurrence ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Unclassified Age/Sex'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " 10 "
              }
            }
          ]
        },
        {
          " columnName ": " individualCount ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Unclassified Age/Sex'] "
              ]
            }
          ]
        },
        {
          " columnName ": " sex ",
          " columnValue ": [
            {
              " static ": " unknown "
            }
          ]
        },
        {
          " columnName ": " lifeStage ",
          " columnValue ": [
            {
              " static ": " unknown "
            }
          ]
        },
        {
          " columnName ": " taxonID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Species'] "
              ]
            }
          ]
        },
        {
          " columnName ": " occurrenceRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Observation Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " organism ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Wildlife Health ID,Animal ID,Telemetry Device ID'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismRemarks ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Marked Animals Comments'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " study - area "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Study Area "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Study Area'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " block - id / su - id "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Block ID / SU ID "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Block ID/SU ID'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Group Label'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " group - label "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Group Label "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Group Label'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  or ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Sign Type'] "
          },
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Sign Count'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " sign - type "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Sign Type "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Sign Type'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  or ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Sign Count'] "
          },
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Sign Type'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " sign - count "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Sign Count "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Sign Count'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Age of Sign'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " age - of - sign "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Age of Sign "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Age of Sign'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Veg Cover (%)'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " veg - cover "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Veg Cover "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": " % "
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Veg Cover (%)'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Snow Cover (%)'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " snow - cover "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Snow Cover "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": " % "
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Snow Cover (%)'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Activity'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " activity "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Activity "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Activity'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Elevation (m) of Observation'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " elevation - observation "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Elevation (m) of Observation "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Elevation (m) of Observation'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Habitat'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " habitat "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Habitat "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Habitat'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Habitat-Slope'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " habitat - slope "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Habitat - Slope "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Habitat-Slope'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Terrain Obstruction'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " terrain - obstruction "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Terrain Obstruction "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Terrain Obstruction'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Number of Marked Animals Observed'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " number - of - marked - animals - observed "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Number of Marked Animals Observed "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Number of Marked Animals Observed'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Survey or Telemetry Search'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " survey -
  or - telemetry - search "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Survey
  or Telemetry Search "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Survey or Telemetry Search'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Observations')]..['Photos'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ],
              " postfix ": {
                " static ": " photos "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Photos "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['Photos'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Wildlife Health ID'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ],
              " postfix ": {
                " static ": " wildlife - health - id "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Wildlife Health ID "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Wildlife Health ID'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Animal ID'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ],
              " postfix ": {
                " static ": " animal - id "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Animal ID "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Animal ID'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Telemetry Device ID'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ],
              " postfix ": {
                " static ": " telemetry - device - id "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Telemetry Device ID "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Telemetry Device ID'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Collar/Tag Frequency'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ],
              " postfix ": {
                " static ": " collar / tag - frequency "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Collar / Tag Frequency "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Frequency Unit'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Collar/Tag Frequency'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Right Ear Tag ID'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ],
              " postfix ": {
                " static ": " right - ear - tag - id "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Right Ear Tag ID "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Right Ear Tag ID'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Right Ear Tag Colour'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ],
              " postfix ": {
                " static ": " right - ear - tag - colour "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Right Ear Tag Colour "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Right Ear Tag Colour'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Left Ear Tag ID'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ],
              " postfix ": {
                " static ": " left - ear - tag - id "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Left Ear Tag ID "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Left Ear Tag ID'] "
              ]
            }
          ]
        }
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " condition ": {
        " type ": "
  and ",
        " checks ": [
          {
            " ifNotEmpty ": " $..[?(@._name === 'Marked Animals')]..['Left Ear Tag Colour'] "
          }
        ]
      },
      " fields ": [
        {
          " columnName ": " eventID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Observations')]..['_key'] ",
                " $..[?(@._name === 'Observations')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " organismID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ]
            }
          ]
        },
        {
          " columnName ": " measurementID ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['_key'] ",
                " $..[?(@._name === 'Marked Animals')]..['_row'] "
              ],
              " postfix ": {
                " static ": " left - ear - tag - colour "
              }
            }
          ]
        },
        {
          " columnName ": " measurementType ",
          " columnValue ": [
            {
              " static ": " Left Ear Tag Colour "
            }
          ]
        },
        {
          " columnName ": " measurementUnit ",
          " columnValue ": [
            {
              " static ": ""
            }
          ]
        },
        {
          " columnName ": " measurementValue ",
          " columnValue ": [
            {
              " paths ": [
                " $..[?(@._name === 'Marked Animals')]..['Left Ear Tag Colour'] "
              ]
            }
          ]
        }
      ]
    }
  ],
  " dwcMeta ": [
    {
      " sheetName ": " record ",
      " primaryKey ": [
        " eventID "
      ]
    },
    {
      " sheetName ": " event ",
      " primaryKey ": [
        " eventID "
      ]
    },
    {
      " sheetName ": " location ",
      " primaryKey ": [
        " eventID "
      ]
    },
    {
      " sheetName ": " occurrence ",
      " primaryKey ": [
        " occurrenceID "
      ]
    },
    {
      " sheetName ": " organism ",
      " primaryKey ": [
        " organismID "
      ]
    },
    {
      " sheetName ": " measurementOrFact ",
      " primaryKey ": [
        " eventID ",
        " measurementID ",
        " occurrenceID ",
        " organismID "
      ]
    }
  ]
}$_transformation_config$;
begin
  with
    new_template_record as (
    -- insert a new template record
    insert into
        template (name, version, record_effective_date, description)
      values
        (_template_name, _template_version, now(), _template_description)
      returning template_id
  )
  -- insert new template methodology species record(s)
  insert into
      template_methodology_species (field_method_id, wldtaxonomic_units_id, template_id, validation, transform)
    values
      (
        (select field_method_id from field_method where name = _field_method_name and record_end_date is null),
        23919,
        (select template_id from new_template_record),
        _validation_config::json,
        _transformation_config::json
      ),
     (
        (select field_method_id from field_method where name = _field_method_name and record_end_date is null),
        23921,
        (select template_id from new_template_record),
        _validation_config::json,
        _transformation_config::json
      ),
     (
        (select field_method_id from field_method where name = _field_method_name and record_end_date is null),
        23922,
        (select template_id from new_template_record),
        _validation_config::json,
        _transformation_config::json
      ),
     (
        (select field_method_id from field_method where name = _field_method_name and record_end_date is null),
        25929,
        (select template_id from new_template_record),
        _validation_config::json,
        _transformation_config::json
      ),
     (
        (select field_method_id from field_method where name = _field_method_name and record_end_date is null),
        23920,
        (select template_id from new_template_record),
        _validation_config::json,
        _transformation_config::json
      ),
     (
        (select field_method_id from field_method where name = _field_method_name and record_end_date is null),
        2064,
        (select template_id from new_template_record),
        _validation_config::json,
        _transformation_config::json
      );

end
$$;
