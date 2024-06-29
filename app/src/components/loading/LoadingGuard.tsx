import { PropsWithChildren, useEffect, useState } from 'react';

export interface ILoadingGuardProps {
  isLoading: boolean;
  fallback: JSX.Element;
  delay?: number;
}

/**
 * Renders `props.children` if `isLoading` is false, otherwise renders `fallback`.
 *
 * If `delay` is provided, the fallback will be shown for at least `delay` milliseconds.
 *
 * Fallback should be a loading spinner or skeleton component, etc.
 *
 * @param {PropsWithChildren<ILoadingGuardProps>} props
 * @return {*}
 */
export const LoadingGuard = (props: PropsWithChildren<ILoadingGuardProps>) => {
  const { isLoading, fallback, delay, children } = props;

  const [showFallback, setShowFallback] = useState(isLoading);

  useEffect(() => {
    if (!isLoading) {
      // If the loading state changes to false, hide the fallback
      if (delay) {
        setTimeout(() => {
          // Show the fallback for at least `delay` milliseconds
          setShowFallback(false);
        }, delay);
      } else {
        setShowFallback(false);
      }
    }
  }, [isLoading, delay]);

  if (showFallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
