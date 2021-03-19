import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Species from './Species';

describe('Species', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Species
        projectForViewData={{ ...getProjectForViewResponse, species: { focal_species: [], ancillary_species: [] } }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with invalid null values', () => {
    const { asFragment } = render(
      <Species
        projectForViewData={{
          ...getProjectForViewResponse,
          species: { focal_species: (null as unknown) as string[], ancillary_species: (null as unknown) as string[] }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing species values', () => {
    const { asFragment } = render(<Species projectForViewData={{ ...getProjectForViewResponse }} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
