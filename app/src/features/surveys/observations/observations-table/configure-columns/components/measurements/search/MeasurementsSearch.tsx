import { MeasurementsSearchAutocomplete } from 'features/surveys/observations/observations-table/configure-columns/components/measurements/search/MeasurementsSearchAutocomplete';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';

export interface IMeasurementsSearchProps {
  /**
   * The selected measurements.
   *
   * @type {CBMeasurementType[]}
   * @memberof IMeasurementsSearchProps
   */
  selectedMeasurements: CBMeasurementType[];
  /**
   * Callback fired on select options.
   *
   * @memberof IMeasurementsSearchProps
   */
  onAddMeasurementColumn: (measurementColumn: CBMeasurementType) => void;
}

/**
 * Renders an search input to find and add measurements.
 *
 * @param {IMeasurementsSearchProps} props
 * @return {*}
 */
export const MeasurementsSearch = (props: IMeasurementsSearchProps) => {
  const { selectedMeasurements, onAddMeasurementColumn } = props;

  const critterbaseApi = useCritterbaseApi();
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const measurementsDataLoader = useDataLoader(critterbaseApi.xref.getMeasurementTypeDefinitionsBySearchTerm);

  const focalSpecies =
    surveyContext.surveyDataLoader.data?.surveyData.species.focal_species.map((species) => species.tsn) ?? [];

  const focalSpeciesDataLoader = useDataLoader((tsns: number[]) => biohubApi.taxonomy.getTaxonHierarchyByTSNs(tsns));

  useEffect(() => {
    if (focalSpecies.length) focalSpeciesDataLoader.load(focalSpecies);
  }, [focalSpecies]);

  const priorityTsns = focalSpeciesDataLoader.data?.flatMap((taxon) => taxon.hierarchy);

  return (
    <MeasurementsSearchAutocomplete
      selectedOptions={selectedMeasurements}
      priorityTsns={priorityTsns}
      getOptions={async (inputValue: string) => {
        const response = await measurementsDataLoader.refresh(inputValue);
        return (response && [...response.qualitative, ...response.quantitative]) || [];
      }}
      onAddMeasurementColumn={onAddMeasurementColumn}
    />
  );
};
