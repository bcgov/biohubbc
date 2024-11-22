import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useCodesContext } from 'hooks/useContext';
import { formatTimeDifference } from 'utils/datetime';
import { getCodesName } from 'utils/Utils';

export interface ISamplingSitePeriodRowData {
  id: number;
  sample_site: string;
  sample_method: string;
  method_response_metric_id: number;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

interface ISamplingPeriodTableProps {
  periods: ISamplingSitePeriodRowData[];
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  sortModel: GridSortModel;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  rowCount: number;
}

/**
 * Renders a table of sampling periods.
 *
 * @param props {<ISamplingPeriodTableProps>}
 * @returns {*}
 */
export const SamplingPeriodTable = (props: ISamplingPeriodTableProps) => {
  const { periods, paginationModel, setPaginationModel, sortModel, setSortModel, rowCount } = props;

  const codesContext = useCodesContext();

  const columns: GridColDef<ISamplingSitePeriodRowData>[] = [
    {
      field: 'sample_site',
      headerName: 'Site',
      flex: 1
    },
    {
      field: 'sample_method',
      headerName: 'Technique',
      flex: 1
    },
    {
      field: 'method_response_metric_id',
      headerName: 'Response Metric',
      flex: 1,
      valueGetter: (params) => {
        const value = getCodesName(
          codesContext.codesDataLoader.data,
          'method_response_metrics',
          params.row.method_response_metric_id
        );

        return value;
      }
    },
    {
      field: 'start_date',
      headerName: 'Start date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{dayjs(params.row.start_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
      )
    },
    {
      field: 'start_time',
      headerName: 'Start time',
      flex: 1
    },
    {
      field: 'end_date',
      headerName: 'End date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{dayjs(params.row.end_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
      )
    },
    {
      field: 'end_time',
      headerName: 'End time',
      flex: 1
    },
    {
      field: 'duration',
      headerName: 'Duration',
      flex: 1,
      renderCell: (params) => {
        const { start_date, start_time, end_date, end_time } = params.row;
        return formatTimeDifference(start_date, start_time, end_date, end_time);
      }
    }
  ];

  return (
    <StyledDataGrid
      disableColumnMenu
      rowSelection={false}
      autoHeight={false}
      getRowHeight={() => 'auto'}
      rows={periods}
      getRowId={(row: ISamplingSitePeriodRowData) => row.id}
      columns={columns}
      checkboxSelection={false}
      disableRowSelectionOnClick
      rowCount={rowCount}
      paginationMode="server"
      sortingMode="server"
      sortModel={sortModel}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      onSortModelChange={setSortModel}
      initialState={{
        pagination: {
          paginationModel
        }
      }}
      pageSizeOptions={[10, 25, 50]}
    />
  );
};
