import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import RouteWithTitle from './RouteWithTitle';

const history = createMemoryHistory();

describe('RouteWithTitle component', () => {
  it('should render a route that can be navigated to', () => {
    render(
      <Router history={history}>
        <RouteWithTitle title={'Test-Title'} path="/" component={() => <div>Test</div>}></RouteWithTitle>
      </Router>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render a route without a Layout prop', () => {
    render(
      <Router history={history}>
        <RouteWithTitle path="/" component={() => <div>Test</div>} title={'Test-Title'} />
      </Router>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render a route with a Layout prop', () => {
    render(
      <Router history={history}>
        <RouteWithTitle title={'Test-Title'} path="/" component={() => <div>Test</div>} />
      </Router>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('test-layout')).toBeInTheDocument();
  });

  it('should render an array of children', () => {
    render(
      <Router history={history}>
        <RouteWithTitle path="/" title={'Test-Title'}>
          <div>Test1</div>
          <div>Test2</div>
        </RouteWithTitle>
      </Router>
    );

    expect(screen.getByText('Test1')).toBeInTheDocument();
    expect(screen.getByText('Test2')).toBeInTheDocument();
  });

  it('should throw an error if both a component and children are provided', () => {
    const renderRoute = () =>
      render(
        <Router history={history}>
          <RouteWithTitle path="/" title={'Test-Title'} component={() => <div>Test3</div>}>
            <div>Test1</div>
            <div>Test2</div>
          </RouteWithTitle>
        </Router>
      );

    expect(renderRoute).toThrow();
  });

  it('should update the document title if a title prop is provided', () => {
    render(
      <Router history={history}>
        <RouteWithTitle path="/" component={() => <div>Test</div>} title="Test Title" />
      </Router>
    );

    expect(document.title).toBe('Test Title');
  });
});
