import { render } from 'test-helpers/test-utils';
import { createMemoryHistory } from 'history';
import StandardLayout from './StandardLayout';
import { Router } from 'react-router';

const history = createMemoryHistory();

describe('StandardLayout', () => {
  it('renders the child correctly', () => {
    const { getByText } = render(
      <Router history={history}>
        <StandardLayout>
          <p>This is the project layout test child component</p>
        </StandardLayout>
      </Router>
    );

    expect(getByText('This is the project layout test child component')).toBeVisible();
  });
});
