import { GridColumnVisibilityModel } from '@mui/x-data-grid';
import { ObservationAnalyticsDataTable } from 'features/surveys/view/components/analytics/components/ObservationAnalyticsDataTable';
import { IGroupByOption } from 'features/surveys/view/components/analytics/SurveyObservationAnalytics';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { IObservationCountByGroup } from 'interfaces/useAnalyticsApi.interface';
import { useEffect, useMemo } from 'react';
import {
  getBasicGroupByColDefs,
  getDateColDef,
  getIndividualCountColDef,
  getIndividualPercentageColDef,
  getRowCountColDef,
  getSamplingMethodColDef,
  getSamplingPeriodColDef,
  getSamplingSiteColDef,
  getSpeciesColDef
} from './ObservationsAnalyticsGridColumnDefinitions';

export type IObservationAnalyticsRow = Omit<
  IObservationCountByGroup,
  'quantitative_measurements' | 'qualitative_measurements'
> & {
  [key: string]: string | number | null;
};

// Base columns that are always displayed, and not part of the group by columns
const BaseColumns = ['row_count', 'individual_count', 'individual_percentage'];

interface IObservationAnalyticsDataTableContainerProps {
  groupByColumns: IGroupByOption[];
  groupByQuantitativeMeasurements: IGroupByOption[];
  groupByQualitativeMeasurements: IGroupByOption[];
}

/**
 * Observation Analytics Data Table Container.
 * Fetches and parses the observation analytics data and passes it to the ObservationAnalyticsDataTable component.
 *
 * @param {IObservationAnalyticsDataTableContainerProps} props
 * @return {*}
 */
export const ObservationAnalyticsDataTableContainer = (props: IObservationAnalyticsDataTableContainerProps) => {
  const { groupByColumns, groupByQuantitativeMeasurements, groupByQualitativeMeasurements } = props;

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();
  const taxonomyContext = useTaxonomyContext();

  const analyticsDataLoader = useDataLoader(
    (
      surveyId: number,
      groupByColumns: IGroupByOption[],
      groupByQuantitativeMeasurements: IGroupByOption[],
      groupByQualitativeMeasurements: IGroupByOption[]
    ) =>
      biohubApi.analytics.getObservationCountByGroup(
        [surveyId],
        groupByColumns.map((item) => item.field),
        groupByQuantitativeMeasurements.map((item) => item.field),
        groupByQualitativeMeasurements.map((item) => item.field)
      )
  );

  useEffect(
    () => {
      analyticsDataLoader.refresh(
        surveyContext.surveyId,
        groupByColumns,
        groupByQuantitativeMeasurements,
        groupByQualitativeMeasurements
      );
    },
    // eslint-disable-next-line
    [groupByColumns, groupByQualitativeMeasurements, groupByQuantitativeMeasurements, surveyContext.surveyId]
  );

  const rows = useMemo(
    () =>
      analyticsDataLoader?.data?.map((row) => {
        const { quantitative_measurements, qualitative_measurements, ...nonMeasurementRows } = row;

        const newRow: IObservationAnalyticsRow = nonMeasurementRows;

        qualitative_measurements.forEach((measurement) => {
          newRow[measurement.taxon_measurement_id] = measurement.option.option_label;
        });

        quantitative_measurements.forEach((measurement) => {
          newRow[measurement.taxon_measurement_id] = measurement.value;
        });

        return newRow;
      }) ?? [],
    [analyticsDataLoader?.data]
  );

  const sampleSites = useMemo(
    () => surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [],
    [surveyContext.sampleSiteDataLoader.data?.sampleSites]
  );

  const allGroupByColumns = useMemo(
    () => [...groupByColumns, ...groupByQualitativeMeasurements, ...groupByQuantitativeMeasurements],
    [groupByColumns, groupByQualitativeMeasurements, groupByQuantitativeMeasurements]
  );

  const columns = useMemo(
    () => [
      getRowCountColDef(),
      getIndividualCountColDef(),
      getIndividualPercentageColDef(),
      getSamplingSiteColDef(sampleSites),
      getSamplingMethodColDef(sampleSites),
      getSamplingPeriodColDef(sampleSites),
      getSpeciesColDef(taxonomyContext.getCachedSpeciesTaxonomyById),
      getDateColDef(),
      ...getBasicGroupByColDefs([...groupByQualitativeMeasurements, ...groupByQuantitativeMeasurements])
    ],
    // eslint-disable-next-line
    [rows, allGroupByColumns]
  );

  const columnVisibilityModel = useMemo(() => {
    const _columnVisibilityModel: GridColumnVisibilityModel = {};

    for (const column of columns) {
      // Set all columns to visible by default
      _columnVisibilityModel[column.field] = true;

      if (BaseColumns.includes(column.field)) {
        // Don't hide base columns
        continue;
      }

      if (!allGroupByColumns.some((item) => item.field === column.field)) {
        // Set columns that are not part of the group by columns (not selected in the UI) to hidden
        _columnVisibilityModel[column.field] = false;
      }
    }

    return _columnVisibilityModel;
  }, [allGroupByColumns, columns]);

  return (
    <ObservationAnalyticsDataTable
      isLoading={!analyticsDataLoader.data}
      columns={columns}
      rows={rows}
      columnVisibilityModel={columnVisibilityModel}
    />
  );
};
