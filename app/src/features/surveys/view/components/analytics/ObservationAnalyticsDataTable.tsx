import Box from '@mui/material/Box';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';

interface IObservationAnalyticsDataTableProps {
  groupByColumns: string[];
  groupByQuantitativeMeasurements: string[];
  groupByQualitativeMeasurements: string[];
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
      groupByQualitativeMeasurements: string[],
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
    return <></>;
  }

  const rows: IObservationAnalyticsRow[] = analyticsDataLoader.data.map((item, index) => ({
    id: index,
    ...item
  }));

  const columns: GridColDef<IObservationAnalyticsRow>[] = Object.keys(analyticsDataLoader.data[0]).map((field) => ({
    field,
    headerName: field.charAt(0).toUpperCase() + field.slice(1),
    flex: 1,
    minWidth: 200
  }));

  // const columns: GridColDef<IObservationAnalyticsRow>[] = analyticsDataLoader.data.map((field) => ({field.})

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
