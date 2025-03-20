import { SamplingSiteListProvider } from 'contexts/samplingSiteListContext';
import { SamplingSiteList } from './SamplingSiteList';

interface ISamplingSiteListContainerProps {
  isDisabled: boolean;
  getSamplePeriodImportButton: (samplePeriodId: number) => JSX.Element;
}

/**
 * Container for the Sampling Site List component
 *
 * Note: Wraps the SamplingSiteList component in a SamplingSiteListProvider to provide context.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SamplingSiteListContainer = (props: ISamplingSiteListContainerProps): JSX.Element => {
  return (
    <SamplingSiteListProvider getSamplePeriodImportButton={props.getSamplePeriodImportButton}>
      <SamplingSiteList isDisabled={props.isDisabled} />
    </SamplingSiteListProvider>
  );
};
