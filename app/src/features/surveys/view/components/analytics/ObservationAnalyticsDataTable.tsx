import Box from '@mui/material/Box';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import {
  getDateColDef,
  getDynamicColumns,
  getIndividualCountColDef,
  getIndividualPercentageColDef,
  getRowCountColDef,
  getSamplingMethodColDef,
  getSamplingPeriodColDef,
  getSamplingSiteColDef,
  getSpeciesColDef
} from './components/utils/AnalyticsGridColumnDefinitions';
import { findSampleMethod, findSamplePeriod, findSampleSite } from './components/utils/FindRecords';

interface IObservationAnalyticsDataTableProps {
  groupByColumns: string[];
  groupByQuantitativeMeasurements: string[];
  groupByQualitativeMeasurements: string[];
}

export interface IObservationAnalyticsRow {
  id: number;
  row_count: number;
  individual_count: number;
  individual_percentage: number;
  [key: string]: string | number | undefined;
  itis_tsn?: number;
  observation_date?: string;
  survey_sample_site_id?: number;
  survey_sample_method_id?: number;
  survey_sample_period_id?: number;
}

const ObservationAnalyticsDataTable = (props: IObservationAnalyticsDataTableProps) => {
  const { groupByColumns, groupByQuantitativeMeasurements, groupByQualitativeMeasurements } = props;
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const taxonomyContext = useTaxonomyContext();

  const { surveyId } = surveyContext;

  const analyticsDataLoader = useDataLoader(
    (
      surveyId: number,
      groupByColumns: string[],
      groupByQuantitativeMeasurements: string[],
      groupByQualitativeMeasurements: string[]
    ) =>
      biohubApi.analytics.getObservationCountByGroup(
        [surveyId],
        groupByColumns,
        groupByQuantitativeMeasurements,
        groupByQualitativeMeasurements
      )
  );

  useEffect(() => {
    analyticsDataLoader.refresh(
      surveyId,
      groupByColumns,
      groupByQuantitativeMeasurements,
      groupByQualitativeMeasurements
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupByColumns, groupByQualitativeMeasurements, groupByQuantitativeMeasurements, surveyId]);

  if (!analyticsDataLoader.data?.length) {
    return (
      <Box position="relative" flex="1 1 auto">
        <SkeletonTable numberOfLines={5} />
      </Box>
    );
  }

  const rows = analyticsDataLoader.data.map((row, index) => {
    const { quantitative_measurements, qualitative_measurements, ...nonMeasurementRows } = row;

    const newRow: IObservationAnalyticsRow = {
      id: index,
      ...nonMeasurementRows
    };

    qualitative_measurements.forEach((measurement) => {
      newRow[measurement.measurement_name] = measurement.option.option_label;
    });

    quantitative_measurements.forEach((measurement) => {
      newRow[measurement.measurement_name] = measurement.value;
    });

    return newRow;
  });

  const columns: GridColDef<IObservationAnalyticsRow>[] = [
    getRowCountColDef(),
    getIndividualCountColDef(),
    getIndividualPercentageColDef(),
    ...getDynamicColumns(rows, [
      ...groupByColumns,
      ...groupByQuantitativeMeasurements,
      ...groupByQualitativeMeasurements,
      'row_count',
      'individual_count',
      'individual_percentage'
    ])
  ];

  const keys = Object.keys(rows[0]);
  const sampleSites = surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [];

  if (keys.includes('itis_tsn')) {
    columns.push(getSpeciesColDef(taxonomyContext.getCachedSpeciesTaxonomyById));
  }

  if (keys.includes('observation_date')) {
    columns.push(getDateColDef());
  }

  if (keys.includes('survey_sample_site_id')) {
    columns.push(getSamplingSiteColDef((survey_sample_site_id) => findSampleSite(sampleSites, survey_sample_site_id)));
  }

  if (keys.includes('survey_sample_method_id')) {
    columns.push(
      getSamplingMethodColDef((survey_sample_method_id) => findSampleMethod(sampleSites, survey_sample_method_id))
    );
  }

  if (keys.includes('survey_sample_period_id')) {
    columns.push(
      getSamplingPeriodColDef((survey_sample_period_id) => findSamplePeriod(sampleSites, survey_sample_period_id))
    );
  }

  const rowHeight = 50;

  return (
    <Box height="100%" overflow="auto" flex="1 1 auto">
      <StyledDataGrid
        noRowsMessage="No observation records found"
        columnHeaderHeight={rowHeight}
        rowHeight={rowHeight}
        rows={rows}
        rowCount={rows.length}
        sortingMode="server"
        loading={analyticsDataLoader.isLoading}
        columns={columns}
        rowSelection
        disableRowSelectionOnClick
        checkboxSelection
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        disableVirtualization
        data-testid="survey-spatial-observation-data-table"
        sx={{
          '& .MuiDataGrid-columnHeaderDraggableContainer': { minWidth: '50px' },
          '& .MuiDataGrid-cellContent, .MuiTypography-root': {
            textTransform: 'capitalize',
            fontSize: '0.9rem'
          }
        }}
      />
    </Box>
  );
};

export default ObservationAnalyticsDataTable;
