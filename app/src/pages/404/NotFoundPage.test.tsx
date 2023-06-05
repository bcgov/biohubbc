import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { fireEvent, render } from 'test-helpers/test-utils';
import NotFoundPage from './NotFoundPage';

const history = createMemoryHistory();

describe('NotFoundPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <NotFoundPage />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('takes the user home when they click the return home button', () => {
    const { getByText } = render(
      <Router history={history}>
        <NotFoundPage />
      </Router>
    );

    fireEvent.click(getByText('Return Home'));

    expect(history.location.pathname).toEqual('/');
  });
});
