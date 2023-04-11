import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import AppRoute from './AppRoute';

const history = createMemoryHistory();

describe('AppRoute component', () => {
  it('should render a route that can be navigated to', () => {
    const { getByText } = render(
      <Router history={history}>
        <AppRoute path="/test" component={() => <div>Test</div>}>
        </AppRoute>
      </Router>
    );

    console.log({ getByText: getByText('Test') })

    expect(getByText('Test')).toBeInTheDocument();
  });

  it('should render a route without a Layout prop', () => {
    render(
      <Router history={history}>
        <AppRoute path="/" component={() => <div>Test</div>} />
      </Router>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render a route with a Layout prop', () => {
    const Layout = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

    render(
      <Router history={history}>
        <AppRoute path="/" component={() => <div>Test</div>} layout={Layout} />
      </Router>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('should update the document title if a title prop is provided', () => {
    render(
      <Router history={history}>
        <AppRoute path="/" component={() => <div>Test</div>} title="Test Title" />
      </Router>
    );

    expect(document.title).toBe('Test Title');
  });
});
