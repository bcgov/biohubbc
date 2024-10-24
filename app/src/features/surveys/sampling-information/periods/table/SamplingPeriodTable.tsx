import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useCodesContext } from 'hooks/useContext';
import { getCodesName } from 'utils/Utils';

dayjs.extend(duration);

export interface ISamplingSitePeriodRowData {
  id: number;
  sample_site: string;
  sample_method: string;
  method_response_metric_id: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
}

interface ISamplingPeriodTableProps {
  periods: ISamplingSitePeriodRowData[];
}

/**
 * Calculates the duration between two dates and times.
 *
 * @param startDate string - start date
 * @param startTime string | null - start time
 * @param endDate string - end date
 * @param endTime string | null - end time
 * @returns string - duration in days and hours
 */
const calculateDuration = (
  startDate: string,
  startTime: string | null,
  endDate: string,
  endTime: string | null
): string => {
  const start = dayjs(`${startDate} ${startTime ?? '00:00'}`);
  const end = dayjs(`${endDate} ${endTime ?? '00:00'}`);

  const diff = dayjs.duration(end.diff(start));

  const days = diff.days();
  const hours = diff.hours();

  return `${days} day(s) and ${hours} hour(s)`;
};

/**
 * Renders a table of sampling periods.
 *
 * @param props {<ISamplingPeriodTableProps>}
 * @returns {*}
 */
export const SamplingPeriodTable = (props: ISamplingPeriodTableProps) => {
  const { periods } = props;

  const codesContext = useCodesContext();

  const columns: GridColDef<any>[] = [
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
      renderCell: (params) => (
        <>
          {getCodesName(
            codesContext.codesDataLoader.data,
            'method_response_metrics',
            params.row.method_response_metric_id
          )}
        </>
      )
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
        const duration = calculateDuration(
          params.row.start_date,
          params.row.start_time,
          params.row.end_date,
          params.row.end_time
        );
        return <Typography variant="body2">{duration}</Typography>;
      }
    }
  ];

  return (
    <StyledDataGrid
      autoHeight
      getRowHeight={() => 'auto'}
      disableColumnMenu
      rows={periods}
      getRowId={(row: ISamplingSitePeriodRowData) => row.id}
      columns={columns}
      checkboxSelection={false}
      disableRowSelectionOnClick
      initialState={{
        pagination: {
          paginationModel: { page: 1, pageSize: 10 }
        }
      }}
      pageSizeOptions={[10, 25, 50]}
    />
  );
};
