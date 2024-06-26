import { PropsWithChildren } from 'react';

export interface ILoadingGuardProps {
  isLoading: boolean;
  fallback: JSX.Element;
}

/**
 * Renders `props.children` if `isLoading` is false, otherwise renders `fallback`.
 *
 * Fallback should be a loading spinner or skeleton component, etc.
 *
 * @param {*} props
 * @return {*}
 */
export const LoadingGuard = (props: PropsWithChildren<ILoadingGuardProps>) => {
  const { isLoading, fallback, children } = props;

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
