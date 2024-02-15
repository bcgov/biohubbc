import { cyan, grey } from '@mui/material/colors';
import { DataGrid, GridColDef, GridRowModesModel } from '@mui/x-data-grid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useObservationsContext, useObservationTableContext } from 'hooks/useContext';
import { has } from 'lodash-es';
import { useContext, useMemo } from 'react';

export interface ISpeciesObservationTableProps {
  /**
   * Manually control the loading state of the table.
   *
   * @type {boolean}
   * @memberof ISpeciesObservationTableProps
   */
  isLoading?: boolean;
  /**
   * The row modes model.
   *
   * Defines which rows are in edit mode.
   *
   * @type {GridRowModesModel}
   * @memberof ISpeciesObservationTableProps
   */
  rowModesModel: GridRowModesModel;
  /**
   * The column definitions of the columns to render in the table.
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof ISpeciesObservationTableProps
   */
  columns: GridColDef<IObservationTableRow>[];
}

const ObservationsTable = (props: ISpeciesObservationTableProps) => {
  const surveyContext = useContext(SurveyContext);

  const observationsContext = useObservationsContext();

  const observationsTableContext = useObservationTableContext();

  const isLoading = useMemo(() => {
    return props.isLoading !== undefined
      ? props.isLoading
      : [
          observationsContext.observationsDataLoader.isLoading && !observationsContext.observationsDataLoader.hasLoaded,
          surveyContext.sampleSiteDataLoader.isLoading,
          observationsTableContext.isLoading,
          observationsTableContext.isSaving
        ].some(Boolean);
  }, [
    props.isLoading,
    observationsContext.observationsDataLoader.isLoading,
    observationsContext.observationsDataLoader.hasLoaded,
    surveyContext.sampleSiteDataLoader.isLoading,
    observationsTableContext.isLoading,
    observationsTableContext.isSaving
  ]);

  return (
    <>
      {isLoading && <SkeletonTable />}

      <DataGrid
        checkboxSelection
        disableRowSelectionOnClick
        rowHeight={56}
        apiRef={observationsTableContext._muiDataGridApiRef}
        editMode="row"
        columns={props.columns}
        rows={observationsTableContext.rows}
        rowModesModel={props.rowModesModel}
        rowCount={observationsTableContext.observationCount}
        paginationModel={observationsTableContext.paginationModel}
        pageSizeOptions={[25, 50, 100]}
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
