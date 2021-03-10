import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import GeneralInformation from './GeneralInformation';

const history = createMemoryHistory();

describe('GeneralInformation', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <GeneralInformation projectData={{}} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
