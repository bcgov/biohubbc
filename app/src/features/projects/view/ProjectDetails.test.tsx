import { render } from '@testing-library/react';
import { IGetAllCodesResponse } from 'interfaces/useBioHubApi-interfaces';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import React from 'react';
import ProjectDetails from './ProjectDetails';

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

describe('ProjectDetails', () => {
  it('renders correctly', () => {
    projectWithDetailsData.location.geometry.push({
      id: 'myGeo',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [125.6, 10.1]
      },
      properties: {
        name: 'Dinagat Islands'
      }
    });

    const { asFragment } = render(<ProjectDetails projectWithDetailsData={projectWithDetailsData} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
