import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import Header from './Header';

const history = createMemoryHistory();

describe('NotFoundPage', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Router history={history}>
          <Header />
        </Router>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
