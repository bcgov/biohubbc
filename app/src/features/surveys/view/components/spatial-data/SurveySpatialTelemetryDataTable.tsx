import grey from '@mui/material/colors/grey';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext, useMemo } from 'react';

// Set height so we the skeleton loader will match table rows
const rowHeight = 52;

interface ITelemetryData {
  id: number;
  critter_id: string | null;
  device_id: number;
  start: string;
  end: string;
}

interface ISurveySpatialTelemetryDataTableProps {
  isLoading: boolean;
}

// Skeleton Loader template
const SkeletonRow = () => (
  <Stack
    flexDirection="row"
    alignItems="center"
    gap={2}
    p={2}
    height={rowHeight}
    overflow="hidden"
    sx={{
      borderBottom: '1px solid ' + grey[300],
      '&:last-of-type': {
        borderBottom: 'none'
      },
      '& .MuiSkeleton-root': {
        flex: '1 1 auto'
      },
      '& *': {
        fontSize: '0.875rem'
      }
    }}>
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
  </Stack>
);

const SurveySpatialTelemetryDataTable = (props: ISurveySpatialTelemetryDataTableProps) => {
  const surveyContext = useContext(SurveyContext);

  const tableRows = useMemo(() => {
    return surveyContext.critterDeployments.map((item) => ({
      // critters in this table may use multiple devices accross multiple timespans
      id: `${item.critter.survey_critter_id}-${item.deployment.device_id}-${item.deployment.critterbase_start_capture_id}`,
      alias: item.critter.animal_id,
      device_id: item.deployment.device_id
      // start: dayjs(item.deployment.attachment_start).format('YYYY-MM-DD'),
      // end: item.deployment.attachment_end ? dayjs(item.deployment.attachment_end).format('YYYY-MM-DD') : 'Still Active'
    }));
  }, [surveyContext.critterDeployments]);

  const columns: GridColDef<ITelemetryData>[] = [
    {
      field: 'alias',
      headerName: 'Alias',
      flex: 1
    },
    {
      field: 'device_id',
      headerName: 'Device ID',
      flex: 1
    },
    {
      field: 'start',
      headerName: 'Start',
      flex: 1
    },
    {
      field: 'end',
      headerName: 'End',
      flex: 1
    }
  ];

  return (
    <>
      {props.isLoading ? (
        <Stack>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </Stack>
      ) : (
        <StyledDataGrid
          noRowsMessage={'No telemetry records found'}
          columnHeaderHeight={rowHeight}
          rowHeight={rowHeight}
          rows={tableRows}
          getRowId={(row) => row.id}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 1, pageSize: 5 }
            }
          }}
          pageSizeOptions={[5]}
          rowSelection={false}
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          disableVirtualization
          sortingOrder={['asc', 'desc']}
          data-testid="survey-spatial-telemetry-data-table"
        />
      )}
    </>
  );
};

export default SurveySpatialTelemetryDataTable;
