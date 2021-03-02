import { ITemplate } from 'interfaces/useBioHubApi-interfaces';

const projectTemplate: ITemplate = {
  id: 0,
  name: 'Project Template',
  description: 'Project Template',
  tags: ['project'],
  data_template: {
    type: 'object',
    required: ['name', 'objectives'],
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        maxLength: 50
      },
      objectives: {
        type: 'string',
        title: 'Objectives',
        maxLength: 2000
      },
      _project_dates: {
        title: 'Project Timeline',
        type: 'object',
        required: ['start_date'],
        properties: {
          start_date: {
            type: 'string',
            title: 'Start Date'
          },
          end_date: {
            type: 'string',
            title: 'End Date'
          }
        }
      },
      _indigenous_collaboration: {
        type: 'object',
        properties: {
          _isRequired: {
            type: 'boolean',
            title: 'Is there indigenous collaboration on this project?',
            enum: [false, true],
            default: false
          }
        },
        dependencies: {
          _isRequired: {
            oneOf: [
              {
                title: 'Indigenous Collaboration',
                properties: {
                  _isRequired: {
                    enum: [false]
                  }
                }
              },
              {
                title: 'Indigenous Collaboration',
                required: ['indigenous_collaboration_nation'],
                properties: {
                  _isRequired: {
                    enum: [true]
                  },
                  indigenous_collaboration_nation: {
                    type: 'array',
                    title: 'Indigenous Nations',
                    items: {
                      type: 'number',
                      'x-enum-code': {
                        table: 'indigenous_nations',
                        id_column: 'id',
                        text_column: 'description'
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      },
      _scientific_collection_permit: {
        type: 'object',
        properties: {
          _isRequired: {
            type: 'boolean',
            title: 'Is a scientific collection permit required for this project?',
            enum: [false, true],
            default: false
          }
        },
        dependencies: {
          _isRequired: {
            oneOf: [
              {
                title: 'Scientific Collection Permit',
                properties: {
                  _isRequired: {
                    enum: [false]
                  }
                }
              },
              {
                title: 'Scientific Collection Permit',
                required: ['scientific_collection_permit_number'],
                properties: {
                  _isRequired: {
                    enum: [true]
                  },
                  scientific_collection_permit_number: {
                    type: 'string',
                    title: 'Scientific Collection Permit Number',
                    maxLength: 50
                  }
                }
              }
            ]
          }
        }
      },
      caveats: {
        type: 'string',
        title: 'Caveats',
        maxLength: 2000
      },
      comments: {
        type: 'string',
        title: 'Comments',
        maxLength: 2000
      }
    }
  },
  ui_template: {
    name: {},
    objectives: {
      'ui:widget': 'textarea'
    },
    _indigenous_collaboration: {
      _isRequired: {
        'ui:widget': 'radio'
      },
      indigenous_collaboration_nation: {
        'ui:widget': 'multi-select-autocomplete'
      }
    },
    _scientific_collection_permit: {
      _isRequired: {
        'ui:widget': 'radio'
      },
      scientific_collection_permit_number: {}
    },
    _location: {
      location_description: {
        'ui:widget': 'textarea'
      }
    },
    _project_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      'x-date-range-validator': {
        start: 'start_date',
        end: 'end_date'
      },
      start_date: {
        'ui:widget': 'date'
      },
      end_date: {
        'ui:widget': 'date'
      }
    },
    caveats: {
      'ui:widget': 'textarea'
    },
    comments: {
      'ui:widget': 'textarea'
    }
  }
};

const projectFundingAgencyTemplate: ITemplate = {
  id: 1,
  name: 'Project Funding Agency Template',
  description: 'Project Funding Agency Template',
  tags: ['project'],
  data_template: {
    type: 'object',
    required: [''],
    properties: {
      funding_sources: {
        type: 'array',
        title: 'Funding Sources',
        items: {
          type: 'object',
          properties: {
            funding_source_name: {
              type: 'string',
              title: 'Funding Source Name'
            },
            funding_source_project_id: {
              type: 'string',
              title: 'Funding Source Project ID'
            },
            funding_amount: {
              type: 'number',
              title: 'Funding Amount',
              multipleOf: 0.01
            },
            _funding_source_dates: {
              type: 'object',
              title: 'Funding Timeline',
              properties: {
                record_effective_date: {
                  type: 'string',
                  title: 'Start Date'
                },
                record_end_date: {
                  type: 'string',
                  title: 'End Date'
                }
              }
            }
          }
        }
      },
      _partnerships: {
        title: 'Partnerships',
        type: 'object',
        properties: {
          first_nations_partners: {
            type: 'array',
            title: 'First Nations Partners',
            items: {
              type: 'number',
              'x-enum-code': {
                table: 'stakeholder_partners',
                id_column: 'id',
                text_column: 'description'
              }
            }
          },
          stakeholder_partnerships: {
            type: 'array',
            title: 'Stakeholder Partners',
            items: {
              type: 'number',
              'x-enum-code': {
                table: 'stakeholder_partners',
                id_column: 'id',
                text_column: 'description'
              }
            }
          }
        }
      }
    }
  },
  ui_template: {
    funding_sources: {
      items: {
        funding_source_name: {},
        funding_source_project_id: {},
        funding_amount: {},
        _funding_source_dates: {
          'ui:column-xs': 12,
          'ui:column-sm': 6,
          'x-date-range-validator': {
            start: 'record_effective_date',
            end: 'record_end_date'
          },
          record_effective_date: {
            'ui:widget': 'date'
          },
          record_end_date: {
            'ui:widget': 'date'
          }
        }
      }
    },
    _partnerships: {
      first_nations_partners: {
        'ui:widget': 'multi-select-autocomplete'
      },
      stakeholder_partnerships: {
        'ui:widget': 'multi-select-autocomplete'
      }
    }
  }
};

const projectLandBasedInvestmentStrategyTemplate: ITemplate = {
  id: 0,
  name: 'Project Land Based Investment Strategy Template',
  description: 'Project Land Based Investment Strategy Template',
  tags: ['project'],
  data_template: {
    title: 'Land Based Investment Stragegy',
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        title: 'Name'
      }
    }
  },
  ui_template: {
    name: {}
  }
};

const projectManagementActionsTemplate: ITemplate = {
  id: 0,
  name: 'Project Management Actions Template',
  description: 'Project Management Actions Template',
  tags: ['project'],
  data_template: {
    title: 'Management Actions',
    type: 'object',
    properties: {}
  },
  ui_template: {}
};

const projectManagementActionTypeTemplate: ITemplate = {
  id: 0,
  name: 'Management Action Type Template',
  description: 'Management Action Type Template',
  tags: ['project'],
  data_template: {
    title: 'Management Action Type',
    type: 'object',
    required: ['name', 'description'],
    properties: {
      name: {
        type: 'string',
        title: 'Name'
      },
      description: {
        type: 'string',
        title: 'Description'
      },
      _management_action_type_dates: {
        title: 'Management Action Type Dates',
        type: 'object',
        required: ['record_effective_date', 'record_end_date'],
        properties: {
          record_effective_date: {
            type: 'string',
            title: 'Start Date'
          },
          record_end_date: {
            type: 'string',
            title: 'End Date'
          }
        }
      }
    }
  },
  ui_template: {
    name: {},
    description: {
      'ui:widget': 'textarea'
    },
    _management_action_type_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      'x-date-range-validator': {
        start: 'record_effective_date',
        end: 'record_end_date'
      },
      record_effective_date: {
        'ui:widget': 'date'
      },
      record_end_date: {
        'ui:widget': 'date'
      }
    }
  }
};

const projectCoordinatorTemplate: ITemplate = {
  id: 3,
  name: 'Project Coordinator Template',
  description: 'Project Coordinator Template',
  tags: ['project'],
  data_template: {
    type: 'object',
    required: ['coordinator_email_address', 'coordinator_agency_name'],
    properties: {
      _coordinator_names: {
        title: 'Coordinator Name',
        type: 'object',
        required: ['coordinator_first_name', 'coordinator_last_name'],
        properties: {
          coordinator_first_name: {
            type: 'string',
            title: 'First Name'
          },
          coordinator_last_name: {
            type: 'string',
            title: 'Last Name'
          }
        }
      },
      coordinator_email_address: {
        type: 'string',
        title: 'Email Address',
        format: 'email'
      },
      coordinator_agency_name: {
        type: 'string',
        title: 'Agency'
      }
    }
  },
  ui_template: {
    _coordinator_names: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      coordinator_first_name: {},
      coordinator_last_name: {}
    },
    coordinator_email_address: {},
    coordinator_agency_name: {}
  }
};

const projectSpeciesTemplate: ITemplate = {
  id: 3,
  name: 'Project Species Template',
  description: 'Project Species Template',
  tags: ['project'],
  data_template: {
    type: 'object',
    properties: {
      focal_species: {
        type: 'array',
        title: 'Focal Species',
        items: {
          type: 'string',
          'x-enum-code': {
            table: 'species',
            id_column: 'name', // TODO should be a unique identifier
            text_column: 'name'
          }
        },
        uniqueItems: true
      },
      ancillary_species: {
        type: 'array',
        title: 'Ancillary Species',
        items: {
          type: 'string',
          'x-enum-code': {
            table: 'species',
            id_column: 'name', // TODO should be a unique identifier
            text_column: 'name'
          }
        },
        uniqueItems: true
      }
    }
  },
  ui_template: {
    focal_species: {
      'ui:widget': 'multi-select-autocomplete'
    },
    ancillary_species: {
      'ui:widget': 'multi-select-autocomplete'
    }
  }
};

const projectLocationTemplate: ITemplate = {
  id: 3,
  name: 'Project Location Template',
  description: 'Project Location Template',
  tags: ['project'],
  data_template: {
    type: 'object',
    properties: {
      regions: {
        type: 'array',
        title: 'Regions',
        items: {
          type: 'string',
          'x-enum-code': {
            table: 'region',
            id_column: 'name', // TODO should be a unique identifier
            text_column: 'name'
          }
        },
        uniqueItems: true
      },
      location: {
        title: '',
        type: 'object',
        properties: {
          location_description: {
            type: 'string',
            title: 'Location Description',
            maxLength: 2000
          }
        }
      }
    }
  },
  ui_template: {
    regions: {
      'ui:widget': 'multi-select-autocomplete'
    },
    location: {
      location_description: {
        'ui:widget': 'textarea'
      }
    }
  }
};

export {
  projectTemplate,
  projectFundingAgencyTemplate,
  projectLandBasedInvestmentStrategyTemplate,
  projectManagementActionsTemplate,
  projectManagementActionTypeTemplate,
  projectCoordinatorTemplate,
  projectLocationTemplate,
  projectSpeciesTemplate
};
