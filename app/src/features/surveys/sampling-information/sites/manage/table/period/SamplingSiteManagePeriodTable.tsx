import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { IGetSampleSiteResponse } from 'interfaces/useSamplingSiteApi.interface';
import { SamplingSiteManageTable } from '../SamplingSiteManageTable';

interface ISamplingSiteManagePeriodTableProps {
  sites: IGetSampleSiteResponse;
  handleRowSelection: (selection: GridRowSelectionModel) => void;
  rowSelectionModel: GridRowSelectionModel;
}

export const SamplingSiteManagePeriodTable = (props: ISamplingSiteManagePeriodTableProps) => {
  const { sites, rowSelectionModel, handleRowSelection } = props;

  // Flatten and map periods to rows
  const periods = sites?.sampleSites.flatMap((site) =>
    site.sample_methods.flatMap((method) => method.sample_periods)
  );

  const rows =
    periods
      .map((period) => {
        const site = sites.sampleSites.find((site) =>
          site.sample_methods.some((method) => method.survey_sample_method_id === period.survey_sample_method_id)
        );
        if (site) {
          const method = site.sample_methods.find(
            (method) => method.survey_sample_method_id === period.survey_sample_method_id
          );
          if (method) {
            return {
              id: period.survey_sample_period_id,
              sample_site: site.name,
              sample_method: method.technique.name,
              start_date: period.start_date,
              end_date: period.end_date,
              start_time: period.start_time,
              end_time: period.end_time
            };
          }
        }
        return null;
      })
      .filter((row) => row !== null); // Ensure rows are not null

  const columns: GridColDef<any>[] = [
    {
      field: 'sample_site',
      headerName: 'Site',
      flex: 0.3
    },
    {
      field: 'sample_method',
      headerName: 'Technique',
      flex: 0.3
    },
    {
      field: 'start_date',
      headerName: 'Start date',
      flex: 0.3
    },
    {
      field: 'start_time',
      headerName: 'Start time',
      flex: 0.3
    },
    {
      field: 'end_date',
      headerName: 'End date',
      flex: 0.3
    },
    {
      field: 'end_time',
      headerName: 'End time',
      flex: 0.3
    }
  ];

  return (
    <SamplingSiteManageTable
      rows={rows}
      columns={columns}
      rowSelectionModel={rowSelectionModel}
      handleRowSelection={handleRowSelection}
      noRowsMessage="No Sites"
      noRowsOverlayTitle="Add Sampling Periods"
      noRowsOverlaySubtitle="Sampling periods show where techniques were implemented"
      checkboxSelection
      sx={{
        '& .MuiDataGrid-columnHeaderDraggableContainer': {
          minWidth: '50px'
        }
      }}
    />
  );
};
