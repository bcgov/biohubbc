import { cyan, grey } from '@mui/material/colors';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { CodesContext } from 'contexts/codesContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { IObservationTableRow, ObservationsTableContext } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import {
  ObservationActionsColDef,
  ObservationCountColDef,
  ObservationDateColDef,
  ObservationLatitudeColDef,
  ObservationLongitudeColDef,
  ObservationTimeColDef,
  SampleMethodColDef,
  SamplePeriodColDef,
  SampleSiteColDef,
  TaxonomyColDef
} from 'features/surveys/observations/observations-table/GridColumnDefinitions';
import {
  IGetSampleLocationRecord,
  IGetSampleMethodRecord,
  IGetSamplePeriodRecord
} from 'interfaces/useSurveyApi.interface';
import { has } from 'lodash-es';
import { useContext, useMemo } from 'react';
import { getCodesName } from 'utils/Utils';

type ISampleSiteOption = {
  survey_sample_site_id: number;
  sample_site_name: string;
};

type ISampleMethodOption = {
  survey_sample_method_id: number;
  survey_sample_site_id: number;
  sample_method_name: string;
};

type ISamplePeriodOption = {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  sample_period_name: string;
};
export interface ISpeciesObservationTableProps {
  isLoading?: boolean;
}

const ObservationsTable = (props: ISpeciesObservationTableProps) => {
  const observationsTableContext = useContext(ObservationsTableContext);
  const observationsContext = useContext(ObservationsContext);
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const hasLoadedCodes = Boolean(codesContext.codesDataLoader.data);

  const apiRef = observationsTableContext._muiDataGridApiRef;

  const isLoading = useMemo(() => {
    return [
      observationsContext.observationsDataLoader.isLoading && !observationsContext.observationsDataLoader.hasLoaded,
      props.isLoading,
      surveyContext.sampleSiteDataLoader.isLoading,
      observationsTableContext.isLoading,
      observationsTableContext.isSaving
    ].some(Boolean);
  }, [
    observationsContext.observationsDataLoader.isLoading,
    observationsContext.observationsDataLoader.hasLoaded,
    props.isLoading,
    surveyContext.sampleSiteDataLoader.isLoading,
    observationsTableContext.isLoading,
    observationsTableContext.isSaving
  ]);

  // Collect sample sites
  const surveySampleSites: IGetSampleLocationRecord[] = surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [];
  const sampleSiteOptions: ISampleSiteOption[] =
    surveySampleSites.map((site) => ({
      survey_sample_site_id: site.survey_sample_site_id,
      sample_site_name: site.name
    })) ?? [];

  // Collect sample methods
  const surveySampleMethods: IGetSampleMethodRecord[] = surveySampleSites
    .filter((sampleSite) => Boolean(sampleSite.sample_methods))
    .map((sampleSite) => sampleSite.sample_methods as IGetSampleMethodRecord[])
    .flat(2);
  const sampleMethodOptions: ISampleMethodOption[] = hasLoadedCodes
    ? surveySampleMethods.map((method) => ({
        survey_sample_method_id: method.survey_sample_method_id,
        survey_sample_site_id: method.survey_sample_site_id,
        sample_method_name:
          getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method.method_lookup_id) ?? ''
      }))
    : [];

  // Collect sample periods
  const samplePeriodOptions: ISamplePeriodOption[] = surveySampleMethods
    .filter((sampleMethod) => Boolean(sampleMethod.sample_periods))
    .map((sampleMethod) => sampleMethod.sample_periods as IGetSamplePeriodRecord[])
    .flat(2)
    .map((samplePeriod: IGetSamplePeriodRecord) => ({
      survey_sample_period_id: samplePeriod.survey_sample_period_id,
      survey_sample_method_id: samplePeriod.survey_sample_method_id,
      sample_period_name: `${samplePeriod.start_date} ${samplePeriod.start_time || ''} - ${samplePeriod.end_date} ${
        samplePeriod.end_time || ''
      }`
    }));

  const observationColumns: GridColDef<IObservationTableRow>[] = [
    TaxonomyColDef({ hasError: observationsTableContext.hasError }),
    SampleSiteColDef({ sampleSiteOptions, hasError: observationsTableContext.hasError }),
    SampleMethodColDef({ sampleMethodOptions, hasError: observationsTableContext.hasError }),
    SamplePeriodColDef({ samplePeriodOptions, hasError: observationsTableContext.hasError }),
    ObservationCountColDef({ hasError: observationsTableContext.hasError }),
    ObservationDateColDef({ hasError: observationsTableContext.hasError }),
    ObservationTimeColDef({ hasError: observationsTableContext.hasError }),
    ObservationLatitudeColDef({ hasError: observationsTableContext.hasError }),
    ObservationLongitudeColDef({ hasError: observationsTableContext.hasError }),
    ...observationsTableContext.additionalColumns.map((item) => item.colDef),
    ObservationActionsColDef()
  ];

  return (
    <>
      {isLoading && <SkeletonTable />}

      <DataGrid
        checkboxSelection
        disableRowSelectionOnClick
        rowHeight={56}
        apiRef={apiRef}
        editMode="row"
        columns={observationColumns}
        rows={observationsTableContext.rows}
        rowCount={observationsTableContext.observationCount}
        paginationModel={observationsTableContext.paginationModel}
        pageSizeOptions={[10, 15, 20]}
        onPaginationModelChange={(model) => observationsTableContext.updatePaginationModel(model)}
        paginationMode="server"
        sortingMode="server"
        sortModel={observationsTableContext.sortModel}
        onSortModelChange={(model) => observationsTableContext.updateSortModel(model)}
        onRowEditStart={(params) => observationsTableContext.onRowEditStart(params.id)}
        onRowEditStop={(_params, event) => {
          event.defaultMuiPrevented = true;
        }}
        localeText={{
          noRowsLabel: 'No Records'
        }}
        onRowSelectionModelChange={observationsTableContext.onRowSelectionModelChange}
        rowSelectionModel={observationsTableContext.rowSelectionModel}
        getRowHeight={() => 'auto'}
        getRowClassName={(params) => (has(observationsTableContext.validationModel, params.row.id) ? 'error' : '')}
        sx={{
          border: 'none',
          borderRadius: 0,
          '&:after': {
            content: '" "',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 100,
            height: 55,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%)'
          },
          '& .pinnedColumn': {
            position: 'sticky',
            right: 0,
            top: 0,
            borderLeft: '1px solid' + grey[300]
          },
          '& .MuiDataGrid-columnHeaders': {
            position: 'relative'
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
    </>
  );
};

export default ObservationsTable;
