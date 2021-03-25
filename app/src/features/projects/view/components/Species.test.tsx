import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Species from './Species';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';
const history = createMemoryHistory();

describe('Species', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Species
          projectForViewData={{
            ...getProjectForViewResponse,
            species: { focal_species: [], ancillary_species: [] }
          }}
          codes={codes}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with invalid null values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Species
          projectForViewData={{
            ...getProjectForViewResponse,
            species: { focal_species: (null as unknown) as string[], ancillary_species: (null as unknown) as string[] }
          }}
          codes={codes}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing species values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Species projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
