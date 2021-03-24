import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Partnerships from './Partnerships';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';

const history = createMemoryHistory();

describe('Partnerships', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Partnerships
          projectForViewData={{
            ...getProjectForViewResponse,
            partnerships: {
              indigenous_partnership_strings: [],
              indigenous_partnerships: [],
              stakeholder_partnerships: []
            }
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
        <Partnerships
          projectForViewData={{
            ...getProjectForViewResponse,
            partnerships: {
              indigenous_partnerships: (null as unknown) as number[],
              indigenous_partnership_strings: (null as unknown) as string[],
              stakeholder_partnerships: (null as unknown) as string[]
            }
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
        <Partnerships projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the partnerships works in the dialog', async () => {
    const { getByText } = render(
      <Router history={history}>
        <Partnerships projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).not.toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects/${getProjectForViewResponse.id}/details`);
    });
  });
});
