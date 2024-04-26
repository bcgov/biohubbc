import { EnvironmentsSearchAutocomplete } from 'features/surveys/observations/observations-table/configure-columns/components/environment/search/EnvironmentsSearchAutocomplete';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { EnvironmentType } from 'interfaces/useReferenceApi.interface';

export interface IEnvironmentsSearchProps {
  /**
   * The selected environments.
   *
   * @type {EnvironmentType[]}
   * @memberof IEnvironmentsSearchProps
   */
  selectedEnvironments: EnvironmentType[];
  /**
   * Callback fired on select options.
   *
   * @memberof IEnvironmentsSearchProps
   */
  onAddEnvironmentColumn: (environmentColumn: EnvironmentType) => void;
}

/**
 * Renders an search input to find and add environments.
 *
 * @param {IEnvironmentsSearchProps} props
 * @return {*}
 */
export const EnvironmentsSearch = (props: IEnvironmentsSearchProps) => {
  const { selectedEnvironments, onAddEnvironmentColumn } = props;

  const biohubApi = useBiohubApi();

  const environmentsDataLoader = useDataLoader(async (searchTerm: string) =>
    biohubApi.reference.findSubcountEnvironments(searchTerm)
  );

  return (
    <EnvironmentsSearchAutocomplete
      selectedOptions={selectedEnvironments}
      getOptions={async (inputValue: string) => {
        const response = await environmentsDataLoader.refresh(inputValue);
        return (response && [...response.qualitative_environments, ...response.quantitative_environments]) || [];
      }}
      onAddEnvironmentColumn={onAddEnvironmentColumn}
    />
  );
};
