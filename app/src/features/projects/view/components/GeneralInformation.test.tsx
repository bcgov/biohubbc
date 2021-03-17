import { render } from '@testing-library/react';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import { IGetAllCodesResponse } from 'interfaces/useBioHubApi-interfaces';
import React from 'react';
import GeneralInformation from './GeneralInformation';

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
