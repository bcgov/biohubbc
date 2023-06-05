import { Route, RouteProps } from 'react-router-dom';

export type IRouteWithTitleProps = RouteProps & {
  /**
   * The title for the browser window/tab.
   *
   * @type {string}
   */
  title: string;
};

/**
 * HOC for react-router Routes that sets the document title.
 *
 * @param {*}
 * @return {*}
 */
const RouteWithTitle = (props: IRouteWithTitleProps) => {
  const { title, children, ...rest } = props;

  if (title) {
    document.title = title;
  }

  return <Route {...rest}>{children}</Route>;
};

export default RouteWithTitle;
