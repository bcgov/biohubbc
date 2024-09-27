import { PropsWithChildren, useEffect, useState } from 'react';

export type ILoadingGuardProps = {
  /**
   * Whether the component is in a loading state.
   *
   * @type {boolean}
   */
  isLoading?: boolean;
  /**
   * The loading fallback component to render when `isLoading` is true.
   *
   * @type {JSX.Element}
   */
  isLoadingFallback?: JSX.Element;
  /**
   * The minimum time in milliseconds to show the loading fallback component.
   *
   * @type {number}
   */
  isLoadingFallbackDelay?: number;
  /**
   * Whether the component has no data to display.
   *
   * @type {boolean}
   */
  hasNoData?: boolean;
  /**
   * The 'no data' fallback component to render when `isLoading` is false and `hasNoData` is true.
   *
   * @type {JSX.Element}
   */
  hasNoDataFallback?: JSX.Element;
  /**
   * The minimum time in milliseconds to show the 'no data' fallback component.
   *
   * @type {number}
   */
  hasNoDataFallbackDelay?: number;
};

/**
 * Supports rendering various fallback components based on the loading/data state.
 *
 * Renders a loading fallback component if `isLoading` is true.
 * Optionally renders a 'no data' fallback component if `isLoading` is false and `hasNoData` is true.
 *
 * If `isLoadingFallbackDelay` or `hasNoDataFallbackDelay` are provided, the respective fallback will be shown for at
 * least `isLoadingFallbackDelay` or `hasNoDataFallbackDelay` milliseconds. Why? To prevent flickering of the UI when
 * the loading state is short-lived.
 *
 * The fallback components are typically loading spinners, skeleton loaders, etc.
 *
 * @example
 * ```tsx
 *   <LoadingGuard
 *     isLoading={isLoading}
 *     isLoadingFallback={<Spinner />}
 *     isLoadingFallbackDelay={100}
 *     hasNoData={!myData}
 *     hasNoDataFallback={<NoData />}
 *     hasNoDataFallbackDelay={100}>
 *     <MyComponent data={myData}/>
 *   </LoadingGuard>
 * ```
 *
 * @param {PropsWithChildren<ILoadingGuardProps>} props
 * @return {*}
 */
export const LoadingGuard = (props: PropsWithChildren<ILoadingGuardProps>) => {
  const {
    isLoading,
    isLoadingFallback,
    isLoadingFallbackDelay,
    hasNoData,
    hasNoDataFallback,
    hasNoDataFallbackDelay,
    children
  } = props;

  const [showIsLoadingFallback, setShowIsLoadingFallback] = useState(isLoading ?? false);
  const [showHasNoDataFallback, setShowHasNoDataFallback] = useState(hasNoData ?? false);

  useEffect(() => {
    if (isLoading) {
      // If the loading state changes to true, show the is loading fallback
      setShowIsLoadingFallback(true);
      return;
    }

    // If the loading state changes to false, hide the is loading fallback after a delay
    if (isLoadingFallbackDelay) {
      // If there is a delay, show the is loading fallback for at least `isLoadingFallbackDelay` milliseconds
      setTimeout(() => {
        // Disable the is loading fallback after the delay
        setShowIsLoadingFallback(false);
      }, isLoadingFallbackDelay);
      return;
    }

    // If there is no delay, disable the is loading fallback immediately
    setShowIsLoadingFallback(false);
  }, [isLoading, isLoadingFallbackDelay]);

  useEffect(() => {
    if (isLoading) {
      // Do nothing - the loading state takes precedence over the no data state
      return;
    }

    if (hasNoData) {
      // If there is no data to display, show the no data fallback
      setShowHasNoDataFallback(true);
      return;
    }

    // If there is data to display, hide the no data fallback after a delay
    if (hasNoDataFallbackDelay) {
      // If there is a delay, show the no data fallback for at least `hasNoDataFallbackDelay` milliseconds
      setTimeout(() => {
        // Disable the no data fallback after the delay
        setShowHasNoDataFallback(false);
      }, hasNoDataFallbackDelay);
      return;
    }

    // If there is no delay, disable the no data fallback immediately
    setShowHasNoDataFallback(false);
  }, [hasNoData, hasNoDataFallbackDelay, isLoading]);

  if (isLoading || showIsLoadingFallback) {
    // If the component is in a loading state, show the is loading fallback
    return <>{isLoadingFallback}</>;
  }

  if (hasNoData || showHasNoDataFallback) {
    // If the component has no data to display, show the no data fallback
    return <>{hasNoDataFallback}</>;
  }

  // If the component is not in a loading state and has data to display, render the children
  return <>{children}</>;
};
