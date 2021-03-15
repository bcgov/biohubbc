import { render } from '@testing-library/react';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import { IGetAllCodesResponse } from 'interfaces/useBioHubApi-interfaces';
import React from 'react';
import GeneralInformation from './GeneralInformation';

const projectWithDetailsData: IProjectWithDetails = {
  id: 1,
  project: {
    project_name: 'Test Project Name',
    project_type_name: 'Type name',
    project_type: '1',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    climate_change_initiatives: [1],
    project_activities: [1]
  },
  location: {
    location_description: 'here and there',
    regions: [],
    geometry: []
  },
  objectives: {
    objectives: 'Et ad et in culpa si',
    caveats: 'sjwer bds'
  }
};

const codes: IGetAllCodesResponse = {
  coordinator_agency: [],
  management_action_type: [],
  climate_change_initiative: [{ id: 1, name: 'climate code' }],
  first_nations: [],
  funding_source: [],
  investment_action_category: [],
  activity: [{ id: 1, name: 'activity code' }],
  project_type: [],
  region: [],
  species: [],
  iucn_conservation_action_level_1_classification: [],
  iucn_conservation_action_level_2_subclassification: [],
  iucn_conservation_action_level_3_subclassification: []
};

describe('GeneralInformation', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<GeneralInformation projectWithDetailsData={projectWithDetailsData} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
