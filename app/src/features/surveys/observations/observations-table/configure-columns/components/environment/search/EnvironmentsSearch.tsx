import { EnvironmentsSearchAutocomplete } from 'features/surveys/observations/observations-table/configure-columns/components/environment/search/EnvironmentsSearchAutocomplete';
import useDataLoader from 'hooks/useDataLoader';
import { EnvironmentType } from 'interfaces/useObservationApi.interface';

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

  const environmentsDataLoader = useDataLoader(async (searchTerm: string) => {
    console.log(searchTerm);
    return {
      qualitative: [],
      quantitative: []
    };
  });

  return (
    <EnvironmentsSearchAutocomplete
      selectedOptions={selectedEnvironments}
      getOptions={async (inputValue: string) => {
        const response = await environmentsDataLoader.refresh(inputValue);
        return (response && [...response.qualitative, ...response.quantitative]) || [];
      }}
      onAddEnvironmentColumn={onAddEnvironmentColumn}
    />
  );
};
