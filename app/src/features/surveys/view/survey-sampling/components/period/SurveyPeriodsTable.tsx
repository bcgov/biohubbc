import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useCodesContext } from 'hooks/useContext';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { useEffect, useRef } from 'react';
import { formatTimeDifference } from 'utils/datetime';
import { getCodesName, getFormattedDate } from 'utils/Utils';

interface ISamplingPeriodTableProps {
  periods: GetSamplingPeriod[];
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  sortModel: GridSortModel;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  rowCount: number;
}

/**
 * Renders a table of survey sampling periods, for the Survey page.
 *
 * @param {ISamplingPeriodTableProps} props
 * @return {*}
 */
export const SurveyPeriodsTable = (props: ISamplingPeriodTableProps) => {
  const { periods, paginationModel, setPaginationModel, sortModel, setSortModel, rowCount } = props;

  const codesContext = useCodesContext();

  const codesLoadRef = useRef(codesContext.codesDataLoader.load);
  codesLoadRef.current = codesContext.codesDataLoader.load;
  useEffect(() => {
    codesLoadRef.current();
  }, []);

  const columns: GridColDef<GetSamplingPeriod>[] = [
    {
      field: 'survey_sample_site_name',
      headerName: 'Site',
      flex: 1,
      sortable: false, // TODO not yet supported by the API
      valueGetter: (params) => {
        return params.row.survey_sample_site?.name;
      }
    },
    {
      field: 'method_technique_name',
      headerName: 'Technique',
      flex: 1,
      sortable: false, // TODO not yet supported by the API
      valueGetter: (params) => {
        return params.row.method_technique?.name;
      }
    },
    {
      field: 'method_response_metric_id',
      headerName: 'Response Metric',
      flex: 1,
      valueGetter: (params) => {
        const method_response_metric_id = params.row.method_technique?.method_response_metric_id;

        if (!method_response_metric_id) {
          return null;
        }

        const value = getCodesName(
          codesContext.codesDataLoader.data,
          'method_response_metrics',
          method_response_metric_id
        );

        return value;
      }
    },
    {
      field: 'start_date',
      headerName: 'Start date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.start_date)}</Typography>
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
        <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.end_date)}</Typography>
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
      sortable: false, // TODO not yet supported by the API
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
      getRowId={(row: GetSamplingPeriod) => row.survey_sample_period_id}
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
