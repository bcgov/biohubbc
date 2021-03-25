import { render, waitFor, fireEvent } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import GeneralInformation from './GeneralInformation';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';

const history = createMemoryHistory();

const renderContainer = () => {
  return render(
    <Router history={history}>
      <GeneralInformation projectForViewData={getProjectForViewResponse} codes={codes} />
    </Router>
  );
};

describe('GeneralInformation', () => {
  it('renders correctly', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the general information works in the dialog', async () => {
    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(getByText('Edit General Information')).not.toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects/${getProjectForViewResponse.id}/details`);
    });
  });
});
