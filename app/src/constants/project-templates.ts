import { ITemplate } from 'interfaces/useBioHubApi-interfaces';

const projectTemplate: ITemplate = {
  id: '0',
  name: 'Project Template',
  description: 'Project Template',
  tags: ['project'],
  data_template: {
    title: 'Project Details',
    type: 'object',
    required: ['name', 'objectives', 'scientific_collection_permit_number', 'start_date'],
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
      project_dates: {
        title: 'Project Dates',
        type: 'object',
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
      location: {
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
      scientific_collection_permit_number: {
        type: 'string',
        title: 'Scientific Collection Permit Number',
        maxLength: 50
      },
      management_recovery_action: {
        type: 'string',
        title: 'Management Recovery Action',
        maxLength: 1
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
    objectives: {},
    scientific_collection_permit_number: {},
    management_recovery_action: {},
    location: {
      location_description: {
        'ui:widget': 'textarea'
      }
    },
    project_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      start_date: {
        'ui:widget': 'datetime'
      },
      end_date: {
        'ui:widget': 'datetime'
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
  id: '0',
  name: 'Project Funding Agency Template',
  description: 'Project Funding Agency Template',
  tags: ['project'],
  data_template: {
    title: 'Funding Agency',
    type: 'object',
    required: ['name', 'objectives', 'scientific_collection_permit_number', 'start_date'],
    properties: {
      id: {
        type: 'number',
        title: 'Project Funding Agency ID'
      },
      funding_agency_project_id: {
        type: 'string',
        title: 'Name'
      },
      funding_amount: {
        type: 'number',
        title: 'Objectives'
      },
      project_funding_dates: {
        title: 'Funding Dates',
        type: 'object',
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
    project_funding_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      funding_start_date: {
        'ui:widget': 'datetime'
      },
      funding_end_date: {
        'ui:widget': 'datetime'
      }
    }
  }
};

const projectAgencyTemplate: ITemplate = {
  id: '0',
  name: 'Project Agency Template',
  description: 'Project Agency Template',
  tags: ['project'],
  data_template: {
    title: 'Agency',
    type: 'object',
    required: ['name', 'objectives', 'scientific_collection_permit_number', 'start_date'],
    properties: {
      id: {
        type: 'number',
        title: 'Agency ID'
      },
      name: {
        type: 'string',
        title: 'Name'
      },
      project_agency_dates: {
        title: 'Agency Dates',
        type: 'object',
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
    name: {},
    project_agency_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      funding_start_date: {
        'ui:widget': 'datetime'
      },
      funding_end_date: {
        'ui:widget': 'datetime'
      }
    }
  }
};

const projectLandBasedInvestmentStrategyTemplate: ITemplate = {
  id: '0',
  name: 'Project Land Based Investment Strategy Template',
  description: 'Project Land Based Investment Strategy Template',
  tags: ['project'],
  data_template: {
    title: 'Land Based Investment Stragegy',
    type: 'object',
    required: ['name', 'objectives', 'scientific_collection_permit_number', 'start_date'],
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
  id: '0',
  name: 'Project Management Actions Template',
  description: 'Project Management Actions Template',
  tags: ['project'],
  data_template: {
    title: 'Managemetn Actions',
    type: 'object',
    required: ['name', 'objectives', 'scientific_collection_permit_number', 'start_date'],
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
  id: '0',
  name: 'Management Action Type Template',
  description: 'Management Action Type Template',
  tags: ['project'],
  data_template: {
    title: 'Management Action Type',
    type: 'object',
    required: ['name', 'objectives', 'scientific_collection_permit_number', 'start_date'],
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
      management_action_type_dates: {
        title: 'Management Action Type Dates',
        type: 'object',
        properties: {
          record_end_date: {
            type: 'string',
            title: 'Start Date'
          },
          record_effective_date: {
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
    management_action_type_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      funding_start_date: {
        'ui:widget': 'datetime'
      },
      funding_end_date: {
        'ui:widget': 'datetime'
      }
    }
  }
};

const projectRegion: ITemplate = {
  id: '0',
  name: 'Project Region Template',
  description: 'Project Region Template',
  tags: ['project'],
  data_template: {
    title: 'Region',
    type: 'object',
    required: ['name', 'objectives', 'scientific_collection_permit_number', 'start_date'],
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
  id: '0',
  name: 'Project Proponent Template',
  description: 'Project Proponent Template',
  tags: ['project'],
  data_template: {
    title: 'Proponent',
    type: 'object',
    required: ['name', 'objectives', 'scientific_collection_permit_number', 'start_date'],
    properties: {
      id: {
        type: 'number',
        title: 'Proponent ID'
      },
      name: {
        type: 'string',
        title: 'Name'
      },
      proponent_dates: {
        title: 'Proponent Dates',
        type: 'object',
        properties: {
          record_end_date: {
            type: 'string',
            title: 'Start Date'
          },
          record_effective_date: {
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
    proponent_dates: {
      'ui:column-xs': 12,
      'ui:column-sm': 6,
      record_end_date: {
        'ui:widget': 'datetime'
      },
      record_effective_date: {
        'ui:widget': 'datetime'
      }
    }
  }
};

export {
  projectTemplate,
  projectFundingAgencyTemplate,
  projectAgencyTemplate,
  projectLandBasedInvestmentStrategyTemplate,
  projectManagementActionsTemplate,
  projectManagementActionTypeTemplate,
  projectRegion,
  projectProponentTemplate
};
