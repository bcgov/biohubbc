import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useCodesContext } from 'hooks/useContext';
import { IFindSamplePeriodRecord } from 'interfaces/useSamplingSiteApi.interface';
import { formatTimeDifference } from 'utils/datetime';
import { getCodesName } from 'utils/Utils';

interface ISamplingPeriodTableProps {
  periods: IFindSamplePeriodRecord[];
  selectedRows: GridRowSelectionModel;
  setSelectedRows: (selection: GridRowSelectionModel) => void;
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  sortModel: GridSortModel;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  pageSizeOptions: number[];
  rowCount: number;
}

/**
 * Renders a table of sampling periods.
 *
 * @param {ISamplingPeriodTableProps} props
 * @returns {*}
 */
export const SamplingPeriodTable = (props: ISamplingPeriodTableProps) => {
  const { periods, paginationModel, setPaginationModel, sortModel, setSortModel, pageSizeOptions, rowCount } = props;

  const codesContext = useCodesContext();

  const columns: GridColDef<IFindSamplePeriodRecord>[] = [
    {
      field: 'sample_site',
      headerName: 'Site',
      flex: 1,
      valueGetter: (params) => {
        return params.row.sample_site.name;
      }
    },
    {
      field: 'sample_method',
      headerName: 'Technique',
      flex: 1,
      valueGetter: (params) => {
        return params.row.method_technique.name;
      }
    },
    {
      field: 'method_response_metric_id',
      headerName: 'Response Metric',
      flex: 1,
      valueGetter: (params) => {
        const value = getCodesName(
          codesContext.codesDataLoader.data,
          'method_response_metrics',
          params.row.sample_method.method_response_metric_id
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
      valueGetter: (params) => {
        const { start_date, start_time, end_date, end_time } = params.row;

        if (!start_date || !end_date) {
          return null;
        }

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
      getRowId={(row: IFindSamplePeriodRecord) => row.survey_sample_period_id}
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
      pageSizeOptions={pageSizeOptions}
    />
  );
};
