import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPermits from './ProjectPermits';

describe('ProjectPermits', () => {
  it('renders correctly with sampling conducted true', () => {
    const { asFragment } = render(<ProjectPermits projectForViewData={getProjectForViewResponse} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with sampling conducted false', () => {
    const { asFragment } = render(
      <ProjectPermits
        projectForViewData={{
          ...getProjectForViewResponse,
          permit: {
            ...getProjectForViewResponse.permit,
            permits: [{ permit_number: '123', sampling_conducted: false }]
          }
        }}
        codes={codes}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
