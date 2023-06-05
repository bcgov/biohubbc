import { render } from 'test-helpers/test-utils';
import ProjectsLayout from './ProjectsLayout';

describe('ProjectsLayout', () => {
  it('matches the snapshot', () => {
    const { getByText } = render(
      <ProjectsLayout>
        <p>This is the project layout test child component</p>
      </ProjectsLayout>
    );

    expect(getByText('This is the project layout test child component')).toBeVisible();
  });
});
