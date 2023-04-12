import React, { PropsWithChildren } from 'react';
import { Route, RouteProps } from 'react-router-dom';

export type IAppRouteProps = RouteProps & {
  /**
   * The title for the browser window/tab.
   *
   * @type {string}
   */
  title?: string;
  /**
   * If specified, the `children` will be rendered as a child of the `layout`.
   *
   * @type {React.ComponentType<any>}
   */
  layout?: React.ComponentType<any>;
};

/**
 * HOC for react-router Routes that provides a Layout wrapper and sets the document title.
 *
 * @param {*}
 * @return {*}
 */
const AppRoute: React.FC<IAppRouteProps> = ({ component: Component, children, layout, title, ...rest }) => {
  const Layout = layout === undefined ? (props: PropsWithChildren<any>) => <>{props.children}</> : layout;

  if (title) {
    document.title = title;
  }

  if (React.Children.count(children) > 0 && Component) {
    throw new Error(
      '<AppRoute> component cannot have both a `component` prop and child components at the same time. You can either remove the `component` prop and only use child components, or you can remove the child components and only use the `component` prop.'
    );
  }

  return (
    <Route
      {...rest}
      render={(routeProps) => (
        <Layout>
          {Component ? (
            <Component {...routeProps} />
          ) : (
            React.Children.map(children, (child: any) => {
              return React.cloneElement(child, routeProps);
            })
          )}
        </Layout>
      )}
    />
  );
};

export default AppRoute;
