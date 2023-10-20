import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { render } from 'test-helpers/test-utils';
import BaseLayout from './BaseLayout';

const history = createMemoryHistory();

describe('BaseLayout', () => {
  it('renders correctly', () => {
    process.env.REACT_APP_NODE_ENV = 'local';

    const { getByText } = render(
      <Router history={history}>
        <BaseLayout>
          <div>
            <p>The base layout content</p>
          </div>
        </BaseLayout>
      </Router>
    );

    expect(
      getByText('This is an unsupported browser. Some functionality may not work as expected.')
    ).toBeInTheDocument();
    expect(getByText('The base layout content')).toBeInTheDocument();
  });
});
