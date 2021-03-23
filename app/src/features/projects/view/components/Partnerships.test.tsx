import { render } from '@testing-library/react';
import React from 'react';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import Partnerships from './Partnerships';

describe('Partnerships', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Partnerships
        projectWithDetailsData={{
          ...projectWithDetailsData,
          partnerships: { indigenous_partnerships: [], stakeholder_partnerships: [] }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with invalid null values', () => {
    const { asFragment } = render(
      <Partnerships
        projectWithDetailsData={{
          ...projectWithDetailsData,
          partnerships: {
            indigenous_partnerships: (null as unknown) as string[],
            stakeholder_partnerships: (null as unknown) as string[]
          }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing species values', () => {
    const { asFragment } = render(<Partnerships projectWithDetailsData={{ ...projectWithDetailsData }} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
