import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import GeneralInformation from './GeneralInformation';

const history = createMemoryHistory();

const projectData = {
  id: 1,
  name: 'Test Project Name',
  objectives: 'Et ad et in culpa si',
  scientific_collection_permit_number: '',
  location_description: '',
  start_date: '1998-10-10',
  end_date: '2021-02-26',
  caveats: 'Impedit sint vel au',
  comments: 'Nisi sed omnis fugia',
  coordinator_first_name: 'Madonna',
  coordinator_last_name: 'Hunt',
  coordinator_email_address: 'robulic@mailinator.com',
  coordinator_agency_name: 'Willa Coleman',
  focal_species_name_list: 'species 1, species 2',
  regions_name_list: 'region 1, region 2, region 3'
};

describe('GeneralInformation', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <GeneralInformation projectData={{ projectData }} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
