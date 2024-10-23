import { cyan, grey } from '@mui/material/colors';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  GenericDateColDef,
  GenericLatitudeColDef,
  GenericLongitudeColDef,
  GenericTimeColDef
} from 'components/data-grid/GenericGridColumnDefinitions';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { IManualTelemetryTableRow } from 'contexts/telemetryTableContext';
import {
  DeploymentColDef,
  DeviceColDef,
  TelemetryTypeColDef
} from 'features/surveys/telemetry/table/utils/GridColumnDefinitions';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext, useTelemetryDataContext, useTelemetryTableContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { IAnimalDeploymentWithCritter } from 'interfaces/useSurveyApi.interface';
import { useEffect, useMemo } from 'react';

const MANUAL_TELEMETRY_TYPE = 'MANUAL';

interface IManualTelemetryTableProps {
  isLoading: boolean;
}

export const TelemetryTable = (props: IManualTelemetryTableProps) => {
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const telemetryDataContext = useTelemetryDataContext();
  const telemetryTableContext = useTelemetryTableContext();

  const deploymentDataLoader = telemetryDataContext.deploymentsDataLoader;
  const critterDataLoader = useDataLoader(biohubApi.survey.getSurveyCritters);

  useEffect(() => {
    deploymentDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    critterDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [critterDataLoader, deploymentDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  /**
   * Merges critters with associated deployments
   *
   * @returns {ICritterDeployment[]} Critter deployments
   */
  const critterDeployments: IAnimalDeploymentWithCritter[] = useMemo(() => {
    const critterDeployments: IAnimalDeploymentWithCritter[] = [];
    const critters = critterDataLoader.data ?? [];
    const deployments = deploymentDataLoader.data?.deployments ?? [];

    if (!critters.length || !deployments.length) {
      return [];
    }

    const critterMap = new Map(critters.map((critter) => [critter.critterbase_critter_id, critter]));

    deployments.forEach((deployment) => {
      const critter = critterMap.get(String(deployment.critterbase_critter_id));
      if (critter) {
        critterDeployments.push({ critter, deployment });
      }
    });

    return critterDeployments;
  }, [critterDataLoader.data, deploymentDataLoader.data]);

  const columns: GridColDef<IManualTelemetryTableRow>[] = [
    DeploymentColDef({ critterDeployments, hasError: telemetryTableContext.hasError }),
    // TODO: Show animal nickname as a column
    DeviceColDef({ critterDeployments }),
    GenericDateColDef({ field: 'date', headerName: 'Date', hasError: telemetryTableContext.hasError }),
    GenericTimeColDef({ field: 'time', headerName: 'Time', hasError: telemetryTableContext.hasError }),
    GenericLatitudeColDef({ field: 'latitude', headerName: 'Latitude', hasError: telemetryTableContext.hasError }),
    GenericLongitudeColDef({ field: 'longitude', headerName: 'Longitude', hasError: telemetryTableContext.hasError }),
    TelemetryTypeColDef()
  ];

  return (
    <DataGrid
      // Ref
      apiRef={telemetryTableContext._muiDataGridApiRef}
      // Columns
      columns={columns.map((column) => ({ ...column, flex: 1, minWidth: 120 }))}
      // Rows
      rows={telemetryTableContext.rows}
      // DataGrid Models
      rowModesModel={telemetryTableContext.rowModesModel}
      onRowModesModelChange={telemetryTableContext.onRowModesModelChange}
      rowSelectionModel={telemetryTableContext.rowSelectionModel}
      onRowSelectionModelChange={telemetryTableContext.onRowSelectionModelChange}
      columnVisibilityModel={telemetryTableContext.columnVisibilityModel}
      onRowEditStart={(params) => telemetryTableContext.onRowEditStart(params.id)}
      // Select rows
      checkboxSelection
      disableRowSelectionOnClick
      isRowSelectable={(params) => params.row.telemetry_type === MANUAL_TELEMETRY_TYPE}
      loading={props.isLoading}
      // Row edit
      editMode="row"
      isCellEditable={(params) => params.row.telemetry_type === MANUAL_TELEMETRY_TYPE}
      onRowEditStop={(_params, event) => {
        event.defaultMuiPrevented = true;
      }}
      // Styling
      rowHeight={56}
      localeText={{
        noRowsLabel: 'No Records'
      }}
      getRowHeight={() => 'auto'}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 25 }
        }
      }}
      pageSizeOptions={[25, 50, 100]}
      slots={{
        loadingOverlay: SkeletonTable
      }}
      sx={{
        border: 'none',
        borderRadius: 0,
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
