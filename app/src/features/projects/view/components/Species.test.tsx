import { render } from '@testing-library/react';
import React from 'react';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import Species from './Species';

describe('Species', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Species
        projectWithDetailsData={{ ...projectWithDetailsData, species: { focal_species: [], ancillary_species: [] } }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with invalid null values', () => {
    const { asFragment } = render(
      <Species
        projectWithDetailsData={{
          ...projectWithDetailsData,
          species: { focal_species: (null as unknown) as string[], ancillary_species: (null as unknown) as string[] }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing species values', () => {
    const { asFragment } = render(<Species projectWithDetailsData={{ ...projectWithDetailsData }} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
