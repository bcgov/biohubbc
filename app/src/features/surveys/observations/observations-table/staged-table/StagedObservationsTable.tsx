import Button from '@mui/material/Button';
import { cyan, grey } from '@mui/material/colors';
import { DataGrid } from '@mui/x-data-grid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { useCodesContext, useObservationsTableContext, useSurveyContext } from 'hooks/useContext';
import {
  IGetSampleLocationDetails,
  IGetSampleMethodDetails,
  IGetSamplePeriodRecord
} from 'interfaces/useSamplingSiteApi.interface';
import { has } from 'lodash-es';
import { useMemo } from 'react';
import { getCodesName } from 'utils/Utils';
import {
  ISampleMethodOption,
  ISamplePeriodOption,
  ISampleSiteOption,
  SampleMethodColDef,
  SamplePeriodColDef,
  SampleSiteColDef
} from '../grid-column-definitions/GridColumnDefinitions';

export interface ISpeciesObservationTableProps {
  /**
   * Manually control the loading state of the table.
   *
   * @type {boolean}
   * @memberof ISpeciesObservationTableProps
   */
  isLoading?: boolean;
}

const StagedObservationsTable = (props: ISpeciesObservationTableProps) => {
  const { isLoading } = props;

  const observationsTableContext = useObservationsTableContext();

  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();

  // Collect sample sites
  const surveySampleSites: IGetSampleLocationDetails[] = useMemo(
    () => surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [],
    [surveyContext.sampleSiteDataLoader.data?.sampleSites]
  );

  const sampleSiteOptions: ISampleSiteOption[] = useMemo(
    () =>
      surveySampleSites.map((site) => ({
        survey_sample_site_id: site.survey_sample_site_id,
        sample_site_name: site.name
      })) ?? [],
    [surveySampleSites]
  );

  // Collect sample methods
  const surveySampleMethods: IGetSampleMethodDetails[] = surveySampleSites
    .filter((sampleSite) => Boolean(sampleSite.sample_methods))
    .map((sampleSite) => sampleSite.sample_methods as IGetSampleMethodDetails[])
    .flat(2);
  const sampleMethodOptions: ISampleMethodOption[] = surveySampleMethods.map((method) => ({
    survey_sample_method_id: method.survey_sample_method_id,
    survey_sample_site_id: method.survey_sample_site_id,
    sample_method_name: method.technique.name,
    response_metric:
      getCodesName(codesContext.codesDataLoader.data, 'method_response_metrics', method.method_response_metric_id) ?? ''
  }));

  // Collect sample periods
  const samplePeriodOptions: ISamplePeriodOption[] = surveySampleMethods
    .filter((sampleMethod) => Boolean(sampleMethod.sample_periods))
    .map((sampleMethod) => sampleMethod.sample_periods as IGetSamplePeriodRecord[])
    .flat(2)
    .map((samplePeriod: IGetSamplePeriodRecord) => ({
      survey_sample_period_id: samplePeriod.survey_sample_period_id,
      survey_sample_method_id: samplePeriod.survey_sample_method_id,
      sample_period_name: `${samplePeriod.start_date} ${samplePeriod.start_time ?? ''} - ${samplePeriod.end_date} ${
        samplePeriod.end_time ?? ''
      }`
    }));

  // The column definitions of the columns to render in the observations table
  const columns = useMemo(
    () => [
      {
        field: 'file',
        description: 'File',
        headerName: 'File',
        editable: true,
        hideable: true,
        flex: 1,
        minWidth: 180,
        disableColumnMenu: true
      },
      SampleSiteColDef({ sampleSiteOptions, hasError: observationsTableContext.hasError }),
      SampleMethodColDef({ sampleMethodOptions, hasError: observationsTableContext.hasError }),
      SamplePeriodColDef({ samplePeriodOptions, hasError: observationsTableContext.hasError }),
      {
        field: 'actions',
        headerName: '',
        type: 'actions',
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        resizable: false,
        renderCell: () => (
          <Button color="primary" variant="contained">
            Review
          </Button>
        )
      }
    ],
    // observationsTableContext is listed as a missing dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <DataGrid
      apiRef={observationsTableContext._muiDataGridApiRef}
      editMode="row"
      // Columns
      columns={columns}
      // Column visibility
      columnVisibilityModel={observationsTableContext.columnVisibilityModel}
      onColumnVisibilityModelChange={observationsTableContext.onColumnVisibilityModelChange}
      // Rows
      rows={[...observationsTableContext.stagedRows, ...observationsTableContext.savedRows]}
      processRowUpdate={observationsTableContext.processRowUpdate}
      // Row modes
      rowModesModel={observationsTableContext.rowModesModel}
      onRowModesModelChange={observationsTableContext.onRowModesModelChange}
      // Pagination
      paginationMode="server"
      rowCount={observationsTableContext.observationCount}
      pageSizeOptions={[25, 50, 100]}
      paginationModel={observationsTableContext.paginationModel}
      onPaginationModelChange={observationsTableContext.setPaginationModel}
      // Sorting
      sortingMode="server"
      sortModel={observationsTableContext.sortModel}
      onSortModelChange={observationsTableContext.setSortModel}
      // Row editing
      onRowEditStart={(params) => observationsTableContext.onRowEditStart(params.id)}
      onRowEditStop={(_params, event) => {
        event.defaultMuiPrevented = true;
      }}
      // Row selection
      checkboxSelection
      disableRowSelectionOnClick
      rowSelectionModel={observationsTableContext.rowSelectionModel}
      onRowSelectionModelChange={observationsTableContext.onRowSelectionModelChange}
      // Styling
      localeText={{
        noRowsLabel: 'No Records'
      }}
      rowHeight={56}
      getRowHeight={() => 'auto'}
      getRowClassName={(params) => (has(observationsTableContext.validationModel, params.row.id) ? 'error' : '')}
      // Loading
      loading={isLoading}
      slots={{
        loadingOverlay: SkeletonTable
      }}
      // Styles
      sx={{
        border: 'none',
        borderRadius: 0,
        '&:after': {
          content: '" "',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 55
        },
        '& .pinnedColumn': {
          position: 'sticky',
          right: 0,
          top: 0,
          borderLeft: '1px solid' + grey[300]
        },
        '& .MuiDataGrid-columnHeaders': {
          position: 'relative',
          background: grey[50]
        },
        '& .MuiDataGrid-columnHeader:focus-within': {
          outline: 'none',
          background: grey[200]
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'text.secondary'
        },
        '& .MuiDataGrid-cell': {
          py: 0.75,
          background: '#fff',
          '&.MuiDataGrid-cell--editing:focus-within': {
            outline: 'none'
          },
          '&.MuiDataGrid-cell--editing': {
            p: 0.5,
            backgroundColor: cyan[100]
          }
        },
        '& .MuiDataGrid-row--editing': {
          boxShadow: 'none',
          backgroundColor: cyan[50],
          '& .MuiDataGrid-cell': {
            backgroundColor: cyan[50]
          },
          '&.error': {
            '& .MuiDataGrid-cell, .MuiDataGrid-cell--editing': {
              backgroundColor: 'rgb(251, 237, 238)'
            }
          }
        },
        '& .MuiDataGrid-editInputCell': {
          border: '1px solid #ccc',
          '&:hover': {
            borderColor: 'primary.main'
          },
          '&.Mui-focused': {
            borderColor: 'primary.main',
            outlineWidth: '2px',
            outlineStyle: 'solid',
            outlineColor: 'primary.main',
            outlineOffset: '-2px'
          }
        },
        '& .MuiInputBase-root': {
          height: '40px',
          borderRadius: '4px',
          background: '#fff',
          fontSize: '0.875rem',
          '&.MuiDataGrid-editInputCell': {
            padding: 0
          }
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: '4px',
          background: '#fff',
          border: 'none',
          '&:hover': {
            borderColor: 'primary.main'
          },
          '&:hover > fieldset': {
            border: '1px solid primary.main'
          }
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: '1px solid ' + grey[300],
          '&.Mui-focused': {
            borderColor: 'primary.main'
          }
        },
        '& .MuiDataGrid-virtualScrollerContent, .MuiDataGrid-overlay': {
          background: grey[100]
        }
      }}
    />
  );
};

export default StagedObservationsTable;
