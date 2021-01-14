import { ITemplate } from 'interfaces/useBioHubApi-interfaces';

// Relations of the database tables (via foreign keys)
// project
//   project_climate_initiative
//   project_funding_agency
//     funding_agency
//     land_based_investment_strategy
//   project_management_actions
//     management_action_type
//   project_participation
//     system_user
//     project_role
//   project_region
//   proponent

const projectTemplate: ITemplate = {
  id: 0,
  name: 'Project Template',
  description: 'Project Template',
  tags: ['project'],
  data_template: {
    type: 'object',
    required: ['name', 'objectives'],
    properties: {
      id: {
        type: 'number',
        title: 'Project ID'
      },
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
        required: ['start_date', 'end_date'],
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
      _location: {
        title: 'Location',
        type: 'object',
        properties: {
          location_description: {
            type: 'string',
            title: 'Location Description',
            maxLength: 2000
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
      management_recovery_action: {
        type: 'number',
        title: 'Management Recovery Action',
        'x-enum-code': {
          'x-enum-code-table': 'management_action_type',
          'x-enum-code-id-column': 'id',
          'x-enum-code-text-column': 'name'
        }
      },
      results: {
        type: 'string',
        title: 'Results',
        maxLength: 2000
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
    _scientific_collection_permit: {
      _isRequired: {
        'ui:widget': 'radio'
      },
      scientific_collection_permit_number: {}
    },
    management_recovery_action: {},
    _location: {
      location_description: {
        'ui:widget': 'textarea'
      }
    },
    _project_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      start_date: {
        'ui:widget': 'date'
      },
      end_date: {
        'ui:widget': 'date'
      }
    },
    results: {
      'ui:widget': 'textarea'
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
    required: ['funding_agency_project_id', 'funding_amount'],
    properties: {
      id: {
        type: 'number',
        title: 'Project Funding Agency ID'
      },
      funding_agency_project_id: {
        type: 'string',
        title: 'Funding Agency Project ID'
      },
      funding_amount: {
        type: 'number',
        title: 'Funding Amount'
      },
      _project_funding_dates: {
        title: 'Funding Dates',
        type: 'object',
        required: ['funding_start_date', 'funding_end_date'],
        properties: {
          funding_start_date: {
            type: 'string',
            title: 'Start Date'
          },
          funding_end_date: {
            type: 'string',
            title: 'End Date'
          }
        }
      }
    }
  },
  ui_template: {
    id: {},
    funding_agency_project_id: {},
    funding_amount: {},
    _project_funding_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      funding_start_date: {
        'ui:widget': 'date'
      },
      funding_end_date: {
        'ui:widget': 'date'
      }
    }
  }
};

const fundingAgencyTemplate: ITemplate = {
  id: 2,
  name: 'Project Agency Template',
  description: 'Project Agency Template',
  tags: ['project'],
  data_template: {
    title: 'Agency',
    type: 'object',
    required: ['name'],
    properties: {
      id: {
        type: 'number',
        title: 'Agency ID'
      },
      name: {
        type: 'string',
        title: 'Name'
      },
      _funding_agency_dates: {
        title: 'Agency Dates',
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
    id: {},
    name: {},
    _funding_agency_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      record_effective_date: {
        'ui:widget': 'date'
      },
      record_end_date: {
        'ui:widget': 'date'
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
      id: {
        type: 'number',
        title: 'Land Based Investment Strategy ID'
      },
      name: {
        type: 'string',
        title: 'Name'
      }
    }
  },
  ui_template: {
    id: {},
    name: {}
  }
};

const projectManagementActionsTemplate: ITemplate = {
  id: 0,
  name: 'Project Management Actions Template',
  description: 'Project Management Actions Template',
  tags: ['project'],
  data_template: {
    title: 'Managemetn Actions',
    type: 'object',
    properties: {
      id: {
        type: 'number',
        title: 'Management Actions ID'
      }
    }
  },
  ui_template: {
    id: {}
  }
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
      id: {
        type: 'number',
        title: 'Managemetn Action Type ID'
      },
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
    id: {},
    name: {},
    description: {
      'ui:widget': 'textarea'
    },
    _management_action_type_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      funding_start_date: {
        'ui:widget': 'date'
      },
      funding_end_date: {
        'ui:widget': 'date'
      }
    }
  }
};

const projectRegion: ITemplate = {
  id: 0,
  name: 'Project Region Template',
  description: 'Project Region Template',
  tags: ['project'],
  data_template: {
    title: 'Region',
    type: 'object',
    required: ['name', 'common_code'],
    properties: {
      id: {
        type: 'number',
        title: 'Region ID'
      },
      common_code: {
        type: 'string',
        title: 'Common Code'
      }
    }
  },
  ui_template: {
    id: {},
    common_code: {}
  }
};

const projectProponentTemplate: ITemplate = {
  id: 3,
  name: 'Project Proponent Template',
  description: 'Project Proponent Template',
  tags: ['project'],
  data_template: {
    type: 'object',
    required: ['name'],
    properties: {
      id: {
        type: 'number',
        title: 'Proponent ID'
      },
      name: {
        type: 'string',
        title: 'Name'
      },
      _proponent_dates: {
        title: 'Proponent Dates',
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
    id: {},
    name: {},
    _proponent_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      record_effective_date: {
        'ui:widget': 'date'
      },
      record_end_date: {
        'ui:widget': 'date'
      }
    }
  }
};

export {
  projectTemplate,
  projectFundingAgencyTemplate,
  fundingAgencyTemplate,
  projectLandBasedInvestmentStrategyTemplate,
  projectManagementActionsTemplate,
  projectManagementActionTypeTemplate,
  projectRegion,
  projectProponentTemplate
};
