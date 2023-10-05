import { render } from 'test-helpers/test-utils';
import StandardLayout from './StandardLayout';

describe('ProjectsLayout', () => {
  it('renders the child correctly', () => {
    const { getByText } = render(
      <StandardLayout>
        <p>This is the project layout test child component</p>
      </StandardLayout>
    );

    expect(getByText('This is the project layout test child component')).toBeVisible();
  });
});
