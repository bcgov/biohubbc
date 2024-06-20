import { useTaxonomyContext } from 'hooks/useContext';
import { PropsWithChildren, useEffect, useState } from 'react';

export interface IAwaitTaxonomyCacheProps {
  tsns: number[];
  fallback?: JSX.Element;
}

/**
 * Wrapper component that will initialize the taxonomy cache for the given TSNs, and delay rendering the children
 * until the cache has been updated.
 *
 * @param {PropsWithChildren<IAwaitTaxonomyCacheProps>} props
 * @return {*}
 */
export const AwaitTaxonomyCache = (props: PropsWithChildren<IAwaitTaxonomyCacheProps>) => {
  const { tsns, children, fallback } = props;

  const taxonomyContext = useTaxonomyContext();

  const [isResolved, setIsResolved] = useState<boolean>(false);

  useEffect(() => {
    if (tsns.some((tsn) => !taxonomyContext.getCachedSpeciesTaxonomyById(tsn))) {
      taxonomyContext.cacheSpeciesTaxonomyByIds(tsns).then(() => {
        setIsResolved(true);
      });
    } else {
      setIsResolved(true);
    }
  }, [tsns, taxonomyContext]);

  // Return fallback if the cache has not been resolved
  if (!isResolved) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  // Return children
  return <>{children}</>;
};
