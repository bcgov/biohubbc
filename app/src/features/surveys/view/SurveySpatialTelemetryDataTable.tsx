import grey from '@mui/material/colors/grey';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SurveyContext } from 'contexts/surveyContext';
import dayjs from 'dayjs';
import { useContext, useMemo } from 'react';
import { ICritterDeployment } from '../telemetry/ManualTelemetryList';
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
const SurveySpatialTelemetryDataTable = (props: ISurveySpatialTelemetryDataTableProps) => {
  const surveyContext = useContext(SurveyContext);
  const flattenedCritterDeployments: ICritterDeployment[] = useMemo(() => {
    const data: ICritterDeployment[] = [];
    // combine all critter and deployments into a flat list
    surveyContext.deploymentDataLoader.data?.forEach((deployment) => {
      const critter = surveyContext.critterDataLoader.data?.find(
        (critter) => critter.critter_id === deployment.critter_id
      );
      if (critter) {
        data.push({ critter, deployment });
      }
    });
    return data;
  }, [surveyContext.critterDataLoader.data, surveyContext.deploymentDataLoader.data]);

  const tableData: ITelemetryData[] = flattenedCritterDeployments.map((item) => ({
    id: item.critter.survey_critter_id,
    critter_id: item.critter.animal_id,
    device_id: item.deployment.device_id,
    start: dayjs(item.deployment.attachment_start).format('YYYY-MM-DD'),
    end: item.deployment.attachment_end ? dayjs(item.deployment.attachment_end).format('YYYY-MM-DD') : 'Still Active'
  }));

  const columns: GridColDef<ITelemetryData>[] = [
    {
      field: 'critter_id',
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

  // Set height so we the skeleton loader will match table rows
  const RowHeight = 52;

  // Skeleton Loader template
  const SkeletonRow = () => (
    <Stack
      flexDirection="row"
      alignItems="center"
      gap={2}
      p={2}
      height={RowHeight}
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
          columnHeaderHeight={RowHeight}
          rowHeight={RowHeight}
          rows={tableData}
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
