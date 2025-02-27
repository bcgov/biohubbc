import { useObservationsPageContext } from 'hooks/useContext';
import { SamplingSiteList } from './SamplingSiteList';

/**
 * Container for the Sampling Site List component
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SamplingSiteListContainer = (): JSX.Element => {
  const observationsPageContext = useObservationsPageContext();

  return <SamplingSiteList isMenuDisabled={observationsPageContext.isDisabled} />;
};
