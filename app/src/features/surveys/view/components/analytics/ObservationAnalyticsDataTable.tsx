import Box from '@mui/material/Box';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';

interface IObservationAnalyticsDataTableProps {
  groupByColumns: string[];
  groupByQuantitativeMeasurements: string[];
  groupByQualitativeMeasurements: string[];
  qualitativeMeasurementDefinitions: CBQualitativeMeasurementTypeDefinition[];
  quantitativeMeasurementDefinitions: CBQuantitativeMeasurementTypeDefinition[];
}

interface IObservationAnalyticsRow {
  id: number;
  [key: string]: any;
}

const ObservationAnalyticsDataTable = (props: IObservationAnalyticsDataTableProps) => {
  const { groupByColumns, groupByQuantitativeMeasurements, groupByQualitativeMeasurements } = props;
  const biohubApi = useBiohubApi();

  const { surveyId } = useSurveyContext();

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
  }, [groupByColumns, groupByQuantitativeMeasurements, groupByQualitativeMeasurements]);

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

  const columns: GridColDef<IObservationAnalyticsRow>[] = Object.keys(rows[0])
    .filter((field) => field !== 'id')
    .map((field) => ({
      field,
      headerName: field,
      flex: 1,
      minWidth: 200
    }));

  const rowHeight = 50;

  return (
    <Box height="100%" overflow="auto" flex="1 1 auto">
      <StyledDataGrid
        sx={{ height: '100%' }}
        noRowsMessage="No observation records found"
        columnHeaderHeight={rowHeight}
        rowHeight={rowHeight}
        rows={rows}
        rowCount={rows.length}
        sortingMode="server"
        loading={analyticsDataLoader.isLoading}
        columns={columns}
        rowSelection={false}
        checkboxSelection={false}
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        disableVirtualization
        data-testid="survey-spatial-observation-data-table"
      />
    </Box>
  );
};

export default ObservationAnalyticsDataTable;
