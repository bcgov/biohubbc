import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import RouteWithTitle from './RouteWithTitle';

const history = createMemoryHistory();

describe('RouteWithTitle component', () => {
  it('should update the document title if a title prop is provided', () => {
    render(
      <Router history={history}>
        <RouteWithTitle path="/" component={() => <div>Test</div>} title="Test Title" />
      </Router>
    );

    expect(document.title).toBe('Test Title');
  });
});
