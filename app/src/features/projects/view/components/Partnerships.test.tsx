import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Partnerships from './Partnerships';

describe('Partnerships', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse,
          partnerships: { indigenous_partnerships: [], stakeholder_partnerships: [] }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with invalid null values', () => {
    const { asFragment } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse,
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
    const { asFragment } = render(<Partnerships projectForViewData={{ ...getProjectForViewResponse }} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
