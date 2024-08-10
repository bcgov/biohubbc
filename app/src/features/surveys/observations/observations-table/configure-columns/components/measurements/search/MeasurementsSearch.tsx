import green from '@mui/material/colors/green';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { MeasurementsSearchAutocomplete } from 'features/surveys/observations/observations-table/configure-columns/components/measurements/search/MeasurementsSearchAutocomplete';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useObservationsContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';

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
  /**
   * Whether to only show measurements that priority species can have, such as focal species
   *
   * @memberof IMeasurementsSearchProps
   */
  priorityOnly?: boolean;
}

/**
 * Renders an search input to find and add measurements.
 *
 * @param {IMeasurementsSearchProps} props
 * @return {*}
 */
import React, { useEffect } from 'react';

export const MeasurementsSearch: React.FC<IMeasurementsSearchProps> = (props) => {
  const { selectedMeasurements, onAddMeasurementColumn, priorityOnly } = props;

  const critterbaseApi = useCritterbaseApi();
  const surveyContext = useSurveyContext();
  const observationsContext = useObservationsContext();
  const biohubApi = useBiohubApi();

  const measurementsDataLoader = useDataLoader((searchTerm: string, tsns?: number[]) =>
    critterbaseApi.xref.getMeasurementTypeDefinitionsBySearchTerm(searchTerm, tsns)
  );

  const hierarchyDataLoader = useDataLoader((tsns: number[]) => biohubApi.taxonomy.getTaxonHierarchyByTSNs(tsns));

  useEffect(() => {
    if (!observationsContext.observedSpeciesDataLoader.data) {
      observationsContext.observedSpeciesDataLoader.load();
    }
  }, [observationsContext.observedSpeciesDataLoader.data]);

  const focalOrObservedSpecies: number[] = [
    ...(surveyContext.surveyDataLoader.data?.surveyData.species.focal_species.map((species) => species.tsn) ?? []),
    ...(observationsContext.observedSpeciesDataLoader.data?.map((species) => species.tsn) ?? [])
  ];

  useEffect(() => {
    if (focalOrObservedSpecies.length) {
      hierarchyDataLoader.load(focalOrObservedSpecies);
    }
  }, []);

  const getOptions = async (inputValue: string): Promise<any[]> => {
    const response = priorityOnly
      ? await measurementsDataLoader.refresh(inputValue, focalOrObservedSpecies)
      : await measurementsDataLoader.refresh(inputValue);

    return response ? [...response.qualitative, ...response.quantitative] : [];
  };

  const priorityTsns = [
    ...focalOrObservedSpecies,
    ...(hierarchyDataLoader.data?.flatMap((taxon) => taxon.hierarchy) ?? [])
  ];

  return (
    <MeasurementsSearchAutocomplete
      selectedOptions={selectedMeasurements}
      ornament={<ColouredRectangleChip label="Applicable" colour={green} />}
      priorityTsns={priorityTsns}
      getOptions={getOptions}
      onAddMeasurementColumn={onAddMeasurementColumn}
    />
  );
};
