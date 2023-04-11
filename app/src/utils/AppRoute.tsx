import React, { PropsWithChildren } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';
import { Route, RouteProps } from 'react-router-dom';

export interface IAppRouteProps extends RouteProps {
  /**
   * The title for the browser window/tab.
   *
   * @type {string}
   */
  title?: string;
  /**
   * If specified, the `component` will be rendered as a child of the `layout`.
   *
   * @type {React.ComponentType<any>}
   */
  layout?: React.ComponentType<any>;
};

const AppRoute = (props: IAppRouteProps) => {
  const { layout, component, children, title, ...rest } = props;

  const LayoutComponent = layout === undefined
    ? (props: PropsWithChildren<any>) => <>{props.children}</>
    : layout;

  const Component = component || React.Fragment;

  if (title) {
    document.title = title;
  }

  return (
    <Route
      {...rest}
      render={(routerProps: RouteComponentProps<any, StaticContext, unknown>) => (
        <LayoutComponent>
          <Component {...routerProps} />
        </LayoutComponent>
      )}
    />
  );
};

export default AppRoute;
