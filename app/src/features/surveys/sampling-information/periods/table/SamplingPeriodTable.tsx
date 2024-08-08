import { mdiArrowTopRight } from '@mdi/js';
import Typography from '@mui/material/Typography';
import { GridColDef, GridOverlay } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useCodesContext } from 'hooks/useContext';
import { IGetSampleSiteResponse } from 'interfaces/useSamplingSiteApi.interface';
import { getCodesName } from 'utils/Utils';

interface ISamplingSitePeriodRowData {
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
  sites?: IGetSampleSiteResponse;
}

/**
 * Renders a table of sampling periods.
 *
 * @param props {<ISamplingPeriodTableProps>}
 * @returns {*}
 */
export const SamplingPeriodTable = (props: ISamplingPeriodTableProps) => {
  const { sites } = props;

  const codesContext = useCodesContext();

  const rows: ISamplingSitePeriodRowData[] = [];

  // Flatten the sample sites, methods, and periods into a single array of rows
  for (const site of sites?.sampleSites ?? []) {
    for (const method of site.sample_methods) {
      for (const period of method.sample_periods) {
        rows.push({
          sample_site: site.name,
          sample_method: method.technique.name,
          method_response_metric_id: method.method_response_metric_id,
          start_date: period.start_date,
          end_date: period.end_date,
          start_time: period.start_time,
          end_time: period.end_time,
          id: period.survey_sample_period_id
        });
      }
    }
  }

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
    }
  ];

  return (
    <StyledDataGrid
      autoHeight
      getRowHeight={() => 'auto'}
      disableColumnMenu
      rows={rows}
      getRowId={(row: ISamplingSitePeriodRowData) => row.id}
      columns={columns}
      checkboxSelection={false}
      disableRowSelectionOnClick
      initialState={{
        pagination: {
          paginationModel: { page: 1, pageSize: 5 }
        }
      }}
      pageSizeOptions={[5, 10, 25]}
      noRowsOverlay={
        <GridOverlay>
          <NoDataOverlay
            title="Add Sampling Periods"
            subtitle="Sampling periods describe when a technique was implemented at a site"
            icon={mdiArrowTopRight}
          />
        </GridOverlay>
      }
      sx={{
        '& .MuiDataGrid-virtualScroller': {
          height: rows.length === 0 ? '250px' : 'unset',
          overflowY: 'auto !important',
          overflowX: 'hidden'
        },
        '& .MuiDataGrid-overlay': {
          height: '250px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }}
    />
  );
};
