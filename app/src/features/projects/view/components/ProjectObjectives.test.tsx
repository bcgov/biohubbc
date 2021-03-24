import { render, fireEvent, getAllByText, waitFor } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import ProjectObjectives from './ProjectObjectives';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

const history = createMemoryHistory();

const renderContainer = () => {
  return render(
    <Router history={history}>
      <ProjectObjectives projectForViewData={getProjectForViewResponse} />
    </Router>
  );
};

describe('ProjectObjectives', () => {
  const longData =
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean' +
    ' commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient ' +
    'montes, nascetur ridiculus mus.\n Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.\n' +
    ' Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget,' +
    ' arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.\n\n' +
    'Nullam dictum felis eu pede mollis pretium. Integer tincidunt. \n Cras dapibus. Vivamus elementum\n' +
    ' semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.\n\n ' +
    'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius\n\n ' +
    'laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies\n ' +
    'nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper liber\n\n,' +
    'sit amet adipiscing sem neque sed ipsum. N\n\n';

  it('renders correctly when objectives length is <= 850 characters', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives length is > 850 characters and caveats is empty', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectObjectives
          projectForViewData={{
            ...getProjectForViewResponse,
            objectives: { ...getProjectForViewResponse.objectives, objectives: longData, caveats: '' }
          }}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when both objectives and caveats have length is > 850 characters and are in multiple paragraphs', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectObjectives
          projectForViewData={{
            ...getProjectForViewResponse,
            objectives: { ...getProjectForViewResponse.objectives, objectives: longData, caveats: longData }
          }}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives and caveats are < 850 characters and in multiple paragraphs', () => {
    const multilineObjectives = 'Paragraph1\nParagraph2\n\nParagraph3';
    const multilineCaveats = 'Paragraph1\nParagraph2\n\nParagraph3';

    const { asFragment } = render(
      <Router history={history}>
        <ProjectObjectives
          projectForViewData={{
            ...getProjectForViewResponse,
            objectives: {
              ...getProjectForViewResponse.objectives,
              objectives: multilineObjectives,
              caveats: multilineCaveats
            }
          }}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('functions as expected with the read more and read less buttons', () => {
    const { container } = render(
      <Router history={history}>
        <ProjectObjectives
          projectForViewData={{
            ...getProjectForViewResponse,
            objectives: { ...getProjectForViewResponse.objectives, objectives: longData, caveats: longData }
          }}
        />
      </Router>
    );

    // for finding 'project objectives'
    //@ts-ignore
    expect(getAllByText(container, 'Read More')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read More')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read Less')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read Less')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read More')[0]).toBeInTheDocument();

    // for finding 'project caveats'
    //@ts-ignore
    expect(getAllByText(container, 'Read More')[1]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read More')[1]);

    //@ts-ignore
    expect(getAllByText(container, 'Read Less')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read Less')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read More')[1]).toBeInTheDocument();
  });

  it('editing the project objectives works in the dialog', async () => {
    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Project Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(getByText('Edit Project Objectives')).not.toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Project Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects/${getProjectForViewResponse.id}/details`);
    });
  });
});
